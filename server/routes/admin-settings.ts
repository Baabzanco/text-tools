import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();
router.use(requireAdminAuth);

// GET /api/admin/settings
router.get('/', async (_req, res) => {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return res.json({ success: true, data: settings || {} });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database settings query failed' });
  }
});

// PUT /api/admin/settings
router.put('/', async (req, res) => {
  try {
    const curr = await prisma.siteSettings.findFirst();
    const targetId = curr?.id || 'global-site-settings';

    const updated = await prisma.siteSettings.upsert({
      where: { id: targetId },
      update: {
        siteName: req.body.siteName || curr?.siteName || 'Text Tools',
        siteDescription: req.body.siteDescription !== undefined ? req.body.siteDescription : curr?.siteDescription,
        logoUrl: req.body.logoUrl !== undefined ? req.body.logoUrl : curr?.logoUrl,
        faviconUrl: req.body.faviconUrl !== undefined ? req.body.faviconUrl : curr?.faviconUrl,
        defaultSeoTitle: req.body.defaultSeoTitle || curr?.defaultSeoTitle,
        defaultMetaDescription: req.body.defaultMetaDescription || curr?.defaultMetaDescription,
        defaultOgImage: req.body.defaultOgImage !== undefined ? req.body.defaultOgImage : curr?.defaultOgImage,
        footerText: req.body.footerText || curr?.footerText,
        socialLinks: req.body.socialLinks || (curr?.socialLinks as any) || []
      },
      create: {
        id: 'global-site-settings',
        siteName: req.body.siteName || 'Text Tools',
        siteDescription: req.body.siteDescription || 'Online Text Utilities & Content Platform',
        logoUrl: req.body.logoUrl || '/favicon.ico',
        faviconUrl: req.body.faviconUrl || '/favicon.ico',
        defaultSeoTitle: req.body.defaultSeoTitle || 'Free Online Text Tools & Developer Utilities',
        defaultMetaDescription: req.body.defaultMetaDescription || 'Fast, private, 100% client-side text tools.',
        defaultOgImage: req.body.defaultOgImage || 'https://texttools.app/og-image.png',
        footerText: req.body.footerText || '© 2026 Text Tools. All rights reserved.',
        socialLinks: req.body.socialLinks || []
      }
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database settings update failed' });
  }
});

export default router;
