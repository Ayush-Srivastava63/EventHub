import { body } from 'express-validator';

// ─── Auth Validators ───

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Invalid role'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ─── Event Validators ───

export const createEventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('event_date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('event_time')
    .notEmpty().withMessage('Event time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM format'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category must be under 50 characters'),
  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

export const updateEventValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim(),
  body('event_date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('event_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM format'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category must be under 50 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

// ─── User Validators ───

export const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email'),
];
