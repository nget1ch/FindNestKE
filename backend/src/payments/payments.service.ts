import { eq, sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import { bookings, payments, houses, jobs } from '../db/schema.js';
import { initiateSTKPush, parseCallback, querySTKStatus } from './mpesa.service.js';
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set (only needed for card payment endpoints).');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// ========== M-PESA FLOW ==========
interface MpesaInitParams {
  houseId: number;
  userId: number;
  moveInDate?: string;
  occupants?: string;
  notes?: string;
  phone: string;
}

export async function createPendingBookingAndInitiateMpesa({
  houseId,
  userId,
  moveInDate,
  notes,
  phone,
}: MpesaInitParams) {
  // Fetch house details (title and booking fee)
  const [house] = await db
    .select({ title: houses.title, bookingFee: houses.bookingFee })
    .from(houses)
    .where(eq(houses.houseId, houseId))
    .limit(1);

  if (!house) throw new Error('House not found');
  const amount = Number(house.bookingFee);
  if (amount <= 0) throw new Error('Invalid booking fee amount');

  // Pre-emptive fix: Remove any existing non-finalized bookings to avoid unique constraint violations
  // This allows the user to retry the payment flow if a previous attempt stayed in 'pending' or 'failed' status.
  await db.delete(bookings).where(sql`${bookings.seekerId} = ${userId} AND ${bookings.houseId} = ${houseId} AND ${bookings.status} NOT IN ('paid', 'confirmed')`);

  // Create pending booking with the dynamic fee
  const [newBooking] = await db.insert(bookings).values({
    seekerId: userId,
    houseId,
    moveInDate: moveInDate || null,
    specialRequests: notes,
    status: 'pending',
    paymentMethod: 'mpesa',
    bookingFee: amount.toString(),
  }).returning();

  try {
    const accountRef = `BOOK-${newBooking.bookingId}`;
    const description = `Booking fee for ${house.title}`;

    const stkResult = await initiateSTKPush({ phone, amount, accountRef, description });

    if (!stkResult.success) {
      await db.delete(bookings).where(eq(bookings.bookingId, newBooking.bookingId));
      throw new Error(`STK push failed: ${stkResult.responseDescription}`);
    }

    await db.update(bookings)
      .set({ mpesaCheckoutRequestId: stkResult.checkoutRequestId })
      .where(eq(bookings.bookingId, newBooking.bookingId));

    return {
      bookingId: newBooking.bookingId,
      checkoutRequestId: stkResult.checkoutRequestId,
      merchantRequestId: stkResult.merchantRequestId,
      customerMessage: stkResult.customerMessage,
    };
  } catch (error) {
    await db.delete(bookings).where(eq(bookings.bookingId, newBooking.bookingId));
    throw error;
  }
}

import logger from '../utils/logger.js';

export async function handleMpesaCallback(rawBody: any) {
  const callbackData = parseCallback(rawBody);
  const { checkoutRequestId, resultCode, resultDesc, amount, mpesaReceiptNumber, transactionDate } = callbackData;

  const [existingBooking] = await db.select()
    .from(bookings)
    .where(eq(bookings.mpesaCheckoutRequestId, checkoutRequestId))
    .limit(1);

  if (!existingBooking) {
    logger.error('M-Pesa callback for unknown booking', { checkoutRequestId });
    return { success: false, message: 'Booking not found' };
  }

  if (resultCode === 0) {
    logger.info('M-Pesa payment success. Processing audit trail.', { bookingId: existingBooking.bookingId, receipt: mpesaReceiptNumber });

    // IDEMPOTENCY CHECK: Ensure we haven't processed this receipt already
    if (mpesaReceiptNumber) {
      const [existingPayment] = await db.select()
        .from(payments)
        .where(eq(payments.mpesaReceiptNumber, mpesaReceiptNumber))
        .limit(1);

      if (existingPayment) {
        logger.info('M-Pesa callback ignored: Receipt already processed (Idempotency confirmed)', { mpesaReceiptNumber });
        return { success: true, message: 'Already processed', bookingId: existingBooking.bookingId };
      }
    }

    await db.transaction(async (trx) => {
      await trx.update(bookings)
        .set({ status: 'paid', confirmedAt: new Date() })
        .where(eq(bookings.bookingId, existingBooking.bookingId));

      await trx.insert(payments).values({
        bookingId: existingBooking.bookingId,
        payerId: existingBooking.seekerId,
        amount: existingBooking.bookingFee,
        method: 'mpesa',
        status: 'completed',
        mpesaReceiptNumber,
        mpesaTransactionDate: transactionDate ? new Date(transactionDate.toString().replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6')) : new Date(),
        mpesaCheckoutRequestId: checkoutRequestId,
        paidAt: new Date(),
      });

      // Transactional Outbox: Enqueue compliance job WITHIN the transaction
      // This ensures if the payment is saved, the job MUST eventually run.
      const payload = {
        bookingId: existingBooking.bookingId,
        totalRevenueKes: Number(existingBooking.bookingFee),
        totalBookingFees: 1500, // Matched with pricing engine
        initiatedById: existingBooking.seekerId,
      };

      await trx.insert(jobs).values({
        type: 'kra_etims_sync',
        payload: payload,
        status: 'pending',
      });
    });

    logger.info('M-Pesa payment processed and eTIMS job enqueued', { bookingId: existingBooking.bookingId });
    return { success: true, bookingId: existingBooking.bookingId };
  } else {
    logger.warn('M-Pesa payment rejected', { bookingId: existingBooking.bookingId, resultDesc });
    // UPDATE: Do NOT delete the booking. Set status to 'failed' instead.
    await db.update(bookings)
      .set({ status: 'failed' })
      .where(eq(bookings.bookingId, existingBooking.bookingId));
    return { success: false, message: resultDesc };
  }
}

// ========== STRIPE FLOW ==========
interface StripeIntentParams {
  houseId: number;
  userId: number;
  moveInDate?: string;
  occupants?: string;
  notes?: string;
  // No amount parameter – we'll fetch from house
}

export async function createPendingBookingAndStripeIntent({
  houseId,
  userId,
  moveInDate,
  notes,
}: StripeIntentParams) {
  // Fetch booking fee from house
  const [house] = await db
    .select({ bookingFee: houses.bookingFee })
    .from(houses)
    .where(eq(houses.houseId, houseId))
    .limit(1);

  if (!house) throw new Error('House not found');
  const amount = Number(house.bookingFee);
  if (amount <= 0) throw new Error('Invalid booking fee amount');

  const [newBooking] = await db.insert(bookings).values({
    seekerId: userId,
    houseId,
    moveInDate: moveInDate || null,
    specialRequests: notes,
    status: 'pending',
    paymentMethod: 'card',
    bookingFee: amount.toString(),
  }).returning();

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'kes',
      metadata: { bookingId: newBooking.bookingId },
    });

    return {
      bookingId: newBooking.bookingId,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    await db.delete(bookings).where(eq(bookings.bookingId, newBooking.bookingId));
    throw error;
  }
}

