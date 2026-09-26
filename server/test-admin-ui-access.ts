import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { prisma } from './db/prisma';
import { Role, BlogPostStatus } from '@prisma/client';
import express from 'express';
import authRoutes from './routes/auth';
import adminBlogRoutes from './routes/admin-blog';
import adminMediaRoutes from './routes/admin-media';
import adminDashboardRoutes from './routes/admin-dashboard';
import adminPagesRoutes from './routes/admin-pages';
import adminToolsRoutes from './routes/admin-tools';
import adminNavigationRoutes from './routes/admin-navigation';
import adminSettingsRoutes from './routes/admin-settings';

const JWT_SECRET = process.env.JWT_SECRET || 'phase-c-secure-jwt-secret-min32chars!';
process.env.JWT_SECRET = JWT_SECRET;

// Mount express app for testing
const app = express();
app.use(express.json());
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/blog', adminBlogRoutes);
app.use('/api/admin/media', adminMediaRoutes);
app.use('/api/admin/pages', adminPagesRoutes);
app.use('/api/admin/tools', adminToolsRoutes);
app.use('/api/admin/navigation', adminNavigationRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

let server: any;
let port: number;
let baseUrl: string;

function makeToken(user: { id: string; email: string; name: string; role: Role }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
}

async function start() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING ADMIN UI & API ACCESS VERIFICATION SUITE');
  console.log('======================================================\n');

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      port = (server.address() as any).port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  try {
    // 1. Seed or retrieve admin users with different roles
    const superAdmin = await prisma.adminUser.upsert({
      where: { email: 'superadmin@test.com' },
      update: { role: Role.SUPER_ADMIN, isActive: true },
      create: {
        email: 'superadmin@test.com',
        passwordHash: 'dummy',
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
        isActive: true
      }
    });

    const admin = await prisma.adminUser.upsert({
      where: { email: 'admin@test.com' },
      update: { role: Role.ADMIN, isActive: true },
      create: {
        email: 'admin@test.com',
        passwordHash: 'dummy',
        name: 'Standard Admin',
        role: Role.ADMIN,
        isActive: true
      }
    });

    const editor = await prisma.adminUser.upsert({
      where: { email: 'editor@test.com' },
      update: { role: Role.EDITOR, isActive: true },
      create: {
        email: 'editor@test.com',
        passwordHash: 'dummy',
        name: 'Content Editor',
        role: Role.EDITOR,
        isActive: true
      }
    });

    const superAdminToken = makeToken(superAdmin);
    const adminToken = makeToken(admin);
    const editorToken = makeToken(editor);

    // Test 1: GET /api/admin/auth/me for SUPER_ADMIN, ADMIN, EDITOR
    console.log('Test 1: Admin Auth Verification across roles');
    for (const [roleName, token] of [
      ['SUPER_ADMIN', superAdminToken],
      ['ADMIN', adminToken],
      ['EDITOR', editorToken]
    ]) {
      const res = await fetch(`${baseUrl}/api/admin/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200, `${roleName} auth/me should return 200`);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.user.role, roleName);
    }
    console.log('[PASS] Test 1: All admin roles (SUPER_ADMIN, ADMIN, EDITOR) successfully authenticated\n');

    // Test 2: GET /api/admin/dashboard/stats returns blog and media counts
    console.log('Test 2: Dashboard stats API access');
    const statsRes = await fetch(`${baseUrl}/api/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert.strictEqual(statsRes.status, 200, 'Dashboard stats must return 200');
    assert.strictEqual(statsData.success, true);
    assert.ok(typeof statsData.data.totalBlogPosts === 'number', 'Must include totalBlogPosts');
    assert.ok(typeof statsData.data.totalMediaAssets === 'number', 'Must include totalMediaAssets');
    assert.ok(Array.isArray(statsData.data.recentBlogPosts), 'Must include recentBlogPosts array');
    console.log('[PASS] Test 2: Dashboard stats API returns blog & media data\n');

    // Test 3: GET /api/admin/blog/posts access
    console.log('Test 3: Blog Posts API access');
    const blogRes = await fetch(`${baseUrl}/api/admin/blog/posts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const blogData = await blogRes.json();
    assert.strictEqual(blogRes.status, 200, 'Blog posts endpoint must return 200');
    assert.strictEqual(blogData.success, true);
    assert.ok(Array.isArray(blogData.data.posts), 'Must return posts list');
    console.log('[PASS] Test 3: GET /api/admin/blog/posts is accessible and functional\n');

    // Test 4: GET /api/admin/blog/categories access
    console.log('Test 4: Blog Categories API access');
    const catRes = await fetch(`${baseUrl}/api/admin/blog/categories`, {
      headers: { Authorization: `Bearer ${editorToken}` }
    });
    const catData = await catRes.json();
    assert.strictEqual(catRes.status, 200, 'Blog categories endpoint must return 200');
    assert.strictEqual(catData.success, true);
    assert.ok(Array.isArray(catData.data), 'Must return categories list');
    console.log('[PASS] Test 4: GET /api/admin/blog/categories is accessible and functional\n');

    // Test 5: GET /api/admin/blog/tags access
    console.log('Test 5: Blog Tags API access');
    const tagRes = await fetch(`${baseUrl}/api/admin/blog/tags`, {
      headers: { Authorization: `Bearer ${editorToken}` }
    });
    const tagData = await tagRes.json();
    assert.strictEqual(tagRes.status, 200, 'Blog tags endpoint must return 200');
    assert.strictEqual(tagData.success, true);
    assert.ok(Array.isArray(tagData.data), 'Must return tags list');
    console.log('[PASS] Test 5: GET /api/admin/blog/tags is accessible and functional\n');

    // Test 6: GET /api/admin/media access
    console.log('Test 6: Media Library API access');
    const mediaRes = await fetch(`${baseUrl}/api/admin/media`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const mediaData = await mediaRes.json();
    assert.strictEqual(mediaRes.status, 200, 'Media Library endpoint must return 200');
    assert.strictEqual(mediaData.success, true);
    assert.ok(Array.isArray(mediaData.data.items), 'Must return media items list');
    console.log('[PASS] Test 6: GET /api/admin/media is accessible and functional\n');

    // Test 7: Unauthorized rejection
    console.log('Test 7: Unauthenticated request rejection');
    const unauthBlog = await fetch(`${baseUrl}/api/admin/blog/posts`);
    assert.strictEqual(unauthBlog.status, 401, 'Unauthenticated blog request must be rejected with 401');
    const unauthMedia = await fetch(`${baseUrl}/api/admin/media`);
    assert.strictEqual(unauthMedia.status, 401, 'Unauthenticated media request must be rejected with 401');
    console.log('[PASS] Test 7: Unauthorized requests properly rejected with 401\n');

    console.log('======================================================');
    console.log('🎉 ALL ADMIN UI & API ACCESS CHECKS PASSED');
    console.log('======================================================\n');
  } finally {
    if (server) server.close();
  }
}

start().catch((err) => {
  console.error('Admin UI access test failed:', err);
  process.exit(1);
});
