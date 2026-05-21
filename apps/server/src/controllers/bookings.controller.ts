import { Context } from 'hono';
import * as bookingService from '../services/bookings.service.js';
import {
  createBookingFromTenantSchema,
  updateBookingSchema,
  bookingIdParam,
} from '../validators/validators.js';

async function loadBookingForAuth(bookingId: number) {
  return bookingService.getBooking(bookingId);
}

/** Landlord of the booked house, or admin */
async function assertCanManageBooking(c: Context, bookingId: number) {
  const booking = await loadBookingForAuth(bookingId);
  if (!booking) return { error: c.json({ error: 'Booking not found' }, 404) };
  const userId = c.get('userId') as number;
  const role = c.get('userRole') as string;
  if (role === 'admin') return { booking };
  if (role === 'landlord' && booking.house?.landlordId === userId) return { booking };
  return { error: c.json({ error: 'Forbidden: You cannot manage this booking' }, 403) };
}

export const createBooking = async (c: Context) => {
  try {
    const body = createBookingFromTenantSchema.parse(await c.req.json());
    const seekerId = c.get('userId') as number;
    const result = await bookingService.createBooking({ ...body, seekerId });
    return c.json(result, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const getBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const booking = await loadBookingForAuth(bookingId);
    if (!booking) return c.json({ error: 'Booking not found' }, 404);

    const userId = c.get('userId') as number;
    const role = c.get('userRole') as string;

    if (role === 'admin') return c.json(booking, 200);
    if (role === 'tenant' && booking.seekerId === userId) return c.json(booking, 200);
    if (role === 'landlord' && booking.house?.landlordId === userId) return c.json(booking, 200);

    return c.json({ error: 'Forbidden' }, 403);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listBookings = async (c: Context) => {
  try {
    const seekerIdQ = c.req.query('seekerId') ? parseInt(c.req.query('seekerId')!, 10) : undefined;
    const houseId = c.req.query('houseId') ? parseInt(c.req.query('houseId')!, 10) : undefined;
    const landlordIdQ = c.req.query('landlordId') ? parseInt(c.req.query('landlordId')!, 10) : undefined;

    const authUserId = c.get('userId') as number;
    const authRole = c.get('userRole') as string;

    let effectiveSeekerId: number | undefined;
    let effectiveLandlordId: number | undefined;

    if (authRole === 'admin') {
      effectiveSeekerId = seekerIdQ;
      effectiveLandlordId = landlordIdQ;
    } else if (authRole === 'landlord') {
      effectiveLandlordId = authUserId;
    } else if (authRole === 'tenant') {
      effectiveSeekerId = authUserId;
    } else {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const bookings = await bookingService.listBookings({
      seekerId: effectiveSeekerId,
      houseId,
      landlordId: effectiveLandlordId,
    });
    return c.json(bookings, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const gate = await assertCanManageBooking(c, bookingId);
    if ('error' in gate && gate.error) return gate.error;

    const parsed = updateBookingSchema.parse(await c.req.json());
    if (c.get('userRole') === 'landlord') {
      delete (parsed as { seekerId?: unknown }).seekerId;
    }
    const updated = await bookingService.updateBooking(bookingId, parsed);
    if (!updated) return c.json({ error: 'Booking not found' }, 404);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') return c.json({ error: 'Validation failed', details: error.errors }, 400);
    return c.json({ error: error.message }, 400);
  }
};

export const deleteBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const gate = await assertCanManageBooking(c, bookingId);
    if ('error' in gate && gate.error) return gate.error;

    const deleted = await bookingService.deleteBooking(bookingId);
    if (!deleted) return c.json({ error: 'Booking not found' }, 404);
    return c.json({ message: 'Booking deleted' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const confirmBooking = async (c: Context) => {
  try {
    const { bookingId } = bookingIdParam.parse(c.req.param());
    const gate = await assertCanManageBooking(c, bookingId);
    if ('error' in gate && gate.error) return gate.error;

    const updated = await bookingService.confirmBooking(bookingId);
    return c.json(updated, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
