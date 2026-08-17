import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as eventService from '../services/eventService';

export async function getEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, category, page, limit, sort } = req.query;

    const result = await eventService.getEvents({
      search: search as string,
      category: category as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sort: sort as any,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await eventService.getEventById(eventId);
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const event = await eventService.createEvent(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await eventService.updateEvent(eventId, req.body, req.user!.userId);
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    await eventService.deleteEvent(eventId, req.user!.userId);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getMyEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await eventService.getEventsByOrganizer(req.user!.userId);
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await eventService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getAdminStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await eventService.getAdminStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
