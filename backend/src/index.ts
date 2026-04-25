// src/index.ts
import './load-env.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './auth/auth.router.js';
import { usersRouter } from './users/users.router.js';
import { housesRouter } from './houses/houses.router.js';
import { chatbotSessionsRouter } from './chatbot/chatbot.router.js';
import { bookingsRouter } from './bookings/bookings.router.js';
import { paymentsRouter } from './payments/payments.router.js';
import { complianceRouter } from './compliance/compliance.router.js';

const app = new Hono();

// Enable CORS for frontend integration
app.use('/api/*', cors({
  origin: '*', // In production, restrict to your frontend domain
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount all routers under /api prefix for consistency
app.route('/api/auth', authRouter);
app.route('/api/users', usersRouter);
app.route('/api/houses', housesRouter);
app.route('/api/chatbot', chatbotSessionsRouter);
app.route('/api/bookings', bookingsRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/compliance', complianceRouter);

// 404 handler
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

// Start server – convert PORT to number
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});