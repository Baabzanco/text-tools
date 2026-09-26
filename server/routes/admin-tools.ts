import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAdminAuth } from '../middleware/auth';

const router = Router();
router.use(requireAdminAuth);

// GET /api/admin/tools
router.get('/', async (_req, res) => {
  try {
    const tools = await prisma.toolContent.findMany({
      orderBy: { toolName: 'asc' }
    });
    return res.json({ success: true, data: tools });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database tools query failed' });
  }
});

// GET /api/admin/tools/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const tool = await prisma.toolContent.findUnique({
      where: { slug }
    });

    if (!tool) {
      return res.status(404).json({ success: false, error: `Tool content for '${slug}' not found.` });
    }

    return res.json({ success: true, data: tool });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database tool query failed' });
  }
});

// PUT /api/admin/tools/:slug
router.put('/:slug', async (req, res) => {
  const { slug } = req.params;
  const {
    toolName,
    shortDescription,
    longDescription,
    iconIdentifier,
    categoryLabel,
    faq,
    relatedTools,
    seoMetadata,
    introContent,
    educationalContent,
    isPublished
  } = req.body || {};

  try {
    const existing = await prisma.toolContent.findUnique({
      where: { slug }
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: `Tool content for '${slug}' not found.` });
    }

    const updated = await prisma.toolContent.update({
      where: { slug },
      data: {
        toolName: toolName || existing.toolName,
        shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
        longDescription: longDescription !== undefined ? longDescription : existing.longDescription,
        iconIdentifier: iconIdentifier || existing.iconIdentifier,
        categoryLabel: categoryLabel || existing.categoryLabel,
        faq: Array.isArray(faq) ? faq : (existing.faq as any),
        relatedTools: Array.isArray(relatedTools) ? relatedTools : (existing.relatedTools as any),
        seoMetadata: seoMetadata ? { ...(existing.seoMetadata as any), ...seoMetadata } : existing.seoMetadata,
        introContent: introContent !== undefined ? introContent : existing.introContent,
        educationalContent: educationalContent !== undefined ? educationalContent : existing.educationalContent,
        isPublished: typeof isPublished === 'boolean' ? isPublished : existing.isPublished
      }
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database tool update failed' });
  }
});

export default router;
