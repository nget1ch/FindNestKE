import { Hono } from 'hono';
import * as complianceController from '../controllers/compliance.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

export const complianceRouter = new Hono();

complianceRouter.get('/logs', authMiddleware, adminMiddleware, complianceController.listLogs);
complianceRouter.post('/file', authMiddleware, adminMiddleware, complianceController.fileReturn);
complianceRouter.post('/verify-kra', authMiddleware, complianceController.verifyKraPin);
complianceRouter.post('/verify-id', authMiddleware, adminMiddleware, complianceController.verifyNationalId);