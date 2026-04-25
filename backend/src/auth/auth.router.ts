import { Hono } from 'hono';
import {
  login,
  changePassword,
  adminCreateUser,
  adminResetPassword,
  refreshToken,
  registerLandlord,
  approveLandlord,
  rejectLandlord,
  getLandlordsByStatus,
} from './auth.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { uploadVerificationDocument } from '../middleware/landlordUploadMiddleware.js';

export const authRouter = new Hono();

// Public routes (no authentication)
authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/register-landlord', registerLandlord);
authRouter.post('/register-landlord-with-docs', uploadVerificationDocument, registerLandlord);

// Protected routes (require valid access token)
authRouter.post('/change-password', authMiddleware, changePassword);

// Admin-only routes (require authentication + admin role)
authRouter.post('/users', authMiddleware, adminMiddleware, adminCreateUser);
authRouter.post('/users/:userId/reset-password', authMiddleware, adminMiddleware, adminResetPassword);

// Admin landlord management routes
authRouter.get('/landlords', authMiddleware, adminMiddleware, getLandlordsByStatus);
authRouter.post('/landlords/:userId/approve', authMiddleware, adminMiddleware, approveLandlord);
authRouter.post('/landlords/:userId/reject', authMiddleware, adminMiddleware, rejectLandlord);