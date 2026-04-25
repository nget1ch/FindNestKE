import { eq, desc } from 'drizzle-orm';
import { db } from '../db/db.js';
import { complianceLogs } from '../db/schema.js';

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
    totalRevenueKes: String(totalRevenue),
    totalBookingFees: String(totalBookingFees),
    notes: notes || `Monthly Revenue Return for ${period}. 5% Tax on Booking Fees: KES ${totalMri}`,
  }).returning();

  return newLog;
};
