import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth';
import { PageStatus } from '@prisma/client';

const router = Router();
router.use(requireAdminAuth);

// GET /api/admin/pages
router.get('/', async (_req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        versions: {
          select: { id: true, versionNumber: true }
        }
      }
    });

    const result = pages.map((p: any) => {
      const totalVersionsCount = p.versions.length;
      const pubVer = p.versions.find((v: any) => v.id === p.publishedVersionId);
      const latestVerNum = p.versions.reduce((max: number, v: any) => Math.max(max, v.versionNumber), 0);

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        status: p.status,
        updatedAt: p.updatedAt,
        publishedAt: p.publishedAt,
        createdBy: p.createdBy,
        updatedBy: p.updatedBy,
        totalVersionsCount,
        publishedVersionNumber: pubVer ? pubVer.versionNumber : null,
        latestVersionNumber: latestVerNum || null
      };
    });

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database pages query failed' });
  }
});

// POST /api/admin/pages (Uses Prisma Transaction)
router.post('/', async (req: AuthenticatedRequest, res) => {
  const { slug, title, sections, seoMetadata } = req.body || {};

  if (!slug || !title) {
    return res.status(400).json({ success: false, error: 'Slug and title are required.' });
  }

  const cleanSlug = String(slug).toLowerCase().trim().replace(/[^\w-]/g, '-');

  try {
    const existing = await prisma.page.findUnique({
      where: { slug: cleanSlug }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: `Page with slug '${cleanSlug}' already exists.` });
    }

    const createdBy = req.user?.name || 'Admin';

    // Execute in Prisma Transaction for atomic creation
    const { newPage, newVersion } = await prisma.$transaction(async (tx: any) => {
      const page = await tx.page.create({
        data: {
          slug: cleanSlug,
          title,
          status: PageStatus.DRAFT,
          createdBy,
          updatedBy: createdBy
        }
      });

      const version = await tx.pageVersion.create({
        data: {
          pageId: page.id,
          versionNumber: 1,
          content: { sections: Array.isArray(sections) ? sections : [] },
          seoMetadata: seoMetadata || {
            seoTitle: title,
            metaDescription: '',
            canonicalUrl: `https://texttools.app/${cleanSlug}`,
            robotsIndex: true,
            robotsFollow: true,
            ogTitle: title,
            ogDescription: '',
            ogImage: '',
            twitterTitle: title,
            twitterDescription: '',
            twitterImage: '',
            schemaJson: ''
          },
          changeSummary: 'Initial page draft created.',
          createdBy
        }
      });

      return { newPage: page, newVersion: version };
    });

    return res.status(201).json({
      success: true,
      data: {
        page: newPage,
        version: newVersion
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database page creation failed' });
  }
});

// GET /api/admin/pages/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const page = await prisma.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found.' });
    }

    const latestVersion = page.versions[0] || null;
    const publishedVersion = page.versions.find((v: any) => v.id === page.publishedVersionId) || null;

    return res.json({
      success: true,
      data: {
        page,
        latestVersion,
        publishedVersion,
        versionsSummary: page.versions.map((v: any) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          createdAt: v.createdAt,
          createdBy: v.createdBy,
          changeSummary: v.changeSummary,
          isPublished: v.id === page.publishedVersionId
        }))
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database page query failed' });
  }
});

