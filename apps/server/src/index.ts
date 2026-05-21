// src/index.ts
import './load-env.js';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth.router.js';
import { usersRouter } from './routes/users.router.js';
import { housesRouter } from './routes/houses.router.js';
import { chatbotSessionsRouter } from './routes/chatbot.router.js';
import { bookingsRouter } from './routes/bookings.router.js';
import { paymentsRouter } from './routes/payments.router.js';
import { complianceRouter } from './routes/compliance.router.js';
import { analyticsRouter } from './routes/analytics.router.js';
import { auditLogsRouter } from './routes/audit_logs.router.js';
import { houseImagesRouter } from './routes/house_images.router.js';
import { locationsRouter } from './routes/locations.router.js';
import { notificationsRouter } from './routes/notifications.router.js';

const app = new Hono();

// Enable CORS for frontend integration
app.use('/api/*', cors({
  origin: process.env.VITE_API_URL || '*', // In production, restrict to your frontend domain
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve static files (like uploaded verification docs)
app.use('/uploads/*', serveStatic({ root: './' }));

// Mount all routers under /api prefix for consistency
app.route('/api/auth', authRouter);
app.route('/api/users', usersRouter);
app.route('/api/houses', housesRouter);
app.route('/api/chatbot', chatbotSessionsRouter);
app.route('/api/bookings', bookingsRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/compliance', complianceRouter);
app.route('/api/analytics', analyticsRouter);
app.route('/api/audit-logs', auditLogsRouter);
app.route('/api/house-images', houseImagesRouter);
app.route('/api/locations', locationsRouter);
app.route('/api/notifications', notificationsRouter);

// 404 handler
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

// Start server – convert PORT to number
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000;
serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});