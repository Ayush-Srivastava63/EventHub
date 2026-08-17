import { Request, Response, NextFunction } from 'express';
import * as registrationService from '../services/registrationService';

export async function registerForEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const registration = await registrationService.registerForEvent(req.user!.userId, eventId);
    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
}

export async function cancelRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const registration = await registrationService.cancelRegistration(req.user!.userId, eventId);
    res.json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
}

export async function getUserRegistrations(req: Request, res: Response, next: NextFunction) {
  try {
    const registrations = await registrationService.getUserRegistrations(req.user!.userId);
    res.json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  }
}

export async function getEventRegistrations(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const registrations = await registrationService.getEventRegistrations(eventId, req.user!.userId);
    res.json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  }
}

export async function checkRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const isRegistered = await registrationService.checkRegistration(req.user!.userId, eventId);
    res.json({ success: true, data: { isRegistered } });
  } catch (error) {
    next(error);
  }
}
