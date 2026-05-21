import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { complianceLogs, users, bookings } from '../db/schema.js';

export const listComplianceLogs = async (query: any) => {
  const { limit = 10, page = 1 } = query;
  const limitVal = typeof limit === 'string' ? parseInt(limit, 10) : limit;
  const offset = (page - 1) * limitVal;

  const items = await db.query.complianceLogs.findMany({
    limit: limitVal,
    offset,
    orderBy: [desc(complianceLogs.createdAt)],
  });

  return items;
};

export const fileReturn = async (data: any) => {
  const { action = 'tax_submission', totalRevenue, totalMri, totalBookingFees, period, notes } = data;

  const [newLog] = await db.insert(complianceLogs).values({
    action: action as any,
    status: 'acknowledged',
    totalRevenueKes: totalRevenue !== undefined && totalRevenue !== null ? String(totalRevenue) : null,
    totalBookingFees: totalBookingFees !== undefined && totalBookingFees !== null ? String(totalBookingFees) : null,
    notes: notes || `Monthly Revenue Return for ${period || 'current period'}.${totalMri !== undefined ? ` 5% Tax on Booking Fees: KES ${totalMri}` : ''}`,
  }).returning();

  return newLog;
};

export const sendRevenueToGava = async (payload: any) => {
  const { bookingId, totalRevenueKes, totalBookingFees, initiatedById, forceFail } = payload;

  if (forceFail) {
    throw new Error('Simulated Network Outage');
  }

  const sandboxUrl = process.env.KRA_SANDBOX_URL || 'http://localhost:9999';
  const apigeeAppId = process.env.KRA_APIGEE_APP_ID || '';
  const kraPin = process.env.KRA_PIN || '';

  const response = await fetch(`${sandboxUrl}/etims/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Apigee-App-Id': apigeeAppId,
    },
    body: JSON.stringify({
      bookingId,
      totalRevenueKes,
      totalBookingFees,
      kraPin,
    }),
  });

  if (!response.ok) {
    throw new Error(`KRA Gava sync failed with status ${response.status}`);
  }

  const resData = await response.json();
  const transactionId = resData.transactionId || `MOCK_GAVA_${Date.now()}`;

  const [newLog] = await db.insert(complianceLogs).values({
    initiatedById: initiatedById ? Number(initiatedById) : null,
    action: 'revenue_report',
    status: 'submitted_sandbox',
    totalRevenueKes: totalRevenueKes ? String(totalRevenueKes) : null,
    totalBookingFees: totalBookingFees ? String(totalBookingFees) : null,
    bookingId: bookingId ? Number(bookingId) : null,
    gavaConnectRequestId: transactionId,
    gavaConnectResponse: JSON.stringify(resData),
    acknowledgedAt: new Date(),
    notes: `KRA Gava sync successful. Transaction ID: ${transactionId}`,
  }).returning();

  return newLog;
};

export const verifyKraPin = async (userId: number, kraPin: string) => {
  const pinRegex = /^[A-Z]\d{9}[A-Z]$/i;
  if (!pinRegex.test(kraPin)) {
    return { valid: false, reason: 'Invalid KRA PIN format. PIN must be 11 characters starting and ending with a letter.' };
  }

  await db.update(users)
    .set({ kraPin, accountStatus: 'active', updatedAt: new Date() })
    .where(eq(users.userId, userId));

  return { valid: true };
};

export const verifyNationalId = async (userId: number, nationalId: string) => {
  if (!/^\d{6,10}$/.test(nationalId)) {
    throw new Error('Invalid National ID format. Must be between 6 and 10 digits.');
  }

  await db.update(users)
    .set({ nationalId, accountStatus: 'active', updatedAt: new Date() })
    .where(eq(users.userId, userId));

  return { success: true };
};

export const generateETIMSReceipt = async (bookingId: number) => {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId)
  });
  if (!booking) throw new Error('Booking not found');
  
  return await sendRevenueToGava({
    bookingId,
    totalRevenueKes: Number(booking.bookingFee),
    totalBookingFees: 1500,
    initiatedById: booking.seekerId
  });
};

export const voidRevenueInGava = async (bookingId: number) => {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, bookingId)
  });
  if (!booking) throw new Error('Booking not found');

  const [newLog] = await db.insert(complianceLogs).values({
    initiatedById: booking.seekerId,
    action: 'revenue_report',
    status: 'submitted_sandbox',
    totalRevenueKes: String(-Number(booking.bookingFee)),
    totalBookingFees: '-1500',
    bookingId: bookingId,
    notes: `Voided revenue report (cancellation) for Booking ID: ${bookingId}`,
  }).returning();

  return newLog;
};

