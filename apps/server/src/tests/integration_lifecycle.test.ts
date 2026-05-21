import { db } from '../db/db.js';
import { bookings, payments, jobs, complianceLogs, houses, users } from '../db/schema.js';
import { handleMpesaCallback } from '../services/payments.service.js';
import { runWorker } from '../services/jobs.service.js';
import { eq, and, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';

// Mock Env Vars for Testing
process.env.KRA_PIN = 'A000TEST123X';
process.env.KRA_APIGEE_APP_ID = '00000000-0000-0000-0000-000000000000';
process.env.KRA_SANDBOX_URL = 'http://localhost:9999';

// Setup Mock for fetch (GavaConnect)
(global as any).fetch = async (url: string) => {
  return {
    ok: true,
    json: async () => ({ transactionId: `MOCK_KRA_${Date.now()}` }),
  };
};

async function runIntegrationTest() {
  console.log('--- STARTING TRANSACTION LIFECYCLE INTEGRATION TEST ---');

  let seekerId: number | undefined;
  let landlordId: number | undefined;
  let houseId: number | undefined;
  let bookingId: number | undefined;

  try {
    // 1. Setup Test Data
    const [seeker] = await db.insert(users).values({
      fullName: 'Integration Seeker',
      email: `seeker_${Date.now()}@test.com`,
      phone: `2547${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: 'tenant',
      accountStatus: 'active',
    }).returning();
    seekerId = seeker.userId;

    const [landlord] = await db.insert(users).values({
      fullName: 'Integration Landlord',
      email: `landlord_${Date.now()}@test.com`,
      phone: `2547${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: 'landlord',
      accountStatus: 'active',
    }).returning();
    landlordId = landlord.userId;

    const [house] = await db.insert(houses).values({
      landlordId: landlordId,
      title: 'Test Integration House',
      bookingFee: '1500.00',
      houseType: 'one_bedroom',
      furnishing: 'unfurnished',
      bedrooms: 1,
      bathrooms: 1,
      monthlyRent: '15000.00',
      status: 'active',
    }).returning();
    houseId = house.houseId;

    console.log(`✅ Created test seeker ${seekerId}, landlord ${landlordId}, house ${houseId}`);

    const checkoutId = `TEST_MPESA_${Date.now()}`;
    
    // Create a pending booking
    const [booking] = await db.insert(bookings).values({
      seekerId: seekerId,
      houseId: houseId,
      status: 'pending_payment',
      mpesaCheckoutRequestId: checkoutId,
      bookingFee: "1500",
    }).returning();
    bookingId = booking.bookingId;

    console.log(`✅ Created pending booking ${booking.bookingId}`);

    // 2. Simulate M-Pesa Callback (The Trigger)
    const mockCallbackBody = {
      Body: {
        stkCallback: {
          CheckoutRequestID: checkoutId,
          ResultCode: 0,
          ResultDesc: "The service was accepted successfully",
          CallbackMetadata: { Item: [] }
        }
      }
    };

    console.log('⏳ Processing M-Pesa Callback...');
    await handleMpesaCallback(mockCallbackBody);

    // 3. Verify Database State (Atomicity Check)
    const confirmedBooking = await db.query.bookings.findFirst({
       where: eq(bookings.bookingId, booking.bookingId)
    });
    const payment = await db.query.payments.findFirst({
        where: eq(payments.bookingId, booking.bookingId)
    });
    const job = await db.query.jobs.findFirst({
        where: and(eq(jobs.type, 'kra_etims_sync'), eq(sql`${jobs.payload}->>'bookingId'`, booking.bookingId.toString()))
    } as any);

    if (confirmedBooking?.status !== 'paid') throw new Error('Booking status update failed');
    if (!payment) throw new Error('Payment record not created');
    if (!job) throw new Error('Transactional Job Outbox failed - no job found');

    console.log('✅ Atomicity Verified: Booking Updated, Payment Logged, Job Enqueued.');

    // 4. Simulate Worker Process
    console.log('⏳ Running Job Worker (Simulation)...');
    
    // For test purposes, trigger the sync function directly
    const { sendRevenueToGava } = await import('../services/compliance.service.js');
    await sendRevenueToGava(job.payload as any);

    // 5. Verify Compliance Audit Trail
    const log = await db.query.complianceLogs.findFirst({
        where: eq(complianceLogs.bookingId, booking.bookingId)
    });

    if (!log) throw new Error('Compliance log NOT generated after job process');
    console.log(`✅ Lifecycle Complete: Compliance Log #${log.logId} verified with status ${log.status}`);

    // Cleanup dynamic test data
    if (bookingId) await db.delete(bookings).where(eq(bookings.bookingId, bookingId));
    if (payment) await db.delete(payments).where(eq(payments.bookingId, bookingId));
    if (job) await db.delete(jobs).where(eq(jobs.jobId, job.jobId));
    if (log) await db.delete(complianceLogs).where(eq(complianceLogs.logId, log.logId));
    if (houseId) await db.delete(houses).where(eq(houses.houseId, houseId));
    if (seekerId && landlordId) {
      await db.delete(users).where(sql`${users.userId} IN (${seekerId}, ${landlordId})`);
    }
    console.log('✅ Cleaned up dynamic test data');

    console.log('--- ALL INTEGRATION LIFECYCLE TESTS PASSED ---');
    process.exit(0);
  } catch (error: any) {
    console.error('--- INTEGRATION TEST FAILED ---');
    console.error(error.message);
    
    // Attempt cleanup on failure
    try {
      if (bookingId) await db.delete(bookings).where(eq(bookings.bookingId, bookingId));
      if (houseId) await db.delete(houses).where(eq(houses.houseId, houseId));
      if (seekerId && landlordId) {
        await db.delete(users).where(sql`${users.userId} IN (${seekerId}, ${landlordId})`);
      }
    } catch (cleanupErr) {}

    process.exit(1);
  }
}

runIntegrationTest();
