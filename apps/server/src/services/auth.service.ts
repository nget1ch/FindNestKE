// src/modules/auth/auth.service.ts
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users, auth } from '../db/schema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_change_me';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const TEMP_PASSWORD_EXPIRY_HOURS = 48;

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateTempPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '@#$%!';
  const all = upper + lower + nums + special;
  let pwd =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    nums[Math.floor(Math.random() * nums.length)] +
    special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 8; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

function signAccessToken(payload: { userId: number; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

function signRefreshToken(payload: { userId: number }) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
}

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginService = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  console.log('🔍 [loginService] Starting login for:', normalizedEmail);

  const user = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (!user) {
    console.log('❌ [loginService] User not found');
    throw new Error('Invalid email or password');
  }

  const userAuth = await db.query.auth.findFirst({
    where: eq(auth.userId, user.userId),
  });

  const userWithAuth = { ...user, auth: userAuth };
  const userToUse = userWithAuth;

  console.log('📊 [loginService] User query result:', userToUse ? `Found user ${userToUse.userId}` : 'User not found');
  if (!userToUse || !userToUse.auth) {
    console.log('❌ [loginService] User or auth record missing');
    throw new Error('Invalid email or password');
  }

  const userStatus = userToUse.accountStatus;
  const userAuthRecord = userToUse.auth;

  console.log('👤 [loginService] User status:', userStatus);
  if (userStatus === 'inactive') {
    console.log('❌ [loginService] Account is inactive');
    throw new Error('Account is deactivated. Contact your administrator.');
  }

  // Check if account is locked
  if (userAuthRecord.lockedUntil && userAuthRecord.lockedUntil > new Date()) {
    console.log('❌ [loginService] Account locked until:', userAuthRecord.lockedUntil);
    throw new Error(`Account is locked until ${userAuthRecord.lockedUntil.toISOString()}`);
  }

  console.log('🔐 [loginService] Comparing passwords...');
  const isMatch = await bcrypt.compare(password, userAuthRecord.passwordHash);
  console.log('🔐 [loginService] Password match:', isMatch);

  if (!isMatch) {
    const newAttempts = (userAuthRecord.loginAttempts ?? 0) + 1;
    console.log(`❌ [loginService] Invalid password, attempt ${newAttempts}/${MAX_LOGIN_ATTEMPTS}`);
    const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;
    await db
      .update(auth)
      .set({
        loginAttempts: newAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(auth.userId, userToUse.userId));

    if (shouldLock) {
      console.log(`🔒 [loginService] Account locked for ${LOCK_DURATION_MINUTES} minutes`);
      throw new Error(`Account locked for ${LOCK_DURATION_MINUTES} minutes after too many failed attempts`);
    }
    throw new Error('Invalid email or password');
  }

  // Successful login - reset attempts
  const refreshToken = signRefreshToken({ userId: user.userId });
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db
    .update(auth)
    .set({
      loginAttempts: 0,
      lockedUntil: null,
      refreshToken,
      refreshTokenExpiresAt: refreshExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(auth.userId, userToUse.userId));

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.userId, userToUse.userId));

  const accessToken = signAccessToken({ userId: userToUse.userId, role: userToUse.role });

  console.log('✅ [loginService] Login successful, returning tokens');
  return {
    accessToken,
    refreshToken,
    requiresPasswordChange: userAuthRecord.isTemporaryPassword,
    user: {
      ...userToUse,
      id: userToUse.userId,
      isTemporaryPassword: userAuthRecord.isTemporaryPassword,
    },
  };
};

// ── Admin: Create User ────────────────────────────────────────────────────────

export const adminCreateUserService = async (data: {
  fullName: string;
  email: string;
  phone: string;
  nationalId?: string;
  role: 'tenant' | 'landlord' | 'admin';
  region?: string;
}) => {
  const normalizedEmail = data.email.trim().toLowerCase();
  console.log('🔍 [adminCreateUserService] Creating user:', normalizedEmail);
  
  const existing = await db.query.users.findFirst({ 
    where: eq(users.email, normalizedEmail) 
  });
  
  if (existing) {
    console.log('❌ [adminCreateUserService] User already exists');
    throw new Error('A user with that email already exists');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_EXPIRY_HOURS * 60 * 60 * 1000);

  const [newUser] = await db
    .insert(users)
    .values({
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      nationalId: data.nationalId?.trim() || null,
      role: data.role,
      region: data.region?.trim() || null,
      accountStatus: 'pending',
      updatedAt: new Date(),
    })
    .returning();

  await db.insert(auth).values({
    userId: newUser.userId,
    passwordHash,
    isTemporaryPassword: true,
    temporaryPasswordExpiresAt: expiresAt,
    updatedAt: new Date(),
  });

  console.log('✅ [adminCreateUserService] User created with temp password');
  return { user: newUser, temporaryPassword: tempPassword };
};

