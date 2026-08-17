import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import * as registrationController from '../controllers/registrationController';
import { authenticate, authorize } from '../middleware/auth';
import { createEventValidation, updateEventValidation } from '../middleware/validators';

const router = Router();

// ─── Public Routes ───

// GET /api/events — List events with search, filter, pagination
router.get('/', eventController.getEvents);

// GET /api/events/categories — Get all distinct event categories
router.get('/categories', eventController.getCategories);

// GET /api/events/:id — Get single event details
router.get('/:id', eventController.getEventById);

// ─── Authenticated User Routes ───

// POST /api/events/:id/register — Register for an event
router.post('/:id/register', authenticate, registrationController.registerForEvent);

// DELETE /api/events/:id/register — Cancel event registration
router.delete('/:id/register', authenticate, registrationController.cancelRegistration);

// GET /api/events/:id/check-registration — Check if current user is registered
router.get('/:id/check-registration', authenticate, registrationController.checkRegistration);

// GET /api/events/:id/registrations — View registrations for an event (admin/organizer only)
router.get('/:id/registrations', authenticate, authorize('admin'), registrationController.getEventRegistrations);

// ─── Admin Routes ───

// POST /api/events — Create a new event (admin only)
router.post('/', authenticate, authorize('admin'), createEventValidation, eventController.createEvent);

// PUT /api/events/:id — Update an event (admin only, must be organizer)
router.put('/:id', authenticate, authorize('admin'), updateEventValidation, eventController.updateEvent);

// DELETE /api/events/:id — Delete an event (admin only, must be organizer)
router.delete('/:id', authenticate, authorize('admin'), eventController.deleteEvent);

export default router;
