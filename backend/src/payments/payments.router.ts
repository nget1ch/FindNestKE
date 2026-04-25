import { Hono } from 'hono';
import * as paymentController from '../payments/payments.controller.js';
import { authMiddleware, adminMiddleware, tenantMiddleware } from '../middleware/authMiddleware.js';

export const paymentsRouter = new Hono();

paymentsRouter.post('/mpesa/callback', paymentController.mpesaCallback);

paymentsRouter.use('*', authMiddleware);

paymentsRouter.post('/mpesa/stkpush', tenantMiddleware, paymentController.initiateMpesaPayment);

paymentsRouter.get('/status/:checkoutRequestId', paymentController.getPaymentStatus);
paymentsRouter.get('/status', paymentController.getPaymentStatus);

paymentsRouter.get('/revenue', adminMiddleware, paymentController.getRevenue);
paymentsRouter.get('/', adminMiddleware, paymentController.listPayments);

paymentsRouter.post('/', adminMiddleware, paymentController.createPayment);
paymentsRouter.put('/:paymentId', adminMiddleware, paymentController.updatePayment);
paymentsRouter.delete('/:paymentId', adminMiddleware, paymentController.deletePayment);

paymentsRouter.get('/:paymentId', paymentController.getPayment);