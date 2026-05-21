import { Hono } from 'hono';
import * as sessionController from '../controllers/chatbot.controller.js';
import { authMiddleware, tenantMiddleware } from '../middleware/authMiddleware.js';

export const chatbotSessionsRouter = new Hono();

chatbotSessionsRouter.use('*', authMiddleware, tenantMiddleware);
chatbotSessionsRouter.post('/message', sessionController.sendMessage);
chatbotSessionsRouter.post('/reset', (c) => c.json({ success: true, message: 'Session reset successfully' }));