import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  sub?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    // Try to verify with JWT_SECRET first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = { id: decoded.userId || decoded.sub! };
      next();
      return;
    } catch (jwtError) {
      // If that fails, try with NEXTAUTH_SECRET
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as JwtPayload;
      req.user = { id: decoded.userId || decoded.sub! };
      next();
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
}; 