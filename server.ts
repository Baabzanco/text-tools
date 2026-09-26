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

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateEnvironmentOrThrow, seedDatabaseIfEmpty } from './server/db/prisma';

import authRoutes from './server/routes/auth';
import publicRoutes from './server/routes/public';
import adminPagesRoutes from './server/routes/admin-pages';
import adminToolsRoutes from './server/routes/admin-tools';
import adminNavRoutes from './server/routes/admin-navigation';
import adminSettingsRoutes from './server/routes/admin-settings';
import adminDashboardRoutes from './server/routes/admin-dashboard';
import adminMediaRoutes from './server/routes/admin-media';
import adminBlogRoutes from './server/routes/admin-blog';
import { MediaStorageService } from './server/services/media/media-storage.service';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  // 1. Strict Environment Validation
  validateEnvironmentOrThrow();

  // 2. Initialize Prisma Database & Seed
  await seedDatabaseIfEmpty();

  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  const mediaStorageDir = MediaStorageService.getStorageRootDir();
  app.use('/uploads', express.static(mediaStorageDir, {
    dotfiles: 'ignore',
    etag: true,
    maxAge: '1d'
  }));

  app.use('/api/public', publicRoutes);
  app.use('/api/admin/auth', authRoutes);
  app.use('/api/admin/pages', adminPagesRoutes);
  app.use('/api/admin/tools', adminToolsRoutes);
  app.use('/api/admin/navigation', adminNavRoutes);
  app.use('/api/admin/settings', adminSettingsRoutes);
  app.use('/api/admin/dashboard', adminDashboardRoutes);
  app.use('/api/admin/media', adminMediaRoutes);
  app.use('/api/admin/blog', adminBlogRoutes);

  if (!isProd) {
    // Development Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Text Tools CMS Server listening on http://0.0.0.0:${PORT} (Prisma ORM Active)`);
  });
}

startServer().catch((err) => {
  console.error('FATAL: Server startup failed:', err.message);
  process.exit(1);
});
