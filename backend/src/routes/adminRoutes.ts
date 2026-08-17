import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/stats — Get admin dashboard statistics
router.get('/stats', eventController.getAdminStats);

// GET /api/admin/events — Get all events by this organizer
router.get('/events', eventController.getMyEvents);

export default router;
