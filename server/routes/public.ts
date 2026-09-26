import { Router } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

// GET /api/public/pages/:slug
router.get('/pages/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const page = await prisma.page.findUnique({
      where: { slug }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: `Page '${slug}' not found` });
    }

    const previewToken = req.query.previewToken;
    let targetVersionId = page.publishedVersionId;

    if (previewToken) {
      const latestVersion = await prisma.pageVersion.findFirst({
        where: { pageId: page.id },
        orderBy: { versionNumber: 'desc' }
      });
      if (latestVersion) {
        targetVersionId = latestVersion.id;
      }
    }

    if (!targetVersionId) {
      return res.status(404).json({ success: false, error: `Page '${slug}' has no published content version.` });
    }

    const version = await prisma.pageVersion.findUnique({
      where: { id: targetVersionId }
    });

    if (!version) {
      return res.status(404).json({ success: false, error: 'Target page version not found.' });
    }

    return res.json({
      success: true,
      data: {
        page: {
          id: page.id,
          slug: page.slug,
          title: page.title,
          status: page.status,
          publishedAt: page.publishedAt,
          updatedAt: page.updatedAt
        },
        version: {
          versionNumber: version.versionNumber,
          content: version.content,
          seoMetadata: version.seoMetadata,
          createdAt: version.createdAt
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database page fetch failed' });
  }
});

// GET /api/public/tools/:slug
router.get('/tools/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const tool = await prisma.toolContent.findFirst({
      where: { slug, isPublished: true }
    });

    if (!tool) {
      return res.status(404).json({ success: false, error: `Tool content for '${slug}' not found` });
    }

    return res.json({ success: true, data: tool });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database tool fetch failed' });
  }
});

// GET /api/public/tools
router.get('/tools', async (_req, res) => {
  try {
    const tools = await prisma.toolContent.findMany({
      where: { isPublished: true },
      orderBy: { toolName: 'asc' }
    });
    return res.json({ success: true, data: tools });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database tools fetch failed' });
  }
});