// ── Change Password (First Login / Voluntary) ──────────────────────────────────

export const changePasswordService = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  console.log('🔍 [changePasswordService] Changing password for userId:', userId);
  const userAuth = await db.query.auth.findFirst({ where: eq(auth.userId, userId) });
  if (!userAuth) {
    console.log('❌ [changePasswordService] Auth record not found');
    throw new Error('Auth record not found');
  }

  // If it's still a temp password, check expiry
  if (userAuth.isTemporaryPassword && userAuth.temporaryPasswordExpiresAt) {
    if (new Date() > userAuth.temporaryPasswordExpiresAt) {
      console.log('❌ [changePasswordService] Temporary password expired');
      throw new Error('Temporary password has expired. Please contact your administrator.');
    }
  }

  const isMatch = await bcrypt.compare(currentPassword, userAuth.passwordHash);
  if (!isMatch) {
    console.log('❌ [changePasswordService] Current password incorrect');
    throw new Error('Current password is incorrect');
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await db
    .update(auth)
    .set({
      passwordHash: hash,
      isTemporaryPassword: false,
      temporaryPasswordExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(auth.userId, userId));

  await db
    .update(users)
    .set({ accountStatus: 'active', updatedAt: new Date() })
    .where(eq(users.userId, userId));

  console.log('✅ [changePasswordService] Password changed successfully');
  return { message: 'Password changed successfully' };
};

// ── Admin: Reset User Password ────────────────────────────────────────────────

export const adminResetPasswordService = async (targetUserId: number) => {
  console.log('🔍 [adminResetPasswordService] Resetting password for userId:', targetUserId);
  const user = await db.query.users.findFirst({ where: eq(users.userId, targetUserId) });
  if (!user) {
    console.log('❌ [adminResetPasswordService] User not found');
    throw new Error('User not found');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_EXPIRY_HOURS * 60 * 60 * 1000);

  await db
    .update(auth)
    .set({
      passwordHash,
      isTemporaryPassword: true,
      temporaryPasswordExpiresAt: expiresAt,
      loginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(auth.userId, targetUserId));

  await db
    .update(users)
    .set({ accountStatus: 'pending', updatedAt: new Date() })
    .where(eq(users.userId, targetUserId));

  console.log('✅ [adminResetPasswordService] Password reset successfully');
  return { temporaryPassword: tempPassword };
};

// ── Refresh Access Token ──────────────────────────────────────────────────────

export const refreshTokenService = async (refreshToken: string) => {
  console.log('🔍 [refreshTokenService] Refreshing token');
  const payload = verifyRefreshToken(refreshToken);

  const userAuth = await db.query.auth.findFirst({
    where: and(
      eq(auth.userId, payload.userId),
      eq(auth.refreshToken, refreshToken),
      gt(auth.refreshTokenExpiresAt, new Date())
    ),
  });

  if (!userAuth) {
    console.log('❌ [refreshTokenService] Invalid or expired refresh token');
    throw new Error('Invalid or expired refresh token');
  }

  const user = await db.query.users.findFirst({ where: eq(users.userId, payload.userId) });
  if (!user) {
    console.log('❌ [refreshTokenService] User not found');
    throw new Error('User not found');
  }

  const newAccessToken = signAccessToken({ userId: user.userId, role: user.role });
  console.log('✅ [refreshTokenService] New access token issued');
  return { accessToken: newAccessToken };
};

// ── Landlord Registration ─────────────────────────────────────────────────────

export const landlordRegistrationService = async (data: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  verificationDocument: string;
  nationalId?: string;
  region?: string;
  kraPin?: string;
  agencyName?: string;
}) => {
  const normalizedEmail = data.email.trim().toLowerCase();
  console.log('🏠 [landlordRegistrationService] Starting landlord registration for:', normalizedEmail);

  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });

  if (existingUser) {
    console.log('❌ [landlordRegistrationService] User already exists:', normalizedEmail);
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Create user and auth records in a transaction
  const newUser = await db.transaction(async (tx) => {
    // Create user record
    const [user] = await tx
      .insert(users)
      .values({
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        phone: data.phone.trim(),
        nationalId: data.nationalId?.trim() || null,
        role: 'landlord',
        accountStatus: 'pending',
        verificationDocument: data.verificationDocument.trim(),
        region: data.region?.trim() || null,
        kraPin: data.kraPin?.trim() || null,
        agencyName: data.agencyName?.trim() || null,
        totalBookings: 0,
        totalListings: 0,
        updatedAt: new Date(),
      })
      .returning();

    // Create auth record
    await tx.insert(auth).values({
      userId: user.userId,
      passwordHash,
      isTemporaryPassword: false,
      loginAttempts: 0,
      updatedAt: new Date(),
    });

    return user;
  });

  console.log('✅ [landlordRegistrationService] Landlord registered successfully:', newUser.userId);
  
  return {
    user: newUser,
    message: 'Landlord registration successful. Your account is pending admin approval.',
  };
};