// PUT /api/admin/pages/:id (Save Draft using Prisma Transaction)
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, sections, seoMetadata, changeSummary } = req.body || {};

  try {
    const page = await prisma.page.findUnique({
      where: { id }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found.' });
    }

    const updatedBy = req.user?.name || 'Admin';

    // Execute in Prisma Transaction
    const { updatedPage, newVersion } = await prisma.$transaction(async (tx: any) => {
      const maxVerAgg = await tx.pageVersion.aggregate({
        where: { pageId: page.id },
        _max: { versionNumber: true }
      });

      const nextVerNum = (maxVerAgg._max.versionNumber || 0) + 1;
      const updatedTitle = title || page.title;

      const version = await tx.pageVersion.create({
        data: {
          pageId: page.id,
          versionNumber: nextVerNum,
          content: { sections: Array.isArray(sections) ? sections : [] },
          seoMetadata: seoMetadata || {
            seoTitle: updatedTitle,
            metaDescription: '',
            canonicalUrl: `https://texttools.app/${page.slug}`,
            robotsIndex: true,
            robotsFollow: true,
            ogTitle: updatedTitle,
            ogDescription: '',
            ogImage: '',
            twitterTitle: updatedTitle,
            twitterDescription: '',
            twitterImage: '',
            schemaJson: ''
          },
          changeSummary: changeSummary || `Draft version ${nextVerNum} saved.`,
          createdBy: updatedBy
        }
      });

      const p = await tx.page.update({
        where: { id: page.id },
        data: {
          title: updatedTitle,
          updatedBy
        }
      });

      return { updatedPage: p, newVersion: version };
    });

    return res.json({
      success: true,
      data: {
        page: updatedPage,
        version: newVersion
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database draft save failed' });
  }
});

// POST /api/admin/pages/:id/publish (Uses Prisma Transaction)
router.post('/:id/publish', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { versionId } = req.body || {};

  try {
    const page = await prisma.page.findFirst({
      where: { id },
      include: { versions: { orderBy: { versionNumber: 'desc' } } }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found.' });
    }

    let targetVer = page.versions.find((v: any) => v.id === versionId);
    if (!targetVer) {
      targetVer = page.versions[0];
    }

    if (!targetVer) {
      return res.status(400).json({ success: false, error: 'No version available to publish.' });
    }

    const updatedBy = req.user?.name || 'Admin';

    // Execute in Prisma Transaction
    const updatedPage = await prisma.$transaction(async (tx: any) => {
      return await tx.page.update({
        where: { id: page.id },
        data: {
          status: PageStatus.PUBLISHED,
          publishedVersionId: targetVer.id,
          publishedAt: new Date(),
          updatedBy
        }
      });
    });

    return res.json({
      success: true,
      data: {
        page: updatedPage,
        publishedVersion: targetVer
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database publish failed' });
  }
});

// POST /api/admin/pages/:id/archive
router.post('/:id/archive', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const updatedBy = req.user?.name || 'Admin';
    const page = await prisma.page.update({
      where: { id },
      data: {
        status: PageStatus.ARCHIVED,
        updatedBy
      }
    });

    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database archive failed' });
  }
});

// GET /api/admin/pages/:id/revisions
router.get('/:id/revisions', async (req, res) => {
  const { id } = req.params;

  try {
    const page = await prisma.page.findFirst({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' }
        }
      }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found.' });
    }

    return res.json({
      success: true,
      data: {
        page,
        publishedVersionId: page.publishedVersionId,
        revisions: page.versions
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database revisions fetch failed' });
  }
});

// POST /api/admin/pages/:id/revisions/:versionId/restore (Uses Prisma Transaction)
router.post('/:id/revisions/:versionId/restore', async (req: AuthenticatedRequest, res) => {
  const { id, versionId } = req.params;

  try {
    const page = await prisma.page.findUnique({
      where: { id }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found.' });
    }

    const srcVer = await prisma.pageVersion.findFirst({
      where: { id: versionId, pageId: page.id }
    });

    if (!srcVer) {
      return res.status(404).json({ success: false, error: 'Source version to restore not found.' });
    }

    const updatedBy = req.user?.name || 'Admin';

    // Execute in Prisma Transaction to create NEW version without mutating srcVer
    const { updatedPage, restoredVersion } = await prisma.$transaction(async (tx: any) => {
      const maxVerAgg = await tx.pageVersion.aggregate({
        where: { pageId: page.id },
        _max: { versionNumber: true }
      });

      const nextVerNum = (maxVerAgg._max.versionNumber || 0) + 1;

      const restored = await tx.pageVersion.create({
        data: {
          pageId: page.id,
          versionNumber: nextVerNum,
          content: srcVer.content as any,
          seoMetadata: srcVer.seoMetadata as any,
          changeSummary: `Restored content from Revision v${srcVer.versionNumber}.`,
          createdBy: updatedBy
        }
      });

      const p = await tx.page.update({
        where: { id: page.id },
        data: { updatedBy }
      });

      return { updatedPage: p, restoredVersion: restored };
    });

    return res.json({
      success: true,
      data: {
        page: updatedPage,
        restoredVersion,
        restoredFromVersionNumber: srcVer.versionNumber
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database version restore failed' });
  }
});

export default router;
