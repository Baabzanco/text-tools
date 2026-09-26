import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';

export function createPGlitePgPool() {
  const isTest = process.env.NODE_ENV === 'test';
  let pglite: PGlite;

  if (isTest) {
    pglite = new PGlite();
  } else {
    const dataDir = path.resolve(process.cwd(), 'data/pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pglite = new PGlite(dataDir);
  }

  // Execute schema DDL directly from official Prisma migration files
  const migrations = [
    'prisma/migrations/20260926000000_init_media_asset/migration.sql',
    'prisma/migrations/20260926000001_blog_cms/migration.sql'
  ];

  for (const relativePath of migrations) {
    const migrationPath = path.resolve(process.cwd(), relativePath);
    if (fs.existsSync(migrationPath)) {
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      pglite.exec(migrationSql).catch(console.error);
    }
  }

  return pglite;
}