export async function confirmStripePayment(paymentIntentId: string, bookingId: number) {
  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    await db.delete(bookings).where(eq(bookings.bookingId, bookingId));
    throw new Error('Payment not successful');
  }

  await db.transaction(async (trx) => {
    await trx.update(bookings)
      .set({ status: 'paid', confirmedAt: new Date() })
      .where(eq(bookings.bookingId, bookingId));

    const [booking] = await trx.select({ seekerId: bookings.seekerId, bookingFee: bookings.bookingFee })
      .from(bookings)
      .where(eq(bookings.bookingId, bookingId));
    await trx.insert(payments).values({
      bookingId,
      payerId: booking.seekerId,
      amount: booking.bookingFee, // use stored fee
      method: 'card',
      status: 'completed',
      transactionReference: paymentIntent.id,
      paidAt: new Date(),
    });

    // Same pattern as M-Pesa flow – guarantees atomicity and resilience
    const payload = {
      bookingId,
      totalRevenueKes: Number(booking.bookingFee),
      totalBookingFees: 1500, // Matched with pricing engine
      initiatedById: booking.seekerId,
    };

    await trx.insert(jobs).values({
      type: 'kra_etims_sync',
      payload: payload,
      status: 'pending',
    });
  });

  return { success: true, bookingId };
}