// ── Admin: Landlord Approval/Rejection ───────────────────────────────────────────

export const approveLandlordService = async (userId: number) => {
  console.log('✅ [approveLandlordService] Approving landlord:', userId);

  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!user) {
    console.log('❌ [approveLandlordService] User not found:', userId);
    throw new Error('User not found');
  }

  if (user.role !== 'landlord') {
    console.log('❌ [approveLandlordService] User is not a landlord:', userId);
    throw new Error('User is not a landlord');
  }

  if (user.accountStatus !== 'pending') {
    console.log('❌ [approveLandlordService] Landlord is not pending:', user.accountStatus);
    throw new Error('Landlord account is not pending approval');
  }

  const [updatedUser] = await db
    .update(users)
    .set({ 
      accountStatus: 'approved',
      updatedAt: new Date()
    })
    .where(eq(users.userId, userId))
    .returning();

  console.log('✅ [approveLandlordService] Landlord approved successfully:', userId);
  return {
    user: updatedUser,
    message: 'Landlord account approved successfully',
  };
};

export const rejectLandlordService = async (userId: number, rejectionReason: string) => {
  console.log('❌ [rejectLandlordService] Rejecting landlord:', userId, 'Reason:', rejectionReason);

  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!user) {
    console.log('❌ [rejectLandlordService] User not found:', userId);
    throw new Error('User not found');
  }

  if (user.role !== 'landlord') {
    console.log('❌ [rejectLandlordService] User is not a landlord:', userId);
    throw new Error('User is not a landlord');
  }

  if (user.accountStatus !== 'pending') {
    console.log('❌ [rejectLandlordService] Landlord is not pending:', user.accountStatus);
    throw new Error('Landlord account is not pending approval');
  }

  const [updatedUser] = await db
    .update(users)
    .set({ 
      accountStatus: 'rejected',
      updatedAt: new Date()
    })
    .where(eq(users.userId, userId))
    .returning();

  console.log('❌ [rejectLandlordService] Landlord rejected successfully:', userId);
  return {
    user: updatedUser,
    rejectionReason,
    message: 'Landlord account rejected',
  };
};

export const getLandlordsByStatusService = async (status?: string, page = 1, limit = 20, search?: string) => {
  console.log('📋 [getLandlordsByStatusService] Fetching landlords:', { status, page, limit, search });

  const offset = (page - 1) * limit;
  
  let whereConditions = [eq(users.role, 'landlord')];
  
  if (status) {
    whereConditions.push(eq(users.accountStatus, status as any));
  }
  
  if (search) {
    // Add search condition for name or email
    // Note: This would need to be implemented with proper SQL LIKE conditions
  }

  const landlords = await db.query.users.findMany({
    where: whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0],
    columns: {
      userId: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      accountStatus: true,
      verificationDocument: true,
      region: true,
      agencyName: true,
      createdAt: true,
      updatedAt: true,
    },
    limit,
    offset,
    orderBy: (u: any, { desc }: any) => [desc(u.createdAt)],
  });

  console.log('✅ [getLandlordsByStatusService] Found landlords:', landlords.length);
  return {
    landlords,
    pagination: {
      page,
      limit,
      total: landlords.length, // This should be a proper count query
    },
  };
};