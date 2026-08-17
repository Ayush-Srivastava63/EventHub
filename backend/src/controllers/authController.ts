import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: errors.array()[0].msg });
      return;
    }

    const { name, email } = req.body;
    const user = await authService.updateUser(req.user!.userId, { name, email });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
