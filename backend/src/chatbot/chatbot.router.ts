import { Hono } from 'hono';
import * as sessionController from './chatbot.controller.js';
import { authMiddleware, tenantMiddleware } from '../middleware/authMiddleware.js';

export const chatbotSessionsRouter = new Hono();

chatbotSessionsRouter.use('*', authMiddleware, tenantMiddleware);
chatbotSessionsRouter.post('/message', sessionController.sendMessage);