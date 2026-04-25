import { Context } from 'hono';
import { eq } from 'drizzle-orm';
import * as paymentService from './payments.service.js';
import * as bookingService from '../bookings/bookings.service.js';
import { db } from '../db/db.js';
import { bookings } from '../db/schema.js';
import { createPaymentSchema, updatePaymentSchema, paymentIdParam } from '../validators/validators.js';

function canReadBookingPayment(c: Context, booking: { seekerId: number; house?: { landlordId: number } | null }) {
  const userId = c.get('userId') as number;
  const role = c.get('userRole') as string;
  if (role === 'admin') return true;
  if (role === 'tenant' && booking.seekerId === userId) return true;
  if (role === 'landlord' && booking.house?.landlordId === userId) return true;
  return false;
}

// ========== Existing CRUD ==========
export const createPayment = async (c: Context) => {
  try {
    const data = createPaymentSchema.parse(await c.req.json());
    const result = await paymentService.createPayment(data);
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getPayment = async (c: Context) => {
  try {
    const { paymentId } = paymentIdParam.parse(c.req.param());
    const payment = await paymentService.getPayment(paymentId);
    if (!payment) return c.json({ error: 'Payment not found' }, 404);
    const booking = await bookingService.getBooking(payment.bookingId);
    if (!booking || !canReadBookingPayment(c, booking as any)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    return c.json(payment, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listPayments = async (c: Context) => {
  try {
    const bookingId = c.req.query('bookingId') ? parseInt(c.req.query('bookingId')!) : undefined;
    const payments = await paymentService.listPayments(bookingId);
    return c.json(payments, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updatePayment = async (c: Context) => {
  try {
    const { paymentId } = paymentIdParam.parse(c.req.param());
    const updates = updatePaymentSchema.parse(await c.req.json());
    const updated = await paymentService.updatePayment(paymentId, updates);
    if (!updated) return c.json({ error: 'Payment not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deletePayment = async (c: Context) => {
  try {
    const { paymentId } = paymentIdParam.parse(c.req.param());
    const deleted = await paymentService.deletePayment(paymentId);
    if (!deleted) return c.json({ error: 'Payment not found' }, 404);
    return c.json({ message: 'Payment deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const getRevenue = async (c: Context) => {
  try {
    const landlordId = c.req.query('landlordId') ? parseInt(c.req.query('landlordId')!) : undefined;
    const result = await paymentService.getRevenue(landlordId);
    return c.json({ data: result }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

// ========== M-PESA endpoints ==========
export const initiateMpesaPayment = async (c: Context) => {
  try {
    const { houseId, moveInDate, occupants, notes, phone } = await c.req.json();
    const userId = c.get('userId');
    if (!phone) return c.json({ error: 'Phone number required' }, 400);

    const result = await paymentService.createPendingBookingAndInitiateMpesa({
      houseId,
      userId,
      moveInDate,
      occupants,
      notes,
      phone,
    });
    return c.json(result, 200);
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

export const mpesaCallback = async (c: Context) => {
  try {
    const rawBody = await c.req.json();
    await paymentService.handleMpesaCallback(rawBody);
    return c.json({ ResultCode: 0, ResultDesc: 'Success' }, 200);
  } catch (error: any) {
    console.error('Callback error:', error);
    return c.json({ ResultCode: 1, ResultDesc: error.message }, 200);
  }
};

// ========== Stripe endpoints ==========
export const createStripeIntent = async (c: Context) => {
  try {
    const { houseId, moveInDate, occupants, notes } = await c.req.json(); // no amount field
    const userId = c.get('userId');
    const result = await paymentService.createPendingBookingAndStripeIntent({
      houseId,
      userId,
      moveInDate,
      occupants,
      notes,
      // amount is removed – service will fetch from house
    });
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const confirmStripePayment = async (c: Context) => {
  try {
    const { paymentIntentId, bookingId } = await c.req.json();
    const result = await paymentService.confirmStripePayment(paymentIntentId, bookingId);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

// ========== Payment status polling ==========
export const getPaymentStatus = async (c: Context) => {
  try {
    const checkoutId = c.req.param('checkoutRequestId');
    const bookingIdRaw = c.req.query('bookingId');
    let result;

    if (bookingIdRaw) {
      const bookingId = parseInt(String(bookingIdRaw), 10);
      const booking = await bookingService.getBooking(bookingId);
      if (!booking || !canReadBookingPayment(c, booking as any)) {
        return c.json({ error: 'Forbidden' }, 403);
      }
      result = await paymentService.getPaymentStatusByBookingId(bookingId);
    } else if (checkoutId) {
      const [row] = await db
        .select({ bookingId: bookings.bookingId })
        .from(bookings)
        .where(eq(bookings.mpesaCheckoutRequestId, checkoutId))
        .limit(1);
      if (!row) return c.json({ error: 'Transaction not found' }, 404);
      const booking = await bookingService.getBooking(row.bookingId);
      if (!booking || !canReadBookingPayment(c, booking as any)) {
        return c.json({ error: 'Forbidden' }, 403);
      }
      result = await paymentService.getPaymentStatusByCheckoutId(checkoutId);
    } else {
      return c.json({ error: 'Missing checkoutRequestId or bookingId' }, 400);
    }
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};