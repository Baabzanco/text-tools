import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth';
import { BlogPostStatus } from '@prisma/client';

const router = Router();
router.use(requireAdminAuth);

// Unicode-aware and URL-safe slug validator & generator
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens, but preserve Arabic/Persian/Unicode letters and alphanumeric
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export function validateSlug(slug: string): boolean {
  if (!slug || slug.trim().length === 0) return false;
  // Allow unicode letters, numbers, hyphens, and underscores
  return /^[\p{L}\p{N}_-]+$/u.test(slug);
}

// Deep check for Base64 image payload in Tiptap JSON or string
export function containsBase64Image(content: any): boolean {
  const str = typeof content === 'string' ? content : JSON.stringify(content || {});
  return /data:image\/[a-zA-Z]+;base64/i.test(str);
}

// Robust HTML & XSS sanitization helper (stripping scripts, inline handlers, javascript: URIs)
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'href="#"')
    .replace(/src\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, 'src=""');
}

// ==========================================
// CATEGORIES (with full hierarchy support)
// ==========================================

// GET /api/admin/blog/categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: { children: true }
    });
    return res.json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/categories
router.post('/categories', async (req: AuthenticatedRequest, res) => {
  const { name, slug, description, parentId, featuredImageId, seoMetadata } = req.body || {};
  if (!name) {
    return res.status(400).json({ success: false, error: 'Category name is required' });
  }
  const cleanSlug = slug ? slugify(slug) : slugify(name);
  if (!validateSlug(cleanSlug)) {
    return res.status(400).json({ success: false, error: 'Invalid category slug.' });
  }

  try {
    const existing = await prisma.blogCategory.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Category slug already in use' });
    }

    if (parentId) {
      const parent = await prisma.blogCategory.findUnique({ where: { id: parentId } });
      if (!parent) {
        return res.status(400).json({ success: false, error: 'Parent category does not exist' });
      }
    }

    const cat = await prisma.blogCategory.create({
      data: {
        name,
        slug: cleanSlug,
        description: description || null,
        parentId: parentId || null,
        featuredImageId: featuredImageId || null,
        seoMetadata: seoMetadata || {
          seoTitle: name,
          metaDescription: description || '',
          canonicalUrl: `/blog/category/${cleanSlug}`,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: name,
          ogDescription: description || '',
          ogImage: '',
          twitterTitle: name,
          twitterDescription: description || '',
          twitterImage: ''
        }
      }
    });
    return res.json({ success: true, data: cat });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/blog/categories/:id
router.put('/categories/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, slug, description, parentId, featuredImageId, seoMetadata } = req.body || {};

  try {
    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    let cleanSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      cleanSlug = slugify(slug);
      if (!validateSlug(cleanSlug)) {
        return res.status(400).json({ success: false, error: 'Invalid slug' });
      }
      const duplicate = await prisma.blogCategory.findUnique({ where: { slug: cleanSlug } });
      if (duplicate && duplicate.id !== id) {
        return res.status(400).json({ success: false, error: 'Category slug already in use' });
      }
    }

    if (parentId !== undefined && parentId) {
      if (parentId === id) {
        return res.status(400).json({ success: false, error: 'Category cannot be its own parent.' });
      }
      // Check for circular hierarchy: ensure parentId is not already a descendant
      let currentParentId: string | null = parentId;
      while (currentParentId) {
        const parentCheck = await prisma.blogCategory.findUnique({ where: { id: currentParentId } });
        if (!parentCheck) break;
        if (parentCheck.parentId === id) {
          return res.status(400).json({ success: false, error: 'Invalid category hierarchy: Circular hierarchy detected.' });
        }
        currentParentId = parentCheck.parentId || null;
      }
    }

    const updated = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        slug: cleanSlug,
        description: description !== undefined ? description : existing.description,
        parentId: parentId !== undefined ? (parentId || null) : existing.parentId,
        featuredImageId: featuredImageId !== undefined ? (featuredImageId || null) : existing.featuredImageId,
        seoMetadata: seoMetadata !== undefined ? seoMetadata : existing.seoMetadata
      }
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/blog/categories/:id
router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Safe deletion: Check child categories
    const childrenCount = await prisma.blogCategory.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category: It has child categories. Please reassign or delete child categories first.'
      });
    }

    // Safe deletion: Check posts
    const postCount = await prisma.blogPost.count({ where: { categoryId: id } });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category: It is currently assigned to one or more blog posts.'
      });
    }

    const deleted = await prisma.blogCategory.delete({ where: { id } });
    return res.json({ success: true, data: deleted });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// ==========================================
