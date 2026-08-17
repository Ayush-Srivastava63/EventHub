import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation, updateUserValidation } from '../middleware/validators';

const router = Router();

// POST /api/auth/register — Create a new user account
router.post('/register', registerValidation, authController.register);

// POST /api/auth/login — Login with email and password
router.post('/login', loginValidation, authController.login);

// GET /api/auth/me — Get current authenticated user
router.get('/me', authenticate, authController.getMe);

export default router;
