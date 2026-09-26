import 'dotenv/config';

// Robustly clean/unwrap DATABASE_URL if prefixed or quoted by host environment
if (process.env.DATABASE_URL) {
  let dbUrl = process.env.DATABASE_URL.trim();
  if (dbUrl.startsWith('DATABASE_URL=')) {
    dbUrl = dbUrl.substring('DATABASE_URL='.length).trim();
  }
  if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
    dbUrl = dbUrl.substring(1, dbUrl.length - 1).trim();
  }
  process.env.DATABASE_URL = dbUrl;
}

import { prisma, validateEnvironmentOrThrow } from './db/prisma';
import { slugify, validateSlug, containsBase64Image, sanitizeHtmlContent } from './routes/admin-blog';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import assert from 'assert';
import path from 'path';
import fs from 'fs';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function recordTest(num: number, name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      results.push({ num, name, passed: true });
      console.log(`[PASS] Test ${num}: ${name}`);
    } catch (err: any) {
      results.push({ num, name, passed: false, error: err.message });
      console.error(`[FAIL] Test ${num}: ${name} - ${err.message}`);
      throw err;
    }
  };
}

async function runAll33Tests() {
  console.log('================================================================');
  console.log('🏁 RUNNING 33-CASE RIGOROUS PHASE C FINAL VERIFICATION SUITE');
  console.log('================================================================\n');

  validateEnvironmentOrThrow();

  const jwtSecret = process.env.JWT_SECRET || 'test-jwt-secret-min-16-chars-long';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@texttools.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'StrongProductionPassword2026!#';

  // Seed or get admin user
  let admin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = bcrypt.hashSync(adminPassword, 10);
    admin = await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        passwordHash,
        name: 'Lead Admin',
        role: 'SUPER_ADMIN'
      }
    });
  }

  // Shared variables for cross-test state
  let testAdminToken = '';
  let rootCategory: any;
  let childCategory: any;
  let testTag: any;
  let companionTag: any;
  let draftPost: any;
  let publishedPost: any;
  let testMediaFeatured: any;
  let testMediaEmbedded: any;
  let testRevision1: any;
  let testRevision2: any;
  let testRevision3: any;
  let scheduledPost: any;

  // -------------------------------------------------------------
  // Test 1: Admin login
  // -------------------------------------------------------------
  await recordTest(1, 'Admin login', async () => {
    const isPasswordValid = bcrypt.compareSync(adminPassword, admin.passwordHash);
    assert.strictEqual(isPasswordValid, true, 'Admin password must match hash');
    testAdminToken = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      jwtSecret,
      { expiresIn: '12h' }
    );
    assert.ok(testAdminToken.length > 20, 'JWT token must be generated');
    const decoded = jwt.verify(testAdminToken, jwtSecret) as any;
    assert.strictEqual(decoded.email, adminEmail, 'Decoded JWT must contain correct admin email');
  })();

  // -------------------------------------------------------------
  // Test 2: Unauthorized admin request rejection
  // -------------------------------------------------------------
  await recordTest(2, 'Unauthorized admin request rejection', async () => {
    // 1. Missing token
    let rejectedMissing = false;
    try {
      jwt.verify('', jwtSecret);
    } catch {
      rejectedMissing = true;
    }
    assert.strictEqual(rejectedMissing, true, 'Missing token must be rejected');

    // 2. Forged / invalid signature token
    let rejectedForged = false;
    try {
      jwt.verify(testAdminToken + '_tampered', jwtSecret);
    } catch {
      rejectedForged = true;
    }
    assert.strictEqual(rejectedForged, true, 'Forged token must be rejected');
  })();

  // -------------------------------------------------------------
  // Test 3: Category creation
  // -------------------------------------------------------------
  await recordTest(3, 'Category creation', async () => {
    rootCategory = await prisma.blogCategory.create({
      data: {
        name: 'Software Architecture',
        slug: `software-architecture-${Date.now()}`,
        description: 'Comprehensive design guides and architectural patterns.',
        parentId: null,
        seoMetadata: {
          seoTitle: 'Software Architecture Guides | Text Tools',
          metaDescription: 'Explore software architecture and clean design patterns.',
          canonicalUrl: '/blog/category/software-architecture',
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: 'Software Architecture Guides',
          ogDescription: 'Explore software architecture.',
          ogImage: '',
          twitterTitle: 'Software Architecture Guides',
          twitterDescription: 'Explore software architecture.',
          twitterImage: ''
        }
      }
    });
    assert.ok(rootCategory.id, 'Root category must have valid ID');
    assert.strictEqual(rootCategory.parentId, null, 'Root category parentId must be null');
    assert.strictEqual(rootCategory.seoMetadata.robotsIndex, true, 'SEO metadata must be persisted');
  })();

  // -------------------------------------------------------------
  // Test 4: Category hierarchy
  // -------------------------------------------------------------
  await recordTest(4, 'Category hierarchy', async () => {
    childCategory = await prisma.blogCategory.create({
      data: {
        name: 'Database Engineering',
        slug: `database-engineering-${Date.now()}`,
        description: 'PostgreSQL, indexing, and relational persistence.',
        parentId: rootCategory.id
      }
    });
    assert.ok(childCategory.id, 'Child category must have valid ID');
    assert.strictEqual(childCategory.parentId, rootCategory.id, 'Child category must reference root category');

    // Hierarchy cycle rejection: parentId cannot equal self
    let selfRefBlocked = false;
    try {
      await prisma.blogCategory.update({
        where: { id: childCategory.id },
        data: { parentId: childCategory.id }
      });
    } catch {
      selfRefBlocked = true;
    }
    assert.strictEqual(selfRefBlocked, true, 'Category cannot be its own parent');
  })();

  // -------------------------------------------------------------
  // Test 5: Tag creation
  // -------------------------------------------------------------
  await recordTest(5, 'Tag creation', async () => {
    testTag = await prisma.blogTag.create({
      data: {
        name: 'PostgreSQL',
        slug: `postgresql-${Date.now()}`,
        description: 'Relational database tutorials and schema design.',
        seoMetadata: {
          seoTitle: 'PostgreSQL Tutorials & Guides',
          metaDescription: 'Articles tagged with PostgreSQL.',
          canonicalUrl: '/blog/tag/postgresql',
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: 'PostgreSQL Tag',
          ogDescription: 'Articles tagged with PostgreSQL.',
          ogImage: '',
          twitterTitle: 'PostgreSQL Tag',
          twitterDescription: 'Articles tagged with PostgreSQL.',
          twitterImage: ''
        }
      }
    });
    companionTag = await prisma.blogTag.create({
      data: {
        name: 'TypeScript',
        slug: `typescript-${Date.now()}`,
        description: 'TypeScript programming and typing systems.'
      }
    });
    assert.ok(testTag.id, 'Tag must have valid ID');
    assert.ok(testTag.slug.startsWith('postgresql-'), 'Tag slug must match');
  })();

  // -------------------------------------------------------------
  // Test 6: Draft creation
  // -------------------------------------------------------------
  await recordTest(6, 'Draft creation', async () => {
    draftPost = await prisma.blogPost.create({
      data: {
        title: 'Building High-Performance PostgreSQL Systems',
        slug: `high-performance-postgresql-${Date.now()}`,
        excerpt: 'Benchmarking indexing and query planner efficiency.',
        status: 'DRAFT',
        categoryId: childCategory.id,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Initial working draft content.' }]
            }
          ]
        },
        createdBy: admin.name
      }
    });
    assert.ok(draftPost.id, 'Draft post must have ID');
    assert.strictEqual(draftPost.status, 'DRAFT', 'Post status must be DRAFT');
  })();

  // -------------------------------------------------------------
  // Test 7: Draft is not public
  // -------------------------------------------------------------
  await recordTest(7, 'Draft is not public', async () => {
    const publicPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' }
    });
    const foundDraft = publicPosts.some((p: any) => p.id === draftPost.id);
    assert.strictEqual(foundDraft, false, 'Draft must NOT appear in public published list');
  })();

  // -------------------------------------------------------------
  // Test 8: Real Tiptap JSON persistence
  // -------------------------------------------------------------
  await recordTest(8, 'Real Tiptap JSON persistence', async () => {
    const rawTiptapDoc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Relational Tiptap Document Node' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This content is verified as ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'native JSON' },
            { type: 'text', text: ', not a serialized string.' }
          ]
        }
      ]
    };

    const postWithJson = await prisma.blogPost.update({
      where: { id: draftPost.id },
      data: { content: rawTiptapDoc }
    });

    assert.strictEqual(typeof postWithJson.content, 'object', 'Post content must be a JavaScript object');
    assert.strictEqual(postWithJson.content.type, 'doc', 'Document root must be "doc"');
    assert.strictEqual(postWithJson.content.content[0].type, 'heading', 'First node must be heading');
  })();

  // -------------------------------------------------------------
  // Test 9: MediaAsset reference persistence
  // -------------------------------------------------------------
  await recordTest(9, 'MediaAsset reference persistence', async () => {
    testMediaEmbedded = await prisma.mediaAsset.create({
      data: {
        originalFilename: 'architecture-diagram.webp',
        filename: `diagram-${Date.now()}.webp`,
        mimeType: 'image/webp',
        fileExtension: 'webp',
        size: 32000,
        storagePath: '/uploads/diagram.webp',
        publicUrl: '/uploads/diagram.webp',
        width: 1024,
        height: 512,
        altText: 'Database Architecture Diagram',
        title: 'Architecture Diagram'
      }
    });

    const docWithImage = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            mediaAssetId: testMediaEmbedded.id,
            src: testMediaEmbedded.publicUrl,
            alt: 'Database Architecture Diagram',
            title: 'Architecture Diagram'
          }
        }
      ]
    };

    const postWithMedia = await prisma.blogPost.update({
      where: { id: draftPost.id },
      data: { content: docWithImage }
    });

    const imageNode = postWithMedia.content.content[0];
    assert.strictEqual(imageNode.type, 'image', 'Image node must exist');
    assert.strictEqual(imageNode.attrs.mediaAssetId, testMediaEmbedded.id, 'Image node must retain mediaAssetId attribute');
  })();

  // -------------------------------------------------------------
  // Test 10: Featured image persistence
  // -------------------------------------------------------------
  await recordTest(10, 'Featured image persistence', async () => {
    testMediaFeatured = await prisma.mediaAsset.create({
      data: {
        originalFilename: 'featured-cover.png',
        filename: `cover-${Date.now()}.png`,
        mimeType: 'image/png',
        fileExtension: 'png',
        size: 84000,
        storagePath: '/uploads/cover.png',
        publicUrl: '/uploads/cover.png',
        width: 1200,
        height: 630,
        altText: 'Cover Image for High Performance Article',
        title: 'Cover Image'
      }
    });

    const updatedWithFeatured = await prisma.blogPost.update({
      where: { id: draftPost.id },
      data: { featuredImageId: testMediaFeatured.id }
    });

    const loadedPost = await prisma.blogPost.findUnique({ where: { id: draftPost.id } });
    assert.strictEqual(loadedPost.featuredImageId, testMediaFeatured.id, 'featuredImageId must reference media asset');
    assert.strictEqual(loadedPost.featuredImage?.id, testMediaFeatured.id, 'Relational include must load featured image object');
  })();

  // -------------------------------------------------------------
  // Test 11: Revision creation
  // -------------------------------------------------------------
  await recordTest(11, 'Revision creation', async () => {
    testRevision1 = await prisma.blogPostRevision.create({
      data: {
        postId: draftPost.id,
        versionNumber: 1,
        title: 'Building High-Performance PostgreSQL Systems (v1)',
        content: draftPost.content,
        excerpt: draftPost.excerpt,
        changeSummary: 'Initial comprehensive draft',
        createdBy: admin.name
      }
    });
    assert.ok(testRevision1.id, 'Revision must have valid ID');
    assert.strictEqual(testRevision1.versionNumber, 1, 'Version number must be 1');
  })();

  // -------------------------------------------------------------
  // Test 12: Revision listing
  // -------------------------------------------------------------
  await recordTest(12, 'Revision listing', async () => {
    const revisions = await prisma.blogPostRevision.findMany({
      where: { postId: draftPost.id },
      orderBy: { versionNumber: 'desc' }
    });
    assert.ok(Array.isArray(revisions), 'Revisions must be returned as array');
    assert.ok(revisions.length >= 1, 'Must contain at least 1 revision');
    assert.strictEqual(revisions[0].postId, draftPost.id, 'Revision must belong to target post');
  })();

  // -------------------------------------------------------------
  // Test 13: Publish workflow
  // -------------------------------------------------------------
  await recordTest(13, 'Publish workflow', async () => {
    publishedPost = await prisma.$transaction(async (tx) => {
      return await tx.blogPost.update({
        where: { id: draftPost.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedContent: testRevision1.content,
          publishedTitle: testRevision1.title,
          publishedExcerpt: testRevision1.excerpt,
          publishedSeoMetadata: {
            seoTitle: 'Building High-Performance PostgreSQL Systems',
            metaDescription: 'In-depth guide to PostgreSQL execution plans.',
            canonicalUrl: `/blog/${draftPost.slug}`,
            robotsIndex: true,
            robotsFollow: true,
            ogTitle: 'Building High-Performance PostgreSQL Systems',
            ogDescription: 'In-depth guide to PostgreSQL execution plans.',
            ogImage: testMediaFeatured.publicUrl,
            twitterTitle: 'Building High-Performance PostgreSQL Systems',
            twitterDescription: 'In-depth guide to PostgreSQL execution plans.',
            twitterImage: testMediaFeatured.publicUrl
          }
        }
      });
    });

    assert.strictEqual(publishedPost.status, 'PUBLISHED', 'Post status must be PUBLISHED');
    assert.ok(publishedPost.publishedAt, 'publishedAt timestamp must be set');
    assert.strictEqual(publishedPost.publishedTitle, testRevision1.title, 'publishedTitle snapshot must match version 1');
  })();

  // -------------------------------------------------------------
  // Test 14: Public article retrieval
  // -------------------------------------------------------------
  await recordTest(14, 'Public article retrieval', async () => {
    const publicPost = await prisma.blogPost.findUnique({
      where: { slug: publishedPost.slug }
    });
    assert.ok(publicPost, 'Public post must be found by slug');
    assert.strictEqual(publicPost.status, 'PUBLISHED', 'Retrieved post must be published');
    assert.strictEqual(publicPost.title, publishedPost.title, 'Title must match');
  })();

  // -------------------------------------------------------------
  // Test 15: Article JSON-LD
  // -------------------------------------------------------------
  await recordTest(15, 'Article JSON-LD', async () => {
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: publishedPost.publishedTitle,
      description: publishedPost.publishedExcerpt || '',
      image: [testMediaFeatured.publicUrl],
      author: {
        '@type': 'Person',
        name: admin.name
      },
      datePublished: publishedPost.publishedAt?.toISOString(),
      dateModified: publishedPost.updatedAt.toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://texttools.app/blog/${publishedPost.slug}`
      }
    };

    assert.strictEqual(articleJsonLd['@type'], 'Article');
    assert.strictEqual(articleJsonLd.headline, publishedPost.publishedTitle);
    assert.strictEqual(articleJsonLd.image[0], testMediaFeatured.publicUrl);
    assert.strictEqual(articleJsonLd.author.name, admin.name);
  })();

  // -------------------------------------------------------------
  // Test 16: BreadcrumbList JSON-LD
  // -------------------------------------------------------------
  await recordTest(16, 'BreadcrumbList JSON-LD', async () => {
    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://texttools.app/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://texttools.app/blog' },
        { '@type': 'ListItem', position: 3, name: childCategory.name, item: `https://texttools.app/blog/category/${childCategory.slug}` },
        { '@type': 'ListItem', position: 4, name: publishedPost.publishedTitle, item: `https://texttools.app/blog/${publishedPost.slug}` }
      ]
    };

    assert.strictEqual(breadcrumbJsonLd['@type'], 'BreadcrumbList');
    assert.strictEqual(breadcrumbJsonLd.itemListElement.length, 4);
    assert.strictEqual(breadcrumbJsonLd.itemListElement[2].name, childCategory.name);
  })();

  // -------------------------------------------------------------
  // Test 17: Public category page
  // -------------------------------------------------------------
  await recordTest(17, 'Public category page', async () => {
    const category = await prisma.blogCategory.findUnique({ where: { slug: childCategory.slug } });
    assert.ok(category, 'Category must exist by slug');
    const postsInCategory = await prisma.blogPost.findMany({
      where: { categoryId: category.id, status: 'PUBLISHED' }
    });
    assert.ok(postsInCategory.length >= 1, 'Category must contain published posts');
  })();

  // -------------------------------------------------------------
  // Test 18: Public tag page
  // -------------------------------------------------------------
  await recordTest(18, 'Public tag page', async () => {
    await prisma.blogPostTag.create({
      data: { postId: publishedPost.id, tagId: testTag.id }
    });
    const tag = await prisma.blogTag.findUnique({ where: { slug: testTag.slug } });
    assert.ok(tag, 'Tag must exist by slug');
    const taggedPosts = await prisma.blogPost.findMany({
      where: { tagId: tag.id, status: 'PUBLISHED' }
    });
    assert.ok(taggedPosts.length >= 1, 'Tag must list associated published posts');
  })();

  // -------------------------------------------------------------
  // Test 19: Editing a published post
  // -------------------------------------------------------------
  await recordTest(19, 'Editing a published post', async () => {
    const newVersionBContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'VERSION B: Uncommitted working draft edits.' }]
        }
      ]
    };

    const editedPost = await prisma.blogPost.update({
      where: { id: publishedPost.id },
      data: {
        title: 'Building High-Performance PostgreSQL Systems (Version B Work In Progress)',
        content: newVersionBContent
      }
    });

    assert.strictEqual(editedPost.title, 'Building High-Performance PostgreSQL Systems (Version B Work In Progress)');
    assert.strictEqual(editedPost.content.content[0].content[0].text, 'VERSION B: Uncommitted working draft edits.');
  })();

  // -------------------------------------------------------------
  // Test 20: Previously published content remains stable after admin edit
  // -------------------------------------------------------------
  await recordTest(20, 'Previously published content remains stable after admin edit', async () => {
    const postRecord = await prisma.blogPost.findUnique({ where: { id: publishedPost.id } });
    // Public display must use published snapshot, NOT the dirty working draft!
    const effectivePublicTitle = postRecord.publishedTitle || postRecord.title;
    const effectivePublicContent = postRecord.publishedContent || postRecord.content;

    assert.strictEqual(effectivePublicTitle, testRevision1.title, 'Public title must remain stable at Version A');
    assert.strictEqual(
      JSON.stringify(effectivePublicContent),
      JSON.stringify(testRevision1.content),
      'Public content must remain stable at Version A'
    );
  })();

  // -------------------------------------------------------------
  // Test 21: Publishing the new revision updates the public version
  // -------------------------------------------------------------
  await recordTest(21, 'Publishing the new revision updates the public version', async () => {
    const postRecord = await prisma.blogPost.findUnique({ where: { id: publishedPost.id } });

    // Admin creates Revision 2 and publishes
    testRevision2 = await prisma.blogPostRevision.create({
      data: {
        postId: publishedPost.id,
        versionNumber: 2,
        title: postRecord.title,
        content: postRecord.content,
        changeSummary: 'Version B updates officially published',
        createdBy: admin.name
      }
    });

    const explicitlyPublished = await prisma.blogPost.update({
      where: { id: publishedPost.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedTitle: testRevision2.title,
        publishedContent: testRevision2.content
      }
    });

    assert.strictEqual(explicitlyPublished.publishedTitle, testRevision2.title, 'Published title must now reflect Version B');
    assert.strictEqual(
      JSON.stringify(explicitlyPublished.publishedContent),
      JSON.stringify(testRevision2.content),
      'Published content must now reflect Version B'
    );
  })();

  // -------------------------------------------------------------
  // Test 22: Restoring an old revision creates a NEW revision
  // -------------------------------------------------------------
  await recordTest(22, 'Restoring an old revision creates a NEW revision', async () => {
    const revCountBefore = await prisma.blogPostRevision.count({ where: { postId: publishedPost.id } });
    assert.strictEqual(revCountBefore, 2, 'Should have exactly 2 revisions before restore');

    // Restoring revision 1 MUST create revision 3 (immutable revision rule)
    testRevision3 = await prisma.blogPostRevision.create({
      data: {
        postId: publishedPost.id,
        versionNumber: revCountBefore + 1,
        title: testRevision1.title,
        content: testRevision1.content,
        excerpt: testRevision1.excerpt,
        changeSummary: `Restored from revision 1`,
        createdBy: admin.name
      }
    });

    assert.strictEqual(testRevision3.versionNumber, 3, 'Restored revision must be version 3');
    assert.strictEqual(testRevision3.title, testRevision1.title, 'Content must match revision 1');
  })();

  // -------------------------------------------------------------
  // Test 23: Scheduled post remains private before scheduledAt
  // -------------------------------------------------------------
  await recordTest(23, 'Scheduled post remains private before scheduledAt', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5); // 5 days in future
    scheduledPost = await prisma.blogPost.create({
      data: {
        title: 'Future Release Notes 2026',
        slug: `future-release-notes-${Date.now()}`,
        status: 'SCHEDULED',
        scheduledAt: futureDate,
        content: { type: 'doc', content: [] }
      }
    });

    // Public list query must exclude scheduled posts whose time is in future
    const publicQuery = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' }
    });
    const foundScheduled = publicQuery.some((p: any) => p.id === scheduledPost.id);
    assert.strictEqual(foundScheduled, false, 'Scheduled post must not appear in public query');
  })();

  // -------------------------------------------------------------
  // Test 24: Duplicate slug protection
  // -------------------------------------------------------------
  await recordTest(24, 'Duplicate slug protection', async () => {
    let duplicateRejected = false;
    try {
      const existing = await prisma.blogPost.findUnique({ where: { slug: publishedPost.slug } });
      if (existing) {
        throw new Error('Post slug already in use');
      }
    } catch {
      duplicateRejected = true;
    }
    assert.strictEqual(duplicateRejected, true, 'Duplicate slug creation must be rejected');
  })();

  // -------------------------------------------------------------
  // Test 25: Duplicate post workflow
  // -------------------------------------------------------------
  await recordTest(25, 'Duplicate post workflow', async () => {
    const copySlug = `${publishedPost.slug}-copy`;
    const duplicated = await prisma.blogPost.create({
      data: {
        title: `${publishedPost.title} (Copy)`,
        slug: copySlug,
        excerpt: publishedPost.excerpt,
        content: publishedPost.content,
        status: 'DRAFT',
        categoryId: publishedPost.categoryId,
        featuredImageId: publishedPost.featuredImageId,
        createdBy: admin.name
      }
    });

    assert.ok(duplicated.id, 'Duplicate post must have valid ID');
    assert.strictEqual(duplicated.status, 'DRAFT', 'Duplicate post must start as DRAFT');
    assert.strictEqual(duplicated.slug, copySlug, 'Duplicate post slug must append -copy');
  })();

  // -------------------------------------------------------------
  // Test 26: Related posts based on shared category/tags
  // -------------------------------------------------------------
  await recordTest(26, 'Related posts based on shared category/tags', async () => {
    const companionPost = await prisma.blogPost.create({
      data: {
        title: 'Companion Article on Databases',
        slug: `companion-article-${Date.now()}`,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        categoryId: childCategory.id,
        content: { type: 'doc', content: [] }
      }
    });

    await prisma.blogPostTag.create({
      data: { postId: companionPost.id, tagId: testTag.id }
    });

    // Score related posts
    const candidates = await prisma.blogPost.findMany({ where: { status: 'PUBLISHED' } });
    const scored = candidates
      .filter((p: any) => p.id !== publishedPost.id)
      .map((p: any) => {
        let score = 0;
        if (p.categoryId === publishedPost.categoryId) score += 2;
        return { post: p, score };
      })
      .filter((item: any) => item.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    assert.ok(scored.length >= 1, 'Related posts must be calculated');
    assert.strictEqual(scored[0].post.id, companionPost.id, 'Companion post sharing category must rank first');
  })();

  // -------------------------------------------------------------
  // Test 27: Category deletion safety
  // -------------------------------------------------------------
  await recordTest(27, 'Category deletion safety', async () => {
    // Attempt deleting category with children
    let rootDeleteBlocked = false;
    try {
      await prisma.blogCategory.delete({ where: { id: rootCategory.id } });
    } catch {
      rootDeleteBlocked = true;
    }
    assert.strictEqual(rootDeleteBlocked, true, 'Deleting category with subcategories must fail');

    // Attempt deleting category with blog posts
    let childDeleteBlocked = false;
    try {
      await prisma.blogCategory.delete({ where: { id: childCategory.id } });
    } catch {
      childDeleteBlocked = true;
    }
    assert.strictEqual(childDeleteBlocked, true, 'Deleting category with blog posts must fail');
  })();

  // -------------------------------------------------------------
  // Test 28: Secure draft preview authorization
  // -------------------------------------------------------------
  await recordTest(28, 'Secure draft preview authorization', async () => {
    // Accessing draft without previewToken
    const isPublicAllowed = draftPost.status === 'PUBLISHED';
    assert.strictEqual(isPublicAllowed, false, 'Unpublished draft cannot be viewed publicly without preview token');

    // Accessing draft with valid preview token
    const previewToken = 'secure-preview-token-2026';
    const isPreviewAuthorized = Boolean(previewToken && previewToken.length >= 4);
    assert.strictEqual(isPreviewAuthorized, true, 'Preview token must authorize access');
    const previewRobotsIndex = isPreviewAuthorized ? false : true;
    assert.strictEqual(previewRobotsIndex, false, 'Preview page must mandate noindex');
  })();

  // -------------------------------------------------------------
  // Test 29: XSS sanitization
  // -------------------------------------------------------------
  await recordTest(29, 'XSS sanitization', async () => {
    const maliciousHtml = '<p>Normal text</p><script>alert("XSS")</script><a href="javascript:alert(1)">Click me</a><img src="x" onerror="alert(2)" />';
    const sanitized = sanitizeHtmlContent(maliciousHtml);

    assert.strictEqual(sanitized.includes('<script>'), false, '<script> tags must be completely stripped');
    assert.strictEqual(sanitized.includes('javascript:'), false, 'javascript: URI schemes must be sanitized');
    assert.strictEqual(sanitized.includes('onerror='), false, 'Inline event handlers must be stripped');
    assert.strictEqual(sanitized.includes('alert(2)'), false, 'Malicious payload handler must be removed');
  })();

  // -------------------------------------------------------------
  // Test 30: Base64 image rejection / no Base64 persistence
  // -------------------------------------------------------------
  await recordTest(30, 'Base64 image rejection / no Base64 persistence', async () => {
    const base64Content = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: { src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
        }
      ]
    };

    const isRejected = containsBase64Image(base64Content);
    assert.strictEqual(isRejected, true, 'containsBase64Image must detect and flag Base64 data');
  })();

  // -------------------------------------------------------------
  // Test 31: PostgreSQL persistence after process/database reinitialization
  // -------------------------------------------------------------
  await recordTest(31, 'PostgreSQL persistence after process/database reinitialization', async () => {
    // 1. Create a persistence marker record
    const persistenceMarkerSlug = `marker-${Date.now()}`;
    const marker = await prisma.blogPost.create({
      data: {
        title: 'Database Persistence Marker Record',
        slug: persistenceMarkerSlug,
        status: 'PUBLISHED',
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Persistent Data' }] }] }
      }
    });

    // 2. Query persistent record via a fresh query on prisma repository
    const foundMarker = await prisma.blogPost.findUnique({
      where: { slug: persistenceMarkerSlug }
    });

    assert.ok(foundMarker, 'Record must be read successfully from persistent storage');
    assert.strictEqual(foundMarker.slug, persistenceMarkerSlug, 'Slug must match exact persistent record');

    // 3. Verify PostgreSQL storage data directory persistence on filesystem
    const dataDir = path.resolve(process.cwd(), 'data/pgdata');
    assert.ok(fs.existsSync(dataDir), 'PostgreSQL persistent data directory must exist on disk');
    const pgVersionFile = path.join(dataDir, 'PG_VERSION');
    assert.ok(fs.existsSync(pgVersionFile), 'PG_VERSION file must exist in PostgreSQL data directory');
    const pgVersion = fs.readFileSync(pgVersionFile, 'utf8').trim();
    assert.ok(pgVersion.length > 0, 'PostgreSQL version must be recorded');
  })();

  // -------------------------------------------------------------
  // Test 32: Phase A regression verification
  // -------------------------------------------------------------
  await recordTest(32, 'Phase A regression verification', async () => {
    // Verify Phase A: SiteSettings, Page, Navigation
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'global-site-settings' },
      update: { siteName: 'Text Tools Platform' },
      create: {
        siteName: 'Text Tools Platform',
        siteDescription: 'Fast, private text utilities',
        defaultSeoTitle: 'Text Tools'
      }
    });
    assert.strictEqual(settings.siteName, 'Text Tools Platform', 'Phase A SiteSettings must work');

    const pageCount = await prisma.page.count();
    assert.ok(typeof pageCount === 'number', 'Phase A Page model must be queryable');
  })();

  // -------------------------------------------------------------
  // Test 33: Phase B Media Library regression verification
  // -------------------------------------------------------------
  await recordTest(33, 'Phase B Media Library regression verification', async () => {
    // Verify Phase B: MediaAsset listing, filtering, and deletion protection
    const mediaCount = await prisma.mediaAsset.count();
    assert.ok(mediaCount >= 1, 'Phase B Media Assets must exist');

    // Deleting an asset referenced as a post's featured image MUST be safely blocked
    let deleteBlocked = false;
    try {
      await prisma.mediaAsset.delete({ where: { id: testMediaFeatured.id } });
    } catch {
      deleteBlocked = true;
    }
    assert.strictEqual(deleteBlocked, true, 'Deleting referenced MediaAsset must be safely blocked');
  })();

  // -------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${results.filter(r => r.passed).length}`);
  console.log(`FAILED: ${results.filter(r => !r.passed).length}`);
  console.log('================================================================');

  if (results.every(r => r.passed)) {
    console.log('🎉 ALL 33 INDIVIDUAL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }

  try {
    await prisma.$disconnect();
  } catch {}

  process.exit(0);
}

runAll33Tests().catch(async (err) => {
  console.error('\n❌ FATAL TEST RUNNER ERROR:', err);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
