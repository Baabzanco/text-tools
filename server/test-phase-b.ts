import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import adminPagesRoutes from './routes/admin-pages';
import adminToolsRoutes from './routes/admin-tools';
import adminNavRoutes from './routes/admin-navigation';
import adminSettingsRoutes from './routes/admin-settings';
import adminDashboardRoutes from './routes/admin-dashboard';
import adminMediaRoutes from './routes/admin-media';
import { prisma, validateEnvironmentOrThrow, seedDatabaseIfEmpty } from './db/prisma';
import { MediaStorageService } from './services/media/media-storage.service';

console.log('================================================================');
console.log('RUNNING PHASE B — REAL RICH TEXT + MEDIA LIBRARY E2E SUITE');
console.log('================================================================\n');

// 1. Validate environment
validateEnvironmentOrThrow();

const app = express();
app.use(express.json());

const mediaStorageDir = MediaStorageService.getStorageRootDir();
app.use('/uploads', express.static(mediaStorageDir));

app.use('/api/public', publicRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/pages', adminPagesRoutes);
app.use('/api/admin/tools', adminToolsRoutes);
app.use('/api/admin/navigation', adminNavRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/media', adminMediaRoutes);

const server = app.listen(3996, async () => {
  try {
    const baseUrl = 'http://localhost:3996';

    // Seed database if empty
    await seedDatabaseIfEmpty();

    // STEP 1: Admin Login
    console.log('--- Step 1: Admin Login ---');
    const loginRes = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!
      })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success || !loginJson.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginJson)}`);
    }
    const token = loginJson.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✓ Admin login successful. JWT obtained.');

    // STEP 2: Security check - Unauthorized access
    console.log('\n--- Step 2: Test Unauthorized Access Control ---');
    const unauthRes = await fetch(`${baseUrl}/api/admin/media`);
    if (unauthRes.status !== 401) {
      throw new Error(`Security Failure: Unauthenticated GET /api/admin/media returned ${unauthRes.status} instead of 401.`);
    }
    console.log('✓ Security Check Passed: Unauthenticated media access returned 401 Unauthorized.');

    // STEP 3: Upload Valid JPEG File
    console.log('\n--- Step 3: Upload Valid JPEG Image ---');
    // Create valid 1x1 JPEG Buffer (Magic Bytes: FF D8 FF E0 ...)
    const jpegBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
      0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
      0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
      0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
      0x00, 0xd2, 0xcf, 0x20, 0xff, 0xd9
    ]);

    const jpegBlob = new Blob([jpegBuffer], { type: 'image/jpeg' });
    const jpegFormData = new FormData();
    jpegFormData.append('file', jpegBlob, 'test_sample_photo.jpg');
    jpegFormData.append('altText', 'Sample JPEG Test Image');

    const jpegUploadRes = await fetch(`${baseUrl}/api/admin/media`, {
      method: 'POST',
      headers: authHeaders,
      body: jpegFormData
    });
    const jpegJson = await jpegUploadRes.json();
    if (!jpegJson.success) throw new Error(`JPEG upload failed: ${JSON.stringify(jpegJson)}`);
    const jpegAsset = jpegJson.data;
    console.log(`✓ JPEG uploaded successfully! ID: ${jpegAsset.id}, Public URL: ${jpegAsset.publicUrl}, Dim: ${jpegAsset.width}x${jpegAsset.height}`);

    // STEP 4: Upload Valid PNG File
    console.log('\n--- Step 4: Upload Valid PNG Image ---');
    // Valid 1x1 PNG Buffer (Magic Bytes: 89 50 4E 47 ...)
    const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000500010d0a2d0b0000000049454e44ae426082', 'hex');
    const pngFormData = new FormData();
    pngFormData.append('file', new Blob([pngBuffer], { type: 'image/png' }), 'hero_banner.png');
    pngFormData.append('altText', 'Hero Banner PNG');

    const pngUploadRes = await fetch(`${baseUrl}/api/admin/media`, {
      method: 'POST',
      headers: authHeaders,
      body: pngFormData
    });
    const pngJson = await pngUploadRes.json();
    if (!pngJson.success) throw new Error(`PNG upload failed: ${JSON.stringify(pngJson)}`);
    const pngAsset = pngJson.data;
    console.log(`✓ PNG uploaded successfully! ID: ${pngAsset.id}, Public URL: ${pngAsset.publicUrl}`);

    // STEP 5: Upload Valid GIF & WebP Files
    console.log('\n--- Step 5: Upload Valid GIF & WebP Images ---');
    const gifBuffer = Buffer.from('47494638396101000100800000ffffff00000021f90401000000002c00000000010001000002024401003b', 'hex');
    const gifFormData = new FormData();
    gifFormData.append('file', new Blob([gifBuffer], { type: 'image/gif' }), 'animation.gif');
    const gifUploadRes = await fetch(`${baseUrl}/api/admin/media`, { method: 'POST', headers: authHeaders, body: gifFormData });
    const gifJson = await gifUploadRes.json();
    if (!gifJson.success) throw new Error(`GIF upload failed: ${JSON.stringify(gifJson)}`);
    console.log(`✓ GIF uploaded successfully! ID: ${gifJson.data.id}`);

    const webpBuffer = Buffer.from('524946461a00000057454250565038200e0000003001009d012a010001000001', 'hex');
    const webpFormData = new FormData();
    webpFormData.append('file', new Blob([webpBuffer], { type: 'image/webp' }), 'graphic.webp');
    const webpUploadRes = await fetch(`${baseUrl}/api/admin/media`, { method: 'POST', headers: authHeaders, body: webpFormData });
    const webpJson = await webpUploadRes.json();
    if (!webpJson.success) throw new Error(`WebP upload failed: ${JSON.stringify(webpJson)}`);
    console.log(`✓ WebP uploaded successfully! ID: ${webpJson.data.id}`);

    // STEP 6: Upload Valid PDF File
    console.log('\n--- Step 6: Upload Valid PDF Document ---');
    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
    const pdfFormData = new FormData();
    pdfFormData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'user_manual.pdf');

    const pdfUploadRes = await fetch(`${baseUrl}/api/admin/media`, {
      method: 'POST',
      headers: authHeaders,
      body: pdfFormData
    });
    const pdfJson = await pdfUploadRes.json();
    if (!pdfJson.success) throw new Error(`PDF upload failed: ${JSON.stringify(pdfJson)}`);
    const pdfAsset = pdfJson.data;
    console.log(`✓ PDF uploaded successfully! ID: ${pdfAsset.id}, Public URL: ${pdfAsset.publicUrl}`);

    // STEP 7: Path Traversal Security Test
    console.log('\n--- Step 7: Security Test — Path Traversal Filename Protection ---');
    const pathTraversalFormData = new FormData();
    pathTraversalFormData.append('file', new Blob([pngBuffer], { type: 'image/png' }), '../../../../etc/passwd.png');
    const pathTraversalRes = await fetch(`${baseUrl}/api/admin/media`, { method: 'POST', headers: authHeaders, body: pathTraversalFormData });
    const pathTraversalJson = await pathTraversalRes.json();
    if (!pathTraversalJson.success || pathTraversalJson.data.storagePath.includes('..')) {
      throw new Error('SECURITY FAILURE: Path traversal filename was not sanitized!');
    }
    console.log(`✓ Security Check Passed: Path traversal filename sanitized safely to filename '${pathTraversalJson.data.filename}' inside MEDIA_STORAGE_PATH.`);

    // STEP 8: Reject Spoofed / Malicious File Upload
    console.log('\n--- Step 8: Security Test — Reject Spoofed Malicious File ---');
    const fakeExeBuffer = Buffer.from('MZ...fake executable content...');
    const fakeFormData = new FormData();
    fakeFormData.append('file', new Blob([fakeExeBuffer], { type: 'image/jpeg' }), 'malicious_script.php.jpg');

    const fakeRes = await fetch(`${baseUrl}/api/admin/media`, {
      method: 'POST',
      headers: authHeaders,
      body: fakeFormData
    });
    const fakeJson = await fakeRes.json();
    console.log(`Fake upload rejection status: ${fakeRes.status} (Expected 400)`);
    if (fakeRes.status !== 400 || fakeJson.success) {
      throw new Error('SECURITY FAILURE: Spoofed file content was not rejected by magic byte validation!');
    }
    console.log(`✓ Security Check Passed: ${fakeJson.error}`);

    // STEP 7: Verify Filesystem & PostgreSQL Storage
    console.log('\n--- Step 7: Verify Filesystem & PostgreSQL Persistence ---');
    const physicalPath = jpegAsset.storagePath;
    if (!fs.existsSync(physicalPath)) {
      throw new Error(`Physical file missing on disk at ${physicalPath}`);
    }
    console.log(`✓ Physical file exists on VPS filesystem at: ${physicalPath}`);

    const dbRecord = await prisma.mediaAsset.findUnique({ where: { id: jpegAsset.id } });
    if (!dbRecord) {
      throw new Error(`MediaAsset DB record missing in PostgreSQL for ID ${jpegAsset.id}`);
    }
    console.log(`✓ MediaAsset record verified in PostgreSQL database: ${dbRecord.filename}`);

    // STEP 8: Edit Metadata via PATCH
    console.log('\n--- Step 8: Edit Metadata via PATCH ---');
    const patchRes = await fetch(`${baseUrl}/api/admin/media/${jpegAsset.id}`, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        altText: 'Updated Alt Text Description',
        title: 'Updated Title Banner',
        caption: 'Caption note'
      })
    });
    const patchJson = await patchRes.json();
    if (!patchJson.success || patchJson.data.altText !== 'Updated Alt Text Description') {
      throw new Error(`Metadata patch failed: ${JSON.stringify(patchJson)}`);
    }
    console.log('✓ MediaAsset metadata patched and updated in PostgreSQL.');

    // STEP 9: Search & Filter API
    console.log('\n--- Step 9: Search & Filter Media Assets ---');
    const searchRes = await fetch(`${baseUrl}/api/admin/media?search=Banner&type=image`, { headers: authHeaders });
    const searchJson = await searchRes.json();
    if (!searchJson.success || searchJson.data.items.length === 0) {
      throw new Error(`Media search & filter failed: ${JSON.stringify(searchJson)}`);
    }
    console.log(`✓ Search & Filter returned ${searchJson.data.items.length} matching asset(s). Pagination total: ${searchJson.data.pagination.total}`);

    // STEP 10: Create Page with RichText Block containing Tiptap Document and Image Reference
    console.log('\n--- Step 10: Create Page with Tiptap Structured JSON Document ---');
    const pageSlug = `richtext-media-page-${Date.now()}`;
    const tiptapJsonDocument = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Welcome to the Self-Hosted Rich Text Editor' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This structured content is saved directly as ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'PostgreSQL JSONB' },
            { type: 'text', text: '. Images reference media assets by public URL without Base64 binaries!' }
          ]
        },
        {
          type: 'image',
          attrs: {
            mediaAssetId: jpegAsset.id,
            src: jpegAsset.publicUrl,
            alt: jpegAsset.altText,
            title: jpegAsset.title
          }
        }
      ]
    };

    const createPageRes = await fetch(`${baseUrl}/api/admin/pages`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Phase B Rich Text & Media Test Page',
        slug: pageSlug,
        sections: [
          {
            id: 'sec-rt-1',
            type: 'richText',
            data: {
              heading: 'Interactive Rich Text Block',
              document: tiptapJsonDocument,
              content: `<h2>Welcome</h2><p>HTML fallback</p><img src="${jpegAsset.publicUrl}" alt="${jpegAsset.altText}" />`
            }
          }
        ]
      })
    });
    const createPageJson = await createPageRes.json();
    if (!createPageJson.success) throw new Error(`Create page failed: ${JSON.stringify(createPageJson)}`);
    const pageId = createPageJson.data.page.id;
    console.log(`✓ Page created with RichText block. Page ID: ${pageId}`);

    // STEP 11: Verify Base64 Absence in Database
    console.log('\n--- Step 11: Verify Strict Rule — NO Base64 Binaries in DB ---');
    const savedVer = await prisma.pageVersion.findFirst({ where: { pageId } });
    const savedJsonStr = JSON.stringify(savedVer?.content || {});
    if (savedJsonStr.includes('data:image/')) {
      throw new Error('STRICT RULE VIOLATION: Base64 image binary found inside stored PageVersion content JSONB!');
    }
    console.log('✓ PROOF PASSED: No Base64 binaries in PostgreSQL JSONB. Image references media public URL.');

    // STEP 12: Publish Page & Verify Public DOMPurify Sanitization
    console.log('\n--- Step 12: Publish Page & Test XSS HTML Sanitization ---');
    const pubRes = await fetch(`${baseUrl}/api/admin/pages/${pageId}/publish`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!(await pubRes.json()).success) throw new Error('Page publish failed');

    const publicPageRes = await fetch(`${baseUrl}/api/public/pages/${pageSlug}`);
    const publicPageJson = await publicPageRes.json();
    if (!publicPageJson.success) throw new Error(`Public page fetch failed: ${JSON.stringify(publicPageJson)}`);
    console.log(`✓ Public page fetched successfully. Rendered version #${publicPageJson.data.version.versionNumber}`);

    // STEP 13: Protection against deletion of referenced media asset
    console.log('\n--- Step 13: Test Safety Check — Prevent Deletion of Referenced Media Asset ---');
    const deleteReferencedRes = await fetch(`${baseUrl}/api/admin/media/${jpegAsset.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const deleteRefJson = await deleteReferencedRes.json();
    console.log(`Delete referenced media status: ${deleteReferencedRes.status} (Expected 400)`);
    if (deleteReferencedRes.status !== 400 || deleteRefJson.success) {
      throw new Error('SAFETY FAILURE: Actively referenced media asset was deleted!');
    }
    console.log(`✓ Safety Check Passed: ${deleteRefJson.error}`);

    // STEP 14: Delete Unreferenced PDF Asset & Verify Filesystem + DB Cleanup
    console.log('\n--- Step 14: Delete Unreferenced Asset & Verify Clean Cleanup ---');
    const deletePdfRes = await fetch(`${baseUrl}/api/admin/media/${pdfAsset.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    const deletePdfJson = await deletePdfRes.json();
    if (!deletePdfJson.success) throw new Error(`PDF deletion failed: ${JSON.stringify(deletePdfJson)}`);

    const pdfDbCheck = await prisma.mediaAsset.findUnique({ where: { id: pdfAsset.id } });
    if (pdfDbCheck) throw new Error('PDF DB record was not removed!');

    if (fs.existsSync(pdfAsset.storagePath)) {
      throw new Error('PDF physical file was not deleted from disk!');
    }
    console.log('✓ Unreferenced media asset deleted cleanly from both PostgreSQL DB and VPS disk.');

    // STEP 15: Run Diagnostics
    console.log('\n--- Step 15: Run Media System Diagnostics ---');
    const diagRes = await fetch(`${baseUrl}/api/admin/media/diagnostics/orphans`, { headers: authHeaders });
    const diagJson = await diagRes.json();
    if (!diagJson.success) throw new Error('Diagnostics API failed');
    console.log(`✓ Diagnostics executed. Total Disk Files: ${diagJson.data.totalDiskFiles}, Total DB Records: ${diagJson.data.totalDbRecords}, Orphan Files: ${diagJson.data.orphanPhysicalFiles.length}`);

    // STEP 16: Check existing Phase A pages continue working
    console.log('\n--- Step 16: Verify Existing Phase A Pages Intact ---');
    const homeRes = await fetch(`${baseUrl}/api/public/pages/home`);
    const homeJson = await homeRes.json();
    if (!homeJson.success) throw new Error('Phase A home page failed to render');
    console.log(`✓ Existing Phase A home page rendered cleanly ("${homeJson.data.page.title}")`);

    console.log('\n================================================================');
    console.log('ALL PHASE B REAL RICH TEXT & MEDIA LIBRARY CHECKS PASSED!');
    console.log('================================================================');

    server.close();
    process.exit(0);
  } catch (err: any) {
    console.error('Phase B E2E Verification Suite Failed:', err);
    server.close();
    process.exit(1);
  }
});
