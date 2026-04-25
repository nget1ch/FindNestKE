import { Hono } from 'hono';
import * as houseController from './houses.controller.js';
import {
  authMiddleware,
  landlordOnlyMiddleware,
  approvedLandlordMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
  tenantMiddleware,
} from '../middleware/authMiddleware.js';

export const housesRouter = new Hono();

// Create listing — approved landlords only (admin moderates; does not create landlord listings)
housesRouter.post('/', authMiddleware, approvedLandlordMiddleware, houseController.createHouse);

housesRouter.get('/meta/towns', houseController.listUniqueTowns);
housesRouter.get('/meta/locations', houseController.listUniqueLocations);
housesRouter.get('/collections/saved', authMiddleware, tenantMiddleware, houseController.listSavedHouses);
housesRouter.get('/', optionalAuthMiddleware, houseController.listHouses);
housesRouter.get('/:houseId', optionalAuthMiddleware, houseController.getHouse);

// Update/Delete own listing — approved landlord owner verified in controller
housesRouter.put('/:houseId', authMiddleware, approvedLandlordMiddleware, houseController.updateHouse);
housesRouter.delete('/:houseId', authMiddleware, approvedLandlordMiddleware, houseController.deleteHouse);

// Admin Approval/Rejection/Revocation - STRICTLY ADMIN
housesRouter.patch('/:houseId/approve', authMiddleware, adminMiddleware, houseController.approveListing);
housesRouter.patch('/:houseId/reject', authMiddleware, adminMiddleware, houseController.rejectListing);
housesRouter.patch('/:houseId/revoke', authMiddleware, adminMiddleware, houseController.revokeListing);

// Saved houses — tenants only
housesRouter.post('/:houseId/save', authMiddleware, tenantMiddleware, houseController.toggleSavedHouse);