// ========== STATUS SYNC (handles missed callbacks) ==========
export async function syncMpesaPaymentStatus(booking: any) {
  if (booking.status !== 'pending' || !booking.mpesaCheckoutRequestId) return booking;

  // We actively query M-Pesa if the booking is still pending.
  // This is a fallback for when the callback is delayed or blocked (e.g., local tunnel issues).
  const queryResult = await querySTKStatus(booking.mpesaCheckoutRequestId);

  if (queryResult.success) {
    // ResultCode 0 means SUCCESS. However, Query API doesn't return the receipt number.
    // We still need the callback to create a valid payment record with receipt.
    // But if ResultCode is non-zero, it's a definite failure (e.g., 1032 = Cancelled).
    if (queryResult.resultCode !== 0) {
      logger.info('M-Pesa status query revealed failure', { bookingId: booking.bookingId, resultCode: queryResult.resultCode });
      const [updated] = await db.update(bookings)
        .set({ status: 'failed' })
        .where(eq(bookings.bookingId, booking.bookingId))
        .returning();
      return updated;
    }
  } else {
    // If the request is not found or expired, mark as failed
    if (queryResult.resultDesc?.toLowerCase().includes('not found') || 
        queryResult.resultDesc?.toLowerCase().includes('expired')) {
      logger.warn('M-Pesa status query: Request not found or expired', { bookingId: booking.bookingId });
      const [updated] = await db.update(bookings)
        .set({ status: 'failed' })
        .where(eq(bookings.bookingId, booking.bookingId))
        .returning();
      return updated;
    }
  }

  return booking;
}

// ========== STATUS POLLING (unchanged, but ensure it returns correct amount) ==========
export async function getPaymentStatusByCheckoutId(checkoutRequestId: string) {
  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.mpesaCheckoutRequestId, checkoutRequestId))
    .limit(1);

  if (!booking) return { status: 'failed', message: 'Transaction not found' };

  // Sync with M-Pesa if still pending
  const syncedBooking = await syncMpesaPaymentStatus(booking);

  if (syncedBooking.status === 'paid' || syncedBooking.status === 'confirmed') {
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.bookingId, booking.bookingId))
      .limit(1);
    return {
      status: 'completed',
      amount: payment?.amount || booking.bookingFee,
      transactionId: payment?.mpesaReceiptNumber || payment?.transactionReference || 'N/A',
    };
  } else if (syncedBooking.status === 'pending') {
    return { status: 'pending' };
  } else {
    return { status: 'failed', message: 'Payment was not successful' };
  }
}

export async function getPaymentStatusByBookingId(bookingId: number) {
  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.bookingId, bookingId))
    .limit(1);

  if (!booking) return { status: 'failed', message: 'Booking not found' };

  // Sync with M-Pesa if still pending
  const syncedBooking = await syncMpesaPaymentStatus(booking);

  if (syncedBooking.status === 'paid' || syncedBooking.status === 'confirmed') {
    const [payment] = await db.select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .limit(1);
    return {
      status: 'completed',
      amount: payment?.amount || booking.bookingFee,
      transactionId: payment?.mpesaReceiptNumber || payment?.transactionReference || 'N/A',
    };
  } else if (syncedBooking.status === 'pending') {
    return { status: 'pending' };
  } else {
    return { status: 'failed', message: 'Payment was not successful' };
  }
}

// ========== EXISTING CRUD (keep as is) ==========
export const createPayment = async (data: any) => {
  const [newPayment] = await db.insert(payments).values(data).returning();
  return newPayment;
};

export const getPayment = async (paymentId: number) => {
  return await db.query.payments.findFirst({ where: eq(payments.paymentId, paymentId) });
};

export const listPayments = async (bookingId?: number) => {
  if (bookingId) return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  return await db.select().from(payments);
};

export const updatePayment = async (paymentId: number, updates: any) => {
  const [updated] = await db.update(payments).set(updates).where(eq(payments.paymentId, paymentId)).returning();
  return updated;
};

export const deletePayment = async (paymentId: number) => {
  const [deleted] = await db.delete(payments).where(eq(payments.paymentId, paymentId)).returning();
  return deleted;
};

export const getRevenue = async (landlordId?: number) => {
  if (landlordId) {
    const results = await db.select({
      payment: payments,
      houseTitle: houses.title,
    })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
      .innerJoin(houses, eq(bookings.houseId, houses.houseId))
      .where(eq(houses.landlordId, landlordId));
    const allPayments = results.map(r => ({ ...r.payment, house: { title: r.houseTitle } }));
    const total_revenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const total_payments = allPayments.length;
    const average_payment = total_payments > 0 ? total_revenue / total_payments : 0;
    return { summary: { total_revenue, total_payments, average_payment }, items: allPayments };
  }
  const allPayments = await db.select().from(payments);
  const total_revenue = allPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const total_payments = allPayments.length;
  const average_payment = total_payments > 0 ? total_revenue / total_payments : 0;
  return { summary: { total_revenue, total_payments, average_payment }, items: allPayments };
};