import { Context, Next } from 'hono';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Allowed file types for verification documents
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Upload directory for verification documents
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'verification-docs');

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// File validation function
function validateFile(file: any): { isValid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { isValid: true };
}

// Generate secure filename
function generateSecureFilename(originalName: string): string {
  const ext = originalName.split('.').pop();
  const timestamp = Date.now();
  const uuid = randomUUID().slice(0, 8);
  return `${timestamp}_${uuid}.${ext}`;
}

// Middleware for handling landlord verification document uploads
export const uploadVerificationDocument = async (c: Context, next: Next) => {
  try {
    const contentType = c.req.header('content-type');
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return c.json({ error: 'Content-Type must be multipart/form-data' }, 400);
    }

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('verificationDocument') as File;

    if (!file) {
      return c.json({ error: 'Verification document is required' }, 400);
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return c.json({ error: validation.error }, 400);
    }

    // Generate secure filename and save file
    const filename = generateSecureFilename(file.name);
    const filepath = join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const buffer = await file.arrayBuffer();
    writeFileSync(filepath, Buffer.from(buffer));

    // Generate file URL (in production, this would be your CDN/base URL)
    const fileUrl = `/uploads/verification-docs/${filename}`;

    // Attach file info to context
    c.set('uploadedFile', {
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl,
      path: filepath,
    });

    await next();
  } catch (error: any) {
    console.error('❌ [uploadVerificationDocument] Error:', error.message);
    return c.json({ error: 'File upload failed', details: error.message }, 500);
  }
};

// Helper function to clean up old files (optional)
export const cleanupOldFiles = async (maxAge: number = 30 * 24 * 60 * 60 * 1000) => {
  // This would implement cleanup of files older than maxAge
  // Implementation depends on your requirements
  console.log('🗑️ [cleanupOldFiles] File cleanup not implemented yet');
};
