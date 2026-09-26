import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

export async function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    return res.status(500).json({ success: false, error: 'Server configuration error: JWT_SECRET missing or insecure.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin user account inactive or not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized: Token expired or invalid' });
  }
}
