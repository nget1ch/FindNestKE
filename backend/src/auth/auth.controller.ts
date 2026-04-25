// src/modules/auth/auth.controller.ts
import { Context } from 'hono';
import {
  loginService,
  adminCreateUserService,
  changePasswordService,
  adminResetPasswordService,
  refreshTokenService,
  landlordRegistrationService,
  approveLandlordService,
  rejectLandlordService,
  getLandlordsByStatusService,
} from './auth.service.js';
import {
  loginSchema,
  changePasswordSchema,
  adminCreateUserSchema,        // 👈 use the admin-specific schema
  refreshTokenSchema,
  resetPasswordParams,
  landlordRegistrationSchema,
  approveLandlordSchema,
  rejectLandlordSchema,
  landlordStatusQuery,
} from '../validators/validators.js';

export const login = async (c: Context) => {
  try {
    const body = await c.req.json();
    console.log('🔐 [Login endpoint] Received request:', { email: body.email });

    const { email, password } = loginSchema.parse(body);
    console.log('✅ [Login endpoint] Validation passed for:', email);

    const data = await loginService(email, password);
    console.log('✅ [Login endpoint] Login service returned successfully for userId:', data.user.userId);

    return c.json(data, 200);
  } catch (error: any) {
    console.error('❌ [Login endpoint] Error:', error.message);

    if (error.name === 'ZodError') {
      console.error('Validation errors:', error.errors);
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 401);
  }
};

export const changePassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);
    const userId = c.get('userId') as number;
    console.log('🔐 [ChangePassword] Request for userId:', userId);

    const data = await changePasswordService(userId, currentPassword, newPassword);
    return c.json(data, 200);
  } catch (error: any) {
    console.error('❌ [ChangePassword] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const adminCreateUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const data = adminCreateUserSchema.parse(body);   // 👈 changed
    console.log('🔐 [AdminCreateUser] Creating user:', data.email);

    const result = await adminCreateUserService(data);
    return c.json(result, 201);
  } catch (error: any) {
    console.error('❌ [AdminCreateUser] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const adminResetPassword = async (c: Context) => {
  try {
    const params = resetPasswordParams.parse(c.req.param());
    console.log('🔐 [AdminResetPassword] Resetting password for userId:', params.userId);

    const result = await adminResetPasswordService(params.userId);
    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ [AdminResetPassword] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid user ID' }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const refreshToken = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { refreshToken: token } = refreshTokenSchema.parse(body);
    console.log('🔐 [RefreshToken] Request received');

    const data = await refreshTokenService(token);
    return c.json(data, 200);
  } catch (error: any) {
    console.error('❌ [RefreshToken] Error:', error.message);
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid request body' }, 400);
    }
    return c.json({ error: error.message }, 401);
  }
};

export const registerLandlord = async (c: Context) => {
  try {
    // Check if file was uploaded via middleware
    const uploadedFile = c.get('uploadedFile');
    
    let body;
    if (uploadedFile) {
      // If file was uploaded, parse form data
      const formData = await c.req.formData();
      const formDataObject: any = {};
      
      // Convert form data to object
      for (const [key, value] of formData.entries()) {
        if (key !== 'verificationDocument') {
          formDataObject[key] = value;
        }
      }
      
      // Add the uploaded file URL
      formDataObject.verificationDocument = uploadedFile.url;
      body = formDataObject;
      
      console.log('🏠 [RegisterLandlord] Received landlord registration with file upload:', { 
        email: body.email, 
        fileUrl: uploadedFile.url 
      });
    } else {
      // Regular JSON request (for backward compatibility)
      body = await c.req.json();
      console.log('🏠 [RegisterLandlord] Received landlord registration request:', { email: body.email });
    }

    const data = landlordRegistrationSchema.parse(body);
    console.log('✅ [RegisterLandlord] Validation passed for:', data.email);

    const result = await landlordRegistrationService(data);
    console.log('✅ [RegisterLandlord] Registration successful for userId:', result.user.userId);

    return c.json(result, 201);
  } catch (error: any) {
    console.error('❌ [RegisterLandlord] Error:', error.message);

    if (error.name === 'ZodError') {
      console.error('Validation errors:', error.errors);
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const approveLandlord = async (c: Context) => {
  try {
    const { userId } = approveLandlordSchema.parse(c.req.param());
    console.log('✅ [ApproveLandlord] Approving landlord:', userId);

    const result = await approveLandlordService(userId);
    console.log('✅ [ApproveLandlord] Landlord approved successfully:', userId);

    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ [ApproveLandlord] Error:', error.message);

    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid user ID' }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const rejectLandlord = async (c: Context) => {
  try {
    const { userId } = rejectLandlordSchema.parse(c.req.param());
    const { rejectionReason } = await c.req.json();
    console.log('❌ [RejectLandlord] Rejecting landlord:', userId, 'Reason:', rejectionReason);

    const result = await rejectLandlordService(userId, rejectionReason);
    console.log('❌ [RejectLandlord] Landlord rejected successfully:', userId);

    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ [RejectLandlord] Error:', error.message);

    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid request' }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const getLandlordsByStatus = async (c: Context) => {
  try {
    const query = landlordStatusQuery.parse(c.req.query());
    console.log('📋 [GetLandlordsByStatus] Fetching landlords:', query);

    const result = await getLandlordsByStatusService(
      query.accountStatus,
      query.page,
      query.limit,
      query.search
    );
    console.log('✅ [GetLandlordsByStatus] Landlords fetched successfully');

    return c.json(result, 200);
  } catch (error: any) {
    console.error('❌ [GetLandlordsByStatus] Error:', error.message);

    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid query parameters' }, 400);
    }
    return c.json({ error: error.message }, 500);
  }
};  