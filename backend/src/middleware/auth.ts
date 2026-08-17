import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Extend Express Request to include user info from JWT
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header and attaches user info to request.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Authorization middleware factory.
 * Restricts route access to users with the specified role(s).
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
