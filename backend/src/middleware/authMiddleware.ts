import { Context, Next } from 'hono';
import { verifyAccessToken } from '../auth/auth.service.js';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/** Map legacy JWT / DB values to canonical role */
export function normalizeRole(role: string): string {
  if (role === 'seeker') return 'tenant';
  return role;
}

// Authentication middleware – verifies JWT and sets userId/userRole
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    c.set('userId', payload.userId);
    c.set('userRole', normalizeRole(payload.role));
    await next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return c.json({ error: 'Unauthorized: Token expired' }, 401);
    }
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
};

/** Bearer optional — sets userId / userRole when token is valid */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    c.set('userId', payload.userId);
    c.set('userRole', normalizeRole(payload.role));
  } catch {
    // ignore invalid optional token
  }
  await next();
};

// Admin middleware – checks if the authenticated user has role 'admin'
export const adminMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  await next();
};

/** House seeker — chatbot, bookings, M-Pesa self-service */
export const tenantMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'tenant') {
    return c.json({ error: 'Forbidden: Tenant access required' }, 403);
  }
  await next();
};

/** Create/edit/delete own listings — not admin (admin moderates via approve/reject) */
export const landlordOnlyMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'landlord') {
    return c.json({ error: 'Forbidden: Landlord access required' }, 403);
  }
  await next();
};

/** Bookings/payments management for properties (landlord) or system (admin) */
export const adminOrLandlordMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'admin' && role !== 'landlord') {
    return c.json({ error: 'Forbidden: Landlord or admin access required' }, 403);
  }
  await next();
};

/** Approved landlord middleware - checks if landlord account is approved */
export const approvedLandlordMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  const userId = c.get('userId');
  
  if (role !== 'landlord') {
    return c.json({ error: 'Forbidden: Landlord access required' }, 403);
  }

  // Check if landlord is approved
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: { accountStatus: true },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  if (user.accountStatus !== 'approved') {
    return c.json({ 
      error: 'Your landlord account is under review',
      message: 'Your landlord account is pending approval. Please wait for admin verification.',
      status: user.accountStatus 
    }, 403);
  }

  await next();
};

/** Approved landlord or admin middleware - allows approved landlords and admins */
export const approvedLandlordOrAdminMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  const userId = c.get('userId');
  
  if (role === 'admin') {
    await next();
    return;
  }

  if (role !== 'landlord') {
    return c.json({ error: 'Forbidden: Landlord or admin access required' }, 403);
  }

  // Check if landlord is approved
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: { accountStatus: true },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  if (user.accountStatus !== 'approved') {
    return c.json({ 
      error: 'Your landlord account is under review',
      message: 'Your landlord account is pending approval. Please wait for admin verification.',
      status: user.accountStatus 
    }, 403);
  }

  await next();
};