// TAGS
// ==========================================

// GET /api/admin/blog/tags
router.get('/tags', async (_req, res) => {
  try {
    const tags = await prisma.blogTag.findMany();
    return res.json({ success: true, data: tags });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/tags
router.post('/tags', async (req: AuthenticatedRequest, res) => {
  const { name, slug, description, seoMetadata } = req.body || {};
  if (!name) {
    return res.status(400).json({ success: false, error: 'Tag name is required' });
  }
  const cleanSlug = slug ? slugify(slug) : slugify(name);
  if (!validateSlug(cleanSlug)) {
    return res.status(400).json({ success: false, error: 'Invalid slug format.' });
  }

  try {
    const existing = await prisma.blogTag.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Tag slug already in use' });
    }

    const t = await prisma.blogTag.create({
      data: {
        name,
        slug: cleanSlug,
        description: description || null,
        seoMetadata: seoMetadata || {
          seoTitle: name,
          metaDescription: description || '',
          canonicalUrl: `/blog/tag/${cleanSlug}`,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: name,
          ogDescription: description || '',
          ogImage: '',
          twitterTitle: name,
          twitterDescription: description || '',
          twitterImage: ''
        }
      }
    });
    return res.json({ success: true, data: t });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/blog/tags/:id
router.put('/tags/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, slug, description, seoMetadata } = req.body || {};

  try {
    const existing = await prisma.blogTag.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    let cleanSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      cleanSlug = slugify(slug);
      if (!validateSlug(cleanSlug)) {
        return res.status(400).json({ success: false, error: 'Invalid slug' });
      }
      const duplicate = await prisma.blogTag.findUnique({ where: { slug: cleanSlug } });
      if (duplicate && duplicate.id !== id) {
        return res.status(400).json({ success: false, error: 'Tag slug already in use' });
      }
    }

    const updated = await prisma.blogTag.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        slug: cleanSlug,
        description: description !== undefined ? description : existing.description,
        seoMetadata: seoMetadata !== undefined ? seoMetadata : existing.seoMetadata
      }
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/blog/tags/:id
router.delete('/tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await prisma.blogTag.delete({ where: { id } });
    return res.json({ success: true, data: deleted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// BLOG POSTS (Management & Full Lifecycle)
// ==========================================

// GET /api/admin/blog/posts (paginated, filterable)
router.get('/posts', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;
  const status = req.query.status as string;
  const categoryId = req.query.categoryId as string;
  const authorId = req.query.authorId as string;
  const search = req.query.search as string;

  const where: any = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (authorId) where.authorId = authorId;
  if (search) where.search = search;

  try {
    const totalCount = await prisma.blogPost.count({ where });
    const posts = await prisma.blogPost.findMany({
      where,
      take: limit,
      skip,
      include: {
        category: true,
        featuredImage: true,
        author: true
      }
    });

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

// GET /api/admin/blog/posts/:id
router.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const revisions = await prisma.blogPostRevision.findMany({
      where: { postId: post.id }
    });

    return res.json({
      success: true,
      data: {
        post,
        revisions
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/posts
router.post('/posts', async (req: AuthenticatedRequest, res) => {
  const { title, slug, excerpt, content, status, categoryId, tagIds, featuredImageId, seoMetadata } = req.body || {};
  const adminName = req.user?.name || 'Admin';
  const authorId = req.user?.id || null;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }
  const cleanSlug = slug ? slugify(slug) : slugify(title);
  if (!validateSlug(cleanSlug)) {
    return res.status(400).json({ success: false, error: 'Invalid post slug' });
  }

  // Tiptap Content Validation: Reject Base64 Images
  if (content && containsBase64Image(content)) {
    return res.status(400).json({
      success: false,
      error: 'Security Error: Base64 embedded images are not allowed. Please upload images through the Media Library.'
    });
  }

  const initialDocument = content || {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  };

  try {
    const existing = await prisma.blogPost.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Post slug already in use' });
    }

    const isPublished = status === BlogPostStatus.PUBLISHED;
    const publishedAt = isPublished ? new Date() : null;

    const fullSeo = seoMetadata || {
      seoTitle: title,
      metaDescription: excerpt || '',
      canonicalUrl: `/blog/${cleanSlug}`,
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: title,
      ogDescription: excerpt || '',
      ogImage: '',
      twitterTitle: title,
      twitterDescription: excerpt || '',
      twitterImage: ''
    };

    const post = await prisma.$transaction(async (tx) => {
      // 1. Create Post
      const created = await tx.blogPost.create({
        data: {
          title,
          slug: cleanSlug,
          excerpt: excerpt || null,
          content: initialDocument,
          status: status || BlogPostStatus.DRAFT,
          publishedAt,
          createdBy: adminName,
          updatedBy: adminName,
          authorId,
          categoryId: categoryId || null,
          featuredImageId: featuredImageId || null,
          publishedContent: isPublished ? initialDocument : null,
          publishedTitle: isPublished ? title : null,
          publishedExcerpt: isPublished ? (excerpt || null) : null,
          publishedSeoMetadata: isPublished ? fullSeo : null,
          seoMetadata: fullSeo
        }
      });

      // 2. Associate Tags
      if (tagIds && Array.isArray(tagIds)) {
        for (const tagId of tagIds) {
          await tx.blogPostTag.create({
            data: { postId: created.id, tagId }
          });
        }
      }

      // 3. Create Version 1 Revision
      await tx.blogPostRevision.create({
        data: {
          postId: created.id,
          versionNumber: 1,
          title,
          content: initialDocument,
          excerpt: excerpt || null,
          seoMetadata: fullSeo,
          changeSummary: 'Initial document created',
          authorId,
          createdBy: adminName
        }
      });

      return created;
    });

    const fullPost = await prisma.blogPost.findUnique({ where: { id: post.id } });
    return res.json({ success: true, data: fullPost });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/blog/posts/:id (Working draft updates - maintains published version stability)
router.put('/posts/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, content, categoryId, tagIds, featuredImageId, seoMetadata, changeSummary } = req.body || {};
  const adminName = req.user?.name || 'Admin';
  const authorId = req.user?.id || null;

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Tiptap Content Validation: Reject Base64 Images
    if (content && containsBase64Image(content)) {
      return res.status(400).json({
        success: false,
        error: 'Security Error: Base64 embedded images are not allowed. Please upload images through the Media Library.'
      });
    }

    let cleanSlug = post.slug;
    if (slug && slug !== post.slug) {
      cleanSlug = slugify(slug);
      if (!validateSlug(cleanSlug)) {
        return res.status(400).json({ success: false, error: 'Invalid slug' });
      }
      const duplicate = await prisma.blogPost.findUnique({ where: { slug: cleanSlug } });
      if (duplicate && duplicate.id !== id) {
        return res.status(400).json({ success: false, error: 'Slug already in use' });
      }

      // If already published and slug changed, automatically register 301 Redirect!
      if (post.status === 'PUBLISHED') {
        await prisma.redirect.create({
          data: {
            fromPath: `/blog/${post.slug}`,
            toPath: `/blog/${cleanSlug}`,
            statusCode: 301
          }
        });
      }
    }

    const updatedPost = await prisma.$transaction(async (tx) => {
      // 1. Update working draft fields. Note: Published snapshot is NOT overwritten by plain PUT!
      // This strictly guarantees Published Version Stability until explicit publish action.
      const updated = await tx.blogPost.update({
        where: { id },
        data: {
          title: title !== undefined ? title : post.title,
          slug: cleanSlug,
          excerpt: excerpt !== undefined ? excerpt : post.excerpt,
          content: content !== undefined ? content : post.content,
          updatedBy: adminName,
          authorId: authorId || post.authorId,
          categoryId: categoryId !== undefined ? (categoryId || null) : post.categoryId,
          featuredImageId: featuredImageId !== undefined ? (featuredImageId || null) : post.featuredImageId,
          seoMetadata: seoMetadata !== undefined ? seoMetadata : post.seoMetadata
        }
      });

      // 2. Manage Tag Junction updates
      if (tagIds && Array.isArray(tagIds)) {
        await tx.blogPostTag.deleteMany({ where: { postId: id } });
        for (const tagId of tagIds) {
          await tx.blogPostTag.create({
            data: { postId: id, tagId }
          });
        }
      }

      // 3. Auto-save Revision
      const revCount = await tx.blogPostRevision.count({ where: { postId: id } });
      const versionNumber = revCount + 1;

      await tx.blogPostRevision.create({
        data: {
          postId: id,
          versionNumber,
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
          seoMetadata: updated.seoMetadata,
          changeSummary: changeSummary || `Draft updated (v${versionNumber})`,
          authorId,
          createdBy: adminName
        }
      });

      return updated;
    });

    const fullPost = await prisma.blogPost.findUnique({ where: { id: updatedPost.id } });
    return res.json({ success: true, data: fullPost });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/posts/:id/publish (Explicit transactional publishing with snapshot)
router.post('/posts/:id/publish', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const adminName = req.user?.name || 'Admin';

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const published = await prisma.$transaction(async (tx) => {
      // Snapshot working draft into public published state
      const updated = await tx.blogPost.update({
        where: { id },
        data: {
          status: BlogPostStatus.PUBLISHED,
          publishedAt: new Date(),
          scheduledAt: null,
          publishedContent: post.content,
          publishedTitle: post.title,
          publishedExcerpt: post.excerpt,
          publishedSeoMetadata: post.seoMetadata,
          updatedBy: adminName
        }
      });

      const revCount = await tx.blogPostRevision.count({ where: { postId: id } });
      await tx.blogPostRevision.create({
        data: {
          postId: id,
          versionNumber: revCount + 1,
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
          seoMetadata: updated.seoMetadata,
          changeSummary: 'Explicitly published version to public',
          authorId: req.user?.id || null,
          createdBy: adminName
        }
      });

      return updated;
    });

    return res.json({ success: true, data: published });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/posts/:id/schedule (Validate scheduledAt in future)
router.post('/posts/:id/schedule', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { scheduledAt } = req.body || {};
  const adminName = req.user?.name || 'Admin';

  if (!scheduledAt) {
    return res.status(400).json({ success: false, error: 'scheduledAt date is required' });
  }

  const targetDate = new Date(scheduledAt);
  if (isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
    return res.status(400).json({ success: false, error: 'scheduledAt must be a valid future timestamp' });
  }

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const scheduled = await prisma.$transaction(async (tx) => {
      const updated = await tx.blogPost.update({
        where: { id },
        data: {
          status: BlogPostStatus.SCHEDULED,
          scheduledAt: targetDate,
          updatedBy: adminName
        }
      });

      const revCount = await tx.blogPostRevision.count({ where: { postId: id } });
      await tx.blogPostRevision.create({
        data: {
          postId: id,
          versionNumber: revCount + 1,
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
          seoMetadata: updated.seoMetadata,
          changeSummary: `Scheduled for publication at ${targetDate.toISOString()}`,
          authorId: req.user?.id || null,
          createdBy: adminName
        }
      });

      return updated;
    });

    return res.json({ success: true, data: scheduled });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/posts/:id/archive
router.post('/posts/:id/archive', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const adminName = req.user?.name || 'Admin';

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const archived = await prisma.$transaction(async (tx) => {
      const updated = await tx.blogPost.update({
        where: { id },
        data: {
          status: BlogPostStatus.ARCHIVED,
          updatedBy: adminName
        }
      });

      const revCount = await tx.blogPostRevision.count({ where: { postId: id } });
      await tx.blogPostRevision.create({
        data: {
          postId: id,
          versionNumber: revCount + 1,
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
          seoMetadata: updated.seoMetadata,
          changeSummary: 'Archived post',
          authorId: req.user?.id || null,
          createdBy: adminName
        }
      });

      return updated;
    });

    return res.json({ success: true, data: archived });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/blog/posts/:id/revisions
router.get('/posts/:id/revisions', async (req, res) => {
  const { id } = req.params;
  try {
    const revisions = await prisma.blogPostRevision.findMany({
      where: { postId: id },
      orderBy: { versionNumber: 'desc' }
    });
    return res.json({ success: true, data: revisions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/posts/:id/restore
router.post('/posts/:id/restore', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { revisionId } = req.body || {};
  const adminName = req.user?.name || 'Admin';

  if (!revisionId) {
    return res.status(400).json({ success: false, error: 'revisionId is required' });
  }

  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const revisions = await prisma.blogPostRevision.findMany({ where: { postId: id } });
    const targetRev = revisions.find((r: any) => r.id === revisionId);
    if (!targetRev) {
      return res.status(404).json({ success: false, error: 'Revision not found' });
    }

    const restored = await prisma.$transaction(async (tx) => {
      // Update working draft with revision data
      const updated = await tx.blogPost.update({
        where: { id },
        data: {
          title: targetRev.title,
          content: targetRev.content,
          excerpt: targetRev.excerpt,
          seoMetadata: targetRev.seoMetadata,
          updatedBy: adminName
        }
      });

      // Restoring MUST create a brand new revision!
      const newVersionNum = revisions.length + 1;
      await tx.blogPostRevision.create({
        data: {
          postId: id,
          versionNumber: newVersionNum,
          title: targetRev.title,
          content: targetRev.content,
          excerpt: targetRev.excerpt,
          seoMetadata: targetRev.seoMetadata,
          changeSummary: `Restored from revision ${targetRev.versionNumber}`,
          authorId: req.user?.id || null,
          createdBy: adminName
        }
      });

      return updated;
    });

    return res.json({ success: true, data: restored });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/blog/posts/:id/duplicate
router.post('/posts/:id/duplicate', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const adminName = req.user?.name || 'Admin';

  try {
    const original = await prisma.blogPost.findUnique({ where: { id } });
    if (!original) {
      return res.status(404).json({ success: false, error: 'Original post not found' });
    }

    let newSlug = `${original.slug}-copy`;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug: newSlug } })) {
      counter++;
      newSlug = `${original.slug}-copy-${counter}`;
    }

    const duplicated = await prisma.$transaction(async (tx) => {
      const newPost = await tx.blogPost.create({
        data: {
          title: `${original.title} (Copy)`,
          slug: newSlug,
          excerpt: original.excerpt,
          content: original.content,
          status: BlogPostStatus.DRAFT,
          categoryId: original.categoryId,
          featuredImageId: original.featuredImageId,
          authorId: req.user?.id || null,
          createdBy: adminName,
          updatedBy: adminName,
          seoMetadata: original.seoMetadata
        }
      });

      // Copy tag relations
      const originalTags = await tx.blogPostTag.findMany({ where: { postId: original.id } });
      for (const t of originalTags) {
        await tx.blogPostTag.create({
          data: { postId: newPost.id, tagId: t.tagId }
        });
      }

      // Initial version 1 for duplicate
      await tx.blogPostRevision.create({
        data: {
          postId: newPost.id,
          versionNumber: 1,
          title: newPost.title,
          content: newPost.content,
          excerpt: newPost.excerpt,
          seoMetadata: newPost.seoMetadata,
          changeSummary: `Duplicated from "${original.title}"`,
          authorId: req.user?.id || null,
          createdBy: adminName
        }
      });

      return newPost;
    });

    const fullDuplicate = await prisma.blogPost.findUnique({ where: { id: duplicated.id } });
    return res.json({ success: true, data: fullDuplicate });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/blog/posts/:id
router.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await prisma.blogPost.delete({ where: { id } });
    return res.json({ success: true, data: deleted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
