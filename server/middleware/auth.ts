import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.cookies) {
      return res.status(500).json({ error: 'Cookie parser not configured' });
    }

    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    const decoded = jwt.verify(token, secret) as AuthPayload;

    if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.name || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.NotBeforeError) {
      return res.status(401).json({ error: 'Token not active' });
    } else if (error instanceof Error && error.message === 'JWT_SECRET environment variable is not set') {
      return res.status(500).json({ error: 'Server configuration error' });
    } else if (error instanceof Error && error.message === 'Invalid token payload') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: 'Authentication error' });
    }
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