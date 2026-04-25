import { Hono } from 'hono';
import * as bookingController from './bookings.controller.js';
import { authMiddleware, adminOrLandlordMiddleware, tenantMiddleware } from '../middleware/authMiddleware.js';

export const bookingsRouter = new Hono();

bookingsRouter.use('*', authMiddleware);

bookingsRouter.get('/', bookingController.listBookings);
bookingsRouter.get('/:bookingId', bookingController.getBooking);

bookingsRouter.post('/', tenantMiddleware, bookingController.createBooking);

bookingsRouter.put('/:bookingId', adminOrLandlordMiddleware, bookingController.updateBooking);
bookingsRouter.put('/:bookingId/status', adminOrLandlordMiddleware, bookingController.updateBooking);
bookingsRouter.delete('/:bookingId', adminOrLandlordMiddleware, bookingController.deleteBooking);
bookingsRouter.post('/:bookingId/confirm', adminOrLandlordMiddleware, bookingController.confirmBooking);