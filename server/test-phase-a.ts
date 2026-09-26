import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import adminPagesRoutes from './routes/admin-pages';
import adminToolsRoutes from './routes/admin-tools';
import adminNavRoutes from './routes/admin-navigation';
import adminSettingsRoutes from './routes/admin-settings';
import adminDashboardRoutes from './routes/admin-dashboard';
import { prisma, validateEnvironmentOrThrow, seedDatabaseIfEmpty } from './db/prisma';

dotenv.config();

console.log('==================================================');
console.log('RUNNING PRISMA ORM PHASE A E2E VERIFICATION SUITE');
console.log('==================================================\n');

// 1. Validate mandatory environment variables
validateEnvironmentOrThrow();

// 2. Initialize Express App for testing
const app = express();
app.use(express.json());

app.use('/api/public', publicRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/pages', adminPagesRoutes);
app.use('/api/admin/tools', adminToolsRoutes);
app.use('/api/admin/navigation', adminNavRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);

const server = app.listen(3997, async () => {
  try {
    const baseUrl = 'http://localhost:3997';

    // Seed initial data via Prisma Client if database is empty
    await seedDatabaseIfEmpty();

    // Step 1: Login
    console.log('--- Step 1: Admin Login ---');
    const adminEmail = process.env.ADMIN_EMAIL!;
    const adminPass = process.env.ADMIN_PASSWORD!;

    const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPass })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success || !loginJson.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginJson)}`);
    }
    const token = loginJson.data.token;
    console.log('✓ Prisma ORM Admin login successful. JWT Token obtained.');

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const testSlug = `prisma-e2e-test-${Date.now()}`;

    // Step 2: Create Page
    console.log('\n--- Step 2: Create Page (Draft v1) ---');
    const createRes = await fetch(`${baseUrl}/api/admin/pages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Prisma ORM Test Page',
        slug: testSlug,
        sections: [
          {
            id: 'sec-1',
            type: 'hero',
            data: { eyebrow: 'Prisma Test', title: 'Original v1 Title', description: 'Original v1 content' }
          }
        ]
      })
    });
    const createJson = await createRes.json();
    if (!createJson.success) throw new Error(`Create page failed: ${JSON.stringify(createJson)}`);
    const pageId = createJson.data.page.id;
    console.log(`✓ Page inserted via Prisma Transaction with ID: ${pageId}, initial Draft Version v1.`);

    // Step 3: Verify Public Site before publishing
    console.log('\n--- Step 3: Verify Public Site Before Publishing ---');
    const pubBeforeRes = await fetch(`${baseUrl}/api/public/pages/${testSlug}`);
    console.log(`Public fetch before publish status: ${pubBeforeRes.status} (Expected 404 because unpublished)`);
    if (pubBeforeRes.status !== 404) {
      throw new Error('Draft page should NOT be publicly visible before publication!');
    }

    // Step 4: Publish Version v1
    console.log('\n--- Step 4: Publish Version v1 ---');
    const pubV1Res = await fetch(`${baseUrl}/api/admin/pages/${pageId}/publish`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({})
    });
    const pubV1Json = await pubV1Res.json();
    if (!pubV1Json.success) throw new Error(`Publish v1 failed: ${JSON.stringify(pubV1Json)}`);
    console.log(`✓ Version v1 published live via Prisma! Published Version ID: ${pubV1Json.data.page.publishedVersionId}`);

    // Step 5: Verify Public Site renders v1
    console.log('\n--- Step 5: Verify Public Site Renders v1 ---');
    const pubGet1 = await fetch(`${baseUrl}/api/public/pages/${testSlug}`);
    const pubJson1 = await pubGet1.json();
    if (!pubJson1.success || pubJson1.data.version.versionNumber !== 1) {
      throw new Error(`Public page did not render v1: ${JSON.stringify(pubJson1)}`);
    }
    console.log(`✓ Public site rendered Version #${pubJson1.data.version.versionNumber} ("${pubJson1.data.version.content.sections[0].data.title}")`);

    // Step 6: Edit Page & Save Draft v2
    console.log('\n--- Step 6: Edit Page & Save Draft v2 ---');
    const draftV2Res = await fetch(`${baseUrl}/api/admin/pages/${pageId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Updated Draft v2 Title',
        sections: [
          {
            id: 'sec-1',
            type: 'hero',
            data: { eyebrow: 'Prisma Test', title: 'Updated v2 Title', description: 'Updated v2 content' }
          }
        ],
        changeSummary: 'Updated title to v2'
      })
    });
    const draftV2Json = await draftV2Res.json();
    if (!draftV2Json.success) throw new Error(`Save draft v2 failed: ${JSON.stringify(draftV2Json)}`);
    console.log(`✓ Draft Version v2 saved successfully via Prisma Transaction.`);

    // Step 7: Verify Public Site STILL renders v1 (Draft v2 must NOT leak!)
    console.log('\n--- Step 7: Verify Public Site Still Renders v1 ---');
    const pubGet2 = await fetch(`${baseUrl}/api/public/pages/${testSlug}`);
    const pubJson2 = await pubGet2.json();
    if (pubJson2.data.version.versionNumber !== 1) {
      throw new Error('Draft v2 leaked publicly before publishing!');
    }
    console.log(`✓ PROOF PASSED: Public site still renders v1 ("${pubJson2.data.version.content.sections[0].data.title}"). Draft v2 did NOT overwrite public site.`);

    // Step 8: Publish Draft v2
    console.log('\n--- Step 8: Publish Draft v2 ---');
    const pubV2Res = await fetch(`${baseUrl}/api/admin/pages/${pageId}/publish`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ versionId: draftV2Json.data.version.id })
    });
    const pubV2Json = await pubV2Res.json();
    if (!pubV2Json.success) throw new Error(`Publish v2 failed: ${JSON.stringify(pubV2Json)}`);
    console.log(`✓ Version v2 published live!`);

    // Step 9: Verify Public Site now renders v2
    console.log('\n--- Step 9: Verify Public Site Now Renders v2 ---');
    const pubGet3 = await fetch(`${baseUrl}/api/public/pages/${testSlug}`);
    const pubJson3 = await pubGet3.json();
    if (pubJson3.data.version.versionNumber !== 2) {
      throw new Error('Public site failed to update to v2!');
    }
    console.log(`✓ Public site updated to Version #${pubJson3.data.version.versionNumber} ("${pubJson3.data.version.content.sections[0].data.title}")`);

    // Step 10: Revisions History & Restore
    console.log('\n--- Step 10: Revisions History & Restore v1 into NEW v3 ---');
    const revsRes = await fetch(`${baseUrl}/api/admin/pages/${pageId}/revisions`, { headers: authHeaders });
    const revsJson = await revsRes.json();
    const v1Object = revsJson.data.revisions.find((r: any) => r.versionNumber === 1);

    const restoreRes = await fetch(`${baseUrl}/api/admin/pages/${pageId}/revisions/${v1Object.id}/restore`, {
      method: 'POST',
      headers: authHeaders
    });
    const restoreJson = await restoreRes.json();
    if (!restoreJson.success || restoreJson.data.restoredVersion.versionNumber !== 3) {
      throw new Error(`Restore failed: ${JSON.stringify(restoreJson)}`);
    }
    console.log(`✓ Restored v1 content as NEW Version v3 ("${restoreJson.data.restoredVersion.content.sections[0].data.title}") via Prisma Transaction. History intact!`);

    // Step 11: Settings & Navigation Persistence
    console.log('\n--- Step 11: Settings & Navigation Persistence ---');
    const setRes = await fetch(`${baseUrl}/api/admin/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ siteName: 'Text Tools Self-Hosted Prisma CMS' })
    });
    if (!(await setRes.json()).success) throw new Error('Update settings failed');

    const pubSetRes = await fetch(`${baseUrl}/api/public/settings`);
    const pubSetJson = await pubSetRes.json();
    if (pubSetJson.data.siteName !== 'Text Tools Self-Hosted Prisma CMS') {
      throw new Error('Settings update failed to persist to public API');
    }
    console.log(`✓ Site settings persisted & verified via Prisma: "${pubSetJson.data.siteName}"`);

    // Step 12: Prisma Database Record Counts Verification
    console.log('\n--- Step 12: Prisma ORM Database Record Counts ---');
    const uCount = await prisma.adminUser.count();
    const pCount = await prisma.page.count();
    const vCount = await prisma.pageVersion.count();
    const tCount = await prisma.toolContent.count();
    const mCount = await prisma.navigationMenu.count();
    const iCount = await prisma.navigationItem.count();
    const sCount = await prisma.siteSettings.count();

    console.log(`📊 AdminUser records:       ${uCount}`);
    console.log(`📊 Page records:            ${pCount}`);
    console.log(`📊 PageVersion records:     ${vCount}`);
    console.log(`📊 ToolContent records:     ${tCount}`);
    console.log(`📊 NavigationMenu records:  ${mCount}`);
    console.log(`📊 NavigationItem records:  ${iCount}`);
    console.log(`📊 SiteSettings records:    ${sCount}`);

    console.log('\n==================================================');
    console.log('ALL PRISMA ORM E2E VERIFICATION CHECKS PASSED!');
    console.log('==================================================');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E Verification Failed:', err);
    server.close();
    process.exit(1);
  }
});