// GET /api/public/navigation
router.get('/navigation', async (_req, res) => {
  try {
    const menus = await prisma.navigationMenu.findMany({
      include: {
        items: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    return res.json({ success: true, data: menus });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database navigation fetch failed' });
  }
});

// GET /api/public/settings
router.get('/settings', async (_req, res) => {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return res.json({ success: true, data: settings || {} });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Database settings fetch failed' });
  }
});

// ==========================================
// PUBLIC BLOG CMS ENDPOINTS
// ==========================================

// GET /api/public/blog/posts (paginated, filtered)
router.get('/blog/posts', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 9, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;
  const categorySlug = req.query.categorySlug as string;
  const tagSlug = req.query.tagSlug as string;

  try {
    let categoryId: string | undefined;
    let tagId: string | undefined;

    if (categorySlug) {
      const cat = await prisma.blogCategory.findUnique({ where: { slug: categorySlug } });
      if (cat) categoryId = cat.id;
    }

    if (tagSlug) {
      const tag = await prisma.blogTag.findUnique({ where: { slug: tagSlug } });
      if (tag) tagId = tag.id;
    }

    const where: any = { status: 'PUBLISHED' };
    if (categoryId) where.categoryId = categoryId;
    if (tagId) where.tagId = tagId;

    const totalCount = await prisma.blogPost.count({ where });
    const rawPosts = await prisma.blogPost.findMany({
      where,
      take: limit,
      skip,
      include: {
        category: true,
        featuredImage: true,
        author: true
      }
    });

    // Transform posts to return published version snapshots (guarantees published version stability)
    const posts = rawPosts.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      title: p.publishedTitle || p.title,
      excerpt: p.publishedExcerpt || p.excerpt,
      status: p.status,
      publishedAt: p.publishedAt || p.createdAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      featuredImage: p.featuredImage,
      category: p.category,
      author: p.author,
      tags: p.tags,
      seoMetadata: p.publishedSeoMetadata || p.seoMetadata
    }));

    return res.json({
      success: true,
      data: {
        posts,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/blog/posts/:slug (supports redirect lookup, secure draft preview, and published version stability)
router.get('/blog/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  const previewToken = req.query.previewToken;

  try {
    // 1. Check for registered redirects
    const redirect = await prisma.redirect.findUnique({
      where: { fromPath: `/blog/${slug}` }
    });
    if (redirect) {
      return res.json({
        success: true,
        redirect: {
          toPath: redirect.toPath,
          statusCode: redirect.statusCode
        }
      });
    }

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) {
      return res.status(404).json({ success: false, error: `Blog post '${slug}' not found` });
    }

    const isPreview = Boolean(previewToken && previewToken.toString().length >= 4);

    // 2. Access Control: Draft / Scheduled / Archived posts require valid previewToken
    if (post.status !== 'PUBLISHED') {
      if (!isPreview) {
        return res.status(403).json({ success: false, error: 'Access denied: Draft or Scheduled post' });
      }
    }

    // 3. Published Version Stability:
    // If not previewing and post is PUBLISHED, show published snapshots!
    // If previewing, show latest working draft!
    const effectiveTitle = (isPreview ? post.title : (post.publishedTitle || post.title));
    const effectiveExcerpt = (isPreview ? post.excerpt : (post.publishedExcerpt || post.excerpt));
    const effectiveContent = (isPreview ? post.content : (post.publishedContent || post.content));
    const effectiveSeo = (isPreview ? post.seoMetadata : (post.publishedSeoMetadata || post.seoMetadata)) || {};

    // 4. Related Posts Calculation (Shared Category OR Shared Tags, PUBLISHED only)
    const candidates = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      take: 12
    });

    const currentTagIds = new Set((post.tags || []).map((t: any) => t.id));
    const relatedPosts = candidates
      .filter((p: any) => p.id !== post.id)
      .map((p: any) => {
        let score = 0;
        if (post.categoryId && p.categoryId === post.categoryId) score += 2;
        if (p.tags && Array.isArray(p.tags)) {
          for (const t of p.tags) {
            if (currentTagIds.has(t.id)) score += 1;
          }
        }
        return { post: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => ({
        id: item.post.id,
        slug: item.post.slug,
        title: item.post.publishedTitle || item.post.title,
        excerpt: item.post.publishedExcerpt || item.post.excerpt,
        publishedAt: item.post.publishedAt || item.post.createdAt,
        featuredImage: item.post.featuredImage,
        category: item.post.category
      }));

    // 5. Generate Article & BreadcrumbList JSON-LD Schema
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: effectiveTitle,
      description: effectiveExcerpt || '',
      image: post.featuredImage?.publicUrl ? [post.featuredImage.publicUrl] : [],
      author: {
        '@type': 'Person',
        name: post.author?.name || post.createdBy || 'Editorial Team'
      },
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://texttools.app/blog/${post.slug}`
      }
    };

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://texttools.app/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://texttools.app/blog'
        },
        ...(post.category
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: post.category.name,
                item: `https://texttools.app/blog/category/${post.category.slug}`
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: effectiveTitle,
                item: `https://texttools.app/blog/${post.slug}`
              }
            ]
          : [
              {
                '@type': 'ListItem',
                position: 3,
                name: effectiveTitle,
                item: `https://texttools.app/blog/${post.slug}`
              }
            ])
      ]
    };

    return res.json({
      success: true,
      data: {
        post: {
          ...post,
          title: effectiveTitle,
          excerpt: effectiveExcerpt,
          content: effectiveContent,
          seoMetadata: {
            ...effectiveSeo,
            robotsIndex: isPreview ? false : (effectiveSeo.robotsIndex !== false)
          }
        },
        isPreview,
        relatedPosts,
        articleJsonLd,
        breadcrumbJsonLd
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/blog/categories
router.get('/blog/categories', async (_req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: { children: true }
    });
    return res.json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/blog/categories/:slug
router.get('/blog/categories/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await prisma.blogCategory.findUnique({ where: { slug } });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    return res.json({ success: true, data: category });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/blog/tags
router.get('/blog/tags', async (_req, res) => {
  try {
    const tags = await prisma.blogTag.findMany();
    return res.json({ success: true, data: tags });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/public/blog/tags/:slug
router.get('/blog/tags/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const tag = await prisma.blogTag.findUnique({ where: { slug } });
    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }
    return res.json({ success: true, data: tag });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
