// src/modules/houses/houses.controller.ts
import { Context } from 'hono';
import * as houseService from './houses.service.js';
import { uploadImage, isCloudinaryConfigured } from '../utils/cloudinary.js';
import {
  landlordCreateHouseSchema,
  updateHouseSchema,
  houseIdParam,
  houseListQuery,
  adminApproveHouseBodySchema,
} from '../validators/validators.js';

function collectMultiField(body: Record<string, unknown>, key: string): string[] | undefined {
  const raw = body[key] ?? body[`${key}[]`];
  if (raw == null || raw === '') return undefined;
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string' && v.length > 0);
  if (typeof raw === 'string') return [raw];
  return undefined;
}

function toCommaList(val: string[] | string | undefined): string | undefined {
  if (val == null) return undefined;
  if (Array.isArray(val)) return val.filter(Boolean).join(',');
  if (typeof val === 'string' && val.length > 0) return val;
  return undefined;
}

export const createHouse = async (c: Context) => {
  try {
    const contentType = c.req.header('content-type') || '';
    let raw: Record<string, unknown> = {};
    let files: unknown[] = [];

    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      raw = {
        title: body['title'],
        description: body['description'],
        houseType: body['houseType'],
        furnishing: body['furnishing'] || 'unfurnished',
        bedrooms: body['bedrooms'],
        bathrooms: body['bathrooms'],
        monthlyRent: body['monthlyRent'] ?? body['rent'],
        location: body['location'],
        areaCharacter: body['areaCharacter'],
        amenities: collectMultiField(body as Record<string, unknown>, 'amenities'),
        nearbyFacilities: collectMultiField(body as Record<string, unknown>, 'nearbyFacilities'),
      };
      const imagesField = body['images'];
      if (imagesField) {
        files = Array.isArray(imagesField) ? imagesField : [imagesField];
      }
    } else {
      raw = (await c.req.json()) as Record<string, unknown>;
    }

    const parsed = landlordCreateHouseSchema.parse(raw);

    const landlordId = c.get('userId') as number;

    const imageUrls: string[] = [];
    if (files.length > 0) {
      if (!isCloudinaryConfigured()) {
        console.warn('⚠️ Cloudinary is not configured. Images will not be uploaded. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
      } else {
        for (const file of files) {
          // Node / Undici multipart bodies may not satisfy `instanceof File`
          if (file && typeof (file as Blob).arrayBuffer === 'function') {
            const buffer = Buffer.from(await (file as Blob).arrayBuffer());
            imageUrls.push(await uploadImage(buffer));
          }
        }
      }
    }

    const amenitiesStr = toCommaList(parsed.amenities as string[] | string | undefined);
    const nearbyStr = toCommaList(parsed.nearbyFacilities as string[] | string | undefined);

    const result = await houseService.createHouse({
      title: parsed.title,
      description: parsed.description || '',
      houseType: parsed.houseType,
      furnishing: parsed.furnishing,
      bedrooms: parsed.bedrooms,
      bathrooms: parsed.bathrooms,
      monthlyRent: parsed.monthlyRent,
      dailyRate: 0,
      amenities: amenitiesStr,
      nearbyFacilities: nearbyStr,
      areaCharacter: parsed.areaCharacter,
      addressLine: parsed.location,
      landlordId,
      imageUrls,
      locationName: parsed.location.slice(0, 255),
      county: 'Kenya',
    });

    return c.json(result, 201);
  } catch (error: any) {
    console.error('❌ [createHouse] Error:', error);
    if (error?.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    const msg =
      typeof error?.message === 'string' && error.message.length > 0
        ? error.message
        : typeof error === 'string'
          ? error
          : error?.detail || error?.cause?.message || JSON.stringify(error)?.slice(0, 500) || 'Unknown error';
    return c.json(
      {
        error: msg,
        code: error?.code,
        detail: error?.detail,
      },
      400
    );
  }
};

export const getHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const house = await houseService.getHouse(houseId);
    if (!house) return c.json({ error: 'House not found' }, 404);

    const userId = c.get('userId') as number | undefined;
    const userRole = c.get('userRole') as string | undefined;
    const isPublic = house.status === 'active';

    if (isPublic) {
      return c.json(house, 200);
    }
    if (userRole === 'admin') {
      return c.json(house, 200);
    }
    if (userRole === 'landlord' && userId === house.landlordId) {
      return c.json(house, 200);
    }
    return c.json({ error: 'House not found' }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listHouses = async (c: Context) => {
  try {
    const query = houseListQuery.parse(c.req.query());

    const userId = c.get('userId') as number | undefined;
    const userRole = c.get('userRole') as string | undefined;

    if (query.landlordId != null) {
      if (!userId) {
        return c.json({ error: 'Unauthorized: Sign in to view landlord portfolio' }, 401);
      }
      if (userRole === 'admin') {
        // ok — moderation / support
      } else if (userRole === 'landlord' && userId === query.landlordId) {
        // ok — own portfolio
      } else {
        return c.json({ error: 'Forbidden: Cannot view another landlord’s portfolio' }, 403);
      }
    }

    // Visibility enforcement:
    // - Admins can query any status explicitly
    // - Landlords viewing their own portfolio see all their statuses
    // - Everyone else only sees active approved listings
    const isAdmin = userRole === 'admin';
    const isOwnerQuery = !!query.landlordId;

    if (!isAdmin && !isOwnerQuery && !query.status) {
      query.status = 'active';
    }

    const result = await houseService.listHouses(query);
    return c.json(result, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Invalid query', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 500);
  }
};

export const listUniqueTowns = async (c: Context) => {
  try {
    const results = await houseService.listUniqueTowns();
    return c.json(results, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listUniqueLocations = async (c: Context) => {
  try {
    const results = await houseService.listUniqueLocations();
    return c.json(results, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const updates = updateHouseSchema.parse(await c.req.json()) as Record<string, unknown>;
    if (c.get('userRole') === 'landlord') {
      delete updates.bookingFee;
      delete updates.status;
    }

    const currentHouse = await houseService.getHouse(houseId);
    if (!currentHouse) return c.json({ error: 'House not found' }, 404);
    
    const userId = c.get('userId');
    if (currentHouse.landlordId !== userId) {
      return c.json({ error: 'Forbidden: You can only edit your own listings.' }, 403);
    }

    const updated = await houseService.updateHouse(houseId, updates);
    return c.json(updated, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 400);
  }
};

export const deleteHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    
    const currentHouse = await houseService.getHouse(houseId);
    if (!currentHouse) return c.json({ error: 'House not found' }, 404);
    
    const userId = c.get('userId');
    if (currentHouse.landlordId !== userId) {
      return c.json({ error: 'Forbidden: You can only delete your own listings.' }, 403);
    }

    await houseService.deleteHouse(houseId);
    return c.json({ message: 'House decommissioned successfully' }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const approveListing = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const adminId = c.get('userId') as number;
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Forbidden: Only administrators can authorize assets.' }, 403);
    }

    const { bookingFee } = adminApproveHouseBodySchema.parse(await c.req.json());
    const updated = await houseService.approveHouse(houseId, adminId, bookingFee);
    return c.json({ message: 'Listing authorized successfully', listing: updated }, 200);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    return c.json({ error: error.message }, 500);
  }
};

export const rejectListing = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const { reason } = await c.req.json();
    const adminId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Forbidden: Only administrators can reject assets.' }, 403);
    }

    const updated = await houseService.rejectHouse(houseId, adminId, reason);
    return c.json({ message: 'Listing rejected', listing: updated }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const revokeListing = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const { reason } = await c.req.json();
    const adminId = c.get('userId');
    const userRole = c.get('userRole');

    if (userRole !== 'admin') {
      return c.json({ error: 'Forbidden: Only administrators can revoke authorizations.' }, 403);
    }

    const updated = await houseService.revokeHouse(houseId, adminId, reason);
    return c.json({ message: 'Listing authorization revoked', listing: updated }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const toggleSavedHouse = async (c: Context) => {
  try {
    const { houseId } = houseIdParam.parse(c.req.param());
    const seekerId = c.get('userId');
    const { saved } = await c.req.json();

    if (saved) {
      await houseService.saveHouse(seekerId, houseId);
      return c.json({ message: 'House saved to collection' }, 200);
    } else {
      await houseService.removeSavedHouse(seekerId, houseId);
      return c.json({ message: 'House removed from collection' }, 200);
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const listSavedHouses = async (c: Context) => {
  try {
    const seekerId = c.get('userId');
    const results = await houseService.listSavedHouses(seekerId);
    return c.json(results, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};