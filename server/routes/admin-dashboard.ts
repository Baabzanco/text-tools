import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAdminAuth } from '../middleware/auth';
import { PageStatus, BlogPostStatus } from '@prisma/client';

const router = Router();
router.use(requireAdminAuth);

// GET /api/admin/dashboard/stats
router.get('/stats', async (_req, res) => {
  try {
    const totalPages = await prisma.page.count();
    const publishedPages = await prisma.page.count({ where: { status: PageStatus.PUBLISHED } });
    const draftPages = await prisma.page.count({ where: { status: PageStatus.DRAFT } });
    const archivedPages = await prisma.page.count({ where: { status: PageStatus.ARCHIVED } });
    const totalTools = await prisma.toolContent.count();

    const totalBlogPosts = await prisma.blogPost.count();
    const publishedBlogPosts = await prisma.blogPost.count({ where: { status: BlogPostStatus.PUBLISHED } });
    const draftBlogPosts = await prisma.blogPost.count({ where: { status: BlogPostStatus.DRAFT } });
    const totalMediaAssets = await prisma.mediaAsset.count();

    const recentBlogPostsRaw = await prisma.blogPost.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });

    const recentBlogPosts = recentBlogPostsRaw.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      status: p.status,
      updatedAt: p.updatedAt
    }));

    const recentRevisions = await prisma.pageVersion.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        page: {
          select: { title: true, slug: true }
        }
      }
    });

    const recentlyUpdatedPages = await prisma.page.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
        updatedBy: true
      }
    });

    const formattedRevisions = recentRevisions.map((v: any) => ({
      id: v.id,
      pageId: v.pageId,
      pageTitle: v.page?.title || 'Unknown Page',
      pageSlug: v.page?.slug || '',
      versionNumber: v.versionNumber,
      changeSummary: v.changeSummary,
      createdBy: v.createdBy,
      createdAt: v.createdAt
    }));

    return res.json({
      success: true,
      data: {
        totalPages,
        publishedPages,
        draftPages,
        archivedPages,
        totalTools,
        totalBlogPosts,
        publishedBlogPosts,
        draftBlogPosts,
        totalMediaAssets,
        recentBlogPosts,
        recentRevisions: formattedRevisions,
        recentlyUpdatedPages
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database dashboard stats query failed' });
  }
});

export default router;
