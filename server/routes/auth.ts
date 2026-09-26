import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 16) {
    return res.status(500).json({ success: false, error: 'Server configuration error: JWT_SECRET missing or insecure.' });
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: String(email).toLowerCase().trim() }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    }

    const match = bcrypt.compareSync(String(password), user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Never return passwordHash in API response
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database login query failed' });
  }
});

// GET /api/admin/auth/me
router.get('/me', requireAdminAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export default router;
