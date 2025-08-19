import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.js';
import { storage } from '../storage.js';
import type { User } from '@shared/schema';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyToken(token) as any;
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await storage.getUser(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

export function requireRole(role: 'teacher' | 'student') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
