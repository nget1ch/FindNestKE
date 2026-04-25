import '../load-env.js';
import { db } from './db.js';
import {
  complianceLogs,
  bookings,
  payments,
  users,
  houses,
} from './schema.js';
import { eq, and, sql, inArray } from 'drizzle-orm';

async function seed() {
  console.log('🧪 Seeding Supplementary Filing Scenario...');
  
  // 1. Target Period: January 2026
  const period = 'January 2026';

  // Clear existing data to avoid constraint issues
  await db.delete(payments);
  await db.delete(bookings);
  await db.delete(complianceLogs);
  
  // 2. Seed an EXISTING filing for Jan 2026
  console.log('📝 Recording an initial filing for KES 5,000...');
  await db.insert(complianceLogs).values({
    action: 'tax_submission',
    status: 'acknowledged',
    totalRevenueKes: '5000.00',
    totalBookingFees: '5000.00',
    notes: `Initial Return for ${period}`,
    createdAt: new Date(),
  });

  // 3. Find a Tenant and multiple Houses
  const tenant = await db.query.users.findFirst({ where: eq(users.role, 'tenant') });
  const activeHouses = await db.query.houses.findMany({ 
    where: eq(houses.status, 'active'),
    limit: 2
  });

  if (!tenant || activeHouses.length < 2) {
    throw new Error('Need at least one tenant and two active houses to seed revenue.');
  }

  // 4. Seed bookings totaling KES 7,500 (meaning 2,500 is unfiled)
  console.log('💰 Seeding new bookings totaling KES 7,500 for January...');
  const newBookings = [
    {
      seekerId: tenant.userId,
      houseId: activeHouses[0].houseId,
      status: 'confirmed' as any,
      bookingFee: '4000.00',
      totalPrice: '44000.00',
      moveInDate: new Date(2026, 0, 1).toISOString(),
      confirmedAt: new Date(2026, 0, 15),
    },
    {
      seekerId: tenant.userId,
      houseId: activeHouses[1].houseId,
      status: 'confirmed' as any,
      bookingFee: '3500.00',
      totalPrice: '38500.00',
      moveInDate: new Date(2026, 0, 1).toISOString(),
      confirmedAt: new Date(2026, 0, 20),
    }
  ];

  const inserted = await db.insert(bookings).values(newBookings).returning();
  
  for (const b of inserted) {
    await db.insert(payments).values({
      bookingId: b.bookingId,
      payerId: b.seekerId,
      amount: b.bookingFee,
      status: 'completed',
      method: 'mpesa',
      paidAt: new Date(),
    });
  }

  console.log('✅ Ready! January 2026 now has KES 5,000 filed but KES 7,500 in total revenue.');
  console.log('👉 Action: Open Admin Dashboard, select January 2026, and look for "File Supplementary Return".');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
