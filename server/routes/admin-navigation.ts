import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();
router.use(requireAdminAuth);

// GET /api/admin/navigation
router.get('/', async (_req, res) => {
  try {
    const menus = await prisma.navigationMenu.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });
    return res.json({ success: true, data: menus });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database navigation fetch failed' });
  }
});

// PUT /api/admin/navigation/:location (Uses Prisma Transaction)
router.put('/:location', async (req, res) => {
  const { location } = req.params;
  const { items } = req.body || {};

  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Items must be an array.' });
  }

  try {
    const updatedMenu = await prisma.$transaction(async (tx: any) => {
      let menu = await tx.navigationMenu.findUnique({
        where: { location }
      });

      if (!menu) {
        menu = await tx.navigationMenu.create({
          data: {
            name: `${location.charAt(0).toUpperCase() + location.slice(1)} Menu`,
            location
          }
        });
      }

      // Delete existing items for this menu
      await tx.navigationItem.deleteMany({
        where: { menuId: menu.id }
      });

      // Create new items atomically
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await tx.navigationItem.create({
          data: {
            menuId: menu.id,
            label: item.label || 'Link',
            url: item.url || '/',
            order: Number(item.order ?? i + 1),
            isActive: item.isActive !== false,
            target: item.target || '_self'
          }
        });
      }

      return await tx.navigationMenu.findUnique({
        where: { id: menu.id },
        include: { items: { orderBy: { order: 'asc' } } }
      });
    });

    return res.json({ success: true, data: updatedMenu });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database navigation update failed' });
  }
});

export default router;
