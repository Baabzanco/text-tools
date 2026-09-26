import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db/prisma';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth';
import { MediaValidationService } from '../services/media/media-validation.service';
import { MediaMetadataService } from '../services/media/media-metadata.service';
import { MediaStorageService } from '../services/media/media-storage.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

const router = Router();
router.use(requireAdminAuth);

// GET /api/admin/media/diagnostics/orphans
router.get('/diagnostics/orphans', async (_req, res) => {
  try {
    const diagnostics = await MediaStorageService.getMediaDiagnostics();
    return res.json({ success: true, data: diagnostics });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to generate media diagnostics.' });
  }
});

// POST /api/admin/media - Upload single or multiple files
router.post('/', upload.single('file'), async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file provided in request.' });
  }

  const { originalname, mimetype, buffer, size } = req.file;

  try {
    // 1. Validate file size limit
    const maxMb = Number(process.env.MAX_UPLOAD_SIZE_MB) || 20;
    MediaValidationService.validateFileSize(size, maxMb);

    // 2. Sanitize filename & extension
    const { sanitizedName, extension } = MediaValidationService.sanitizeFilename(originalname);

    // 3. Validate magic bytes signature against mimetype & extension
    const isValidMagic = MediaValidationService.validateMagicBytes(buffer, mimetype, extension);
    if (!isValidMagic) {
      return res.status(400).json({
        success: false,
        error: `Security Validation Failed: File content magic bytes do not match declared MIME type '${mimetype}' or extension '${extension}'.`
      });
    }

    // 4. Extract image dimensions
    const dimensions = MediaMetadataService.extractImageDimensions(buffer, mimetype);

    // 5. Generate secure unique storage filename
    const uniqueFilename = MediaStorageService.generateUniqueFilename(extension);

    // 6. Write physical file to filesystem
    let storagePath: string;
    try {
      storagePath = await MediaStorageService.writeMediaFile(uniqueFilename, buffer);
    } catch (writeErr: any) {
      return res.status(500).json({ success: false, error: `Filesystem write failed: ${writeErr.message}` });
    }

    // 7. Database insert via Prisma Client
    const publicUrl = `/uploads/${uniqueFilename}`;
    const uploadedBy = req.user?.id || 'admin';

    let mediaAsset;
    try {
      mediaAsset = await prisma.mediaAsset.create({
        data: {
          originalFilename: sanitizedName,
          filename: uniqueFilename,
          mimeType: mimetype,
          fileExtension: extension,
          size,
          storagePath,
          publicUrl,
          width: dimensions.width,
          height: dimensions.height,
          altText: (req.body.altText as string) || sanitizedName,
          title: (req.body.title as string) || sanitizedName,
          caption: (req.body.caption as string) || null,
          description: (req.body.description as string) || null,
          uploadedBy
        }
      });
    } catch (dbErr: any) {
      // Compensating Cleanup: delete physical file if DB insert fails
      await MediaStorageService.deletePhysicalFile(uniqueFilename);
      return res.status(500).json({ success: false, error: `Database insert failed: ${dbErr.message}` });
    }

    return res.status(201).json({
      success: true,
      data: mediaAsset
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message || 'Media upload failed.' });
  }
});

// GET /api/admin/media - Paginated, filtered, searched list
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 24));
    const skip = (page - 1) * limit;

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';

    const where: any = {};

    if (type) {
      if (type === 'image') {
        where.mimeType = { startsWith: 'image/' };
      } else if (type === 'document') {
        where.mimeType = 'application/pdf';
      } else {
        where.mimeType = type;
      }
    }

    if (search) {
      where.OR = [
        { originalFilename: { contains: search } },
        { title: { contains: search } },
        { altText: { contains: search } }
      ];
    }

    const total = await prisma.mediaAsset.count({ where });
    const items = await prisma.mediaAsset.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch media assets.' });
  }
});

// GET /api/admin/media/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Media asset not found.' });
    }
    return res.json({ success: true, data: asset });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch media asset.' });
  }
});

// PATCH /api/admin/media/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { altText, title, caption, description } = req.body || {};

  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Media asset not found.' });
    }

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        altText: altText !== undefined ? altText : existing.altText,
        title: title !== undefined ? title : existing.title,
        caption: caption !== undefined ? caption : existing.caption,
        description: description !== undefined ? description : existing.description
      }
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to update media asset metadata.' });
  }
});

// DELETE /api/admin/media/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Media asset not found.' });
    }

    // Check if asset is referenced in Page / PageVersion content
    const versions = await prisma.pageVersion.findMany();
    let isReferenced = false;
    let referencedSource = '';

    for (const v of versions) {
      const contentStr = JSON.stringify(v.content || {});
      if (
        contentStr.includes(`"mediaAssetId":"${asset.id}"`) ||
        contentStr.includes(asset.id) ||
        contentStr.includes(asset.publicUrl) ||
        contentStr.includes(asset.filename)
      ) {
        isReferenced = true;
        referencedSource = `CMS Page Version (${v.pageTitle || v.page?.title || 'CMS Page'})`;
        break;
      }
    }

    // Check if asset is referenced as BlogPost.featuredImageId
    if (!isReferenced) {
      const postWithFeatured = await prisma.blogPost.findFirst({
        where: { featuredImageId: asset.id }
      });
      if (postWithFeatured) {
        isReferenced = true;
        referencedSource = `Blog Post Featured Image ("${postWithFeatured.title}")`;
      }
    }

    // Check if asset is referenced as BlogCategory.featuredImageId
    if (!isReferenced) {
      const catWithFeatured = await prisma.blogCategory.findFirst({
        where: { featuredImageId: asset.id }
      });
      if (catWithFeatured) {
        isReferenced = true;
        referencedSource = `Blog Category Featured Image ("${catWithFeatured.name}")`;
      }
    }

    // Check if asset is embedded inside BlogPost content (Tiptap image nodes)
    if (!isReferenced) {
      const allPosts = await prisma.blogPost.findMany();
      for (const p of allPosts) {
        const postContentStr = JSON.stringify(p.content || {});
        if (
          postContentStr.includes(`"mediaAssetId":"${asset.id}"`) ||
          postContentStr.includes(asset.id) ||
          postContentStr.includes(asset.publicUrl)
        ) {
          isReferenced = true;
          referencedSource = `Blog Post Content ("${p.title}")`;
          break;
        }
      }
    }

    if (isReferenced) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete media asset '${asset.originalFilename}' because it is actively referenced by ${referencedSource}.`
      });
    }

    // Delete database record first
    await prisma.mediaAsset.delete({ where: { id } });

    // Delete physical file from VPS filesystem
    await MediaStorageService.deletePhysicalFile(asset.filename);

    return res.json({
      success: true,
      message: `Media asset '${asset.originalFilename}' deleted successfully from database and filesystem.`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete media asset.' });
  }
});

export default router;
