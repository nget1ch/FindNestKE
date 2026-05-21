import { Hono } from 'hono';
import * as userController from '../controllers/users.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

export const usersRouter = new Hono();

// Public registration (creating a user)
usersRouter.post('/', userController.createUser);

// Protected profile route (any logged in user can see/update their own)
usersRouter.get('/profile', authMiddleware, userController.getProfile);
usersRouter.put('/profile', authMiddleware, userController.updateProfile);

// Management routes - Admin only
usersRouter.get('/', authMiddleware, adminMiddleware, userController.listUsers);
usersRouter.get('/:userId', authMiddleware, adminMiddleware, userController.getUser);
usersRouter.put('/:userId', authMiddleware, adminMiddleware, userController.updateUser);
usersRouter.delete('/:userId', authMiddleware, adminMiddleware, userController.deleteUser);