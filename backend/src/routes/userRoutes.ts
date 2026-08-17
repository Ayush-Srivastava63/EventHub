import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as registrationController from '../controllers/registrationController';
import * as eventController from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';
import { updateUserValidation } from '../middleware/validators';

const router = Router();

// GET /api/users/me — Get current user profile
router.get('/me', authenticate, authController.getMe);

// PUT /api/users/me — Update current user profile
router.put('/me', authenticate, updateUserValidation, authController.updateProfile);

// GET /api/users/me/registrations — Get current user's event registrations
router.get('/me/registrations', authenticate, registrationController.getUserRegistrations);

export default router;
