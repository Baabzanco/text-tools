import { Role, PageStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TOOL_REGISTRY } from '../../src/lib/tools/registry';
import { createPGlitePgPool } from './prisma-adapter';

// Strict Environment Validation
export function validateEnvironmentOrThrow(): void {
  // Robustly clean/unwrap DATABASE_URL if prefixed or quoted by host environment
  if (process.env.DATABASE_URL) {
    let cleaned = process.env.DATABASE_URL.trim();
    if (cleaned.startsWith('DATABASE_URL=')) {
      cleaned = cleaned.substring('DATABASE_URL='.length).trim();
    }
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.substring(1, cleaned.length - 1).trim();
    }
    process.env.DATABASE_URL = cleaned;
  }

  const dbUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    throw new Error('FATAL SECURITY ERROR: DATABASE_URL environment variable is missing or invalid. Must be a valid PostgreSQL connection string.');
  }

  if (!jwtSecret || jwtSecret.length < 16) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing or insecure (must be at least 16 characters long).');
  }

  if (!adminEmail || !adminEmail.includes('@')) {
    throw new Error('FATAL SECURITY ERROR: ADMIN_EMAIL environment variable is missing or invalid.');
  }

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('FATAL SECURITY ERROR: ADMIN_PASSWORD environment variable is missing or insecure (must be at least 8 characters long).');
  }
}

const pglite = createPGlitePgPool();

export interface PrismaRepository {
  adminUser: {
    count: (args?: any) => Promise<number>;
    findUnique: (args: { where: { id?: string; email?: string } }) => Promise<any>;
    findMany: () => Promise<any[]>;
    upsert: (args: { where: { email: string }; update: any; create: any }) => Promise<any>;
  };
  page: {
    count: (args?: any) => Promise<number>;
    findUnique: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findFirst: (args: { where: any; include?: any }) => Promise<any>;
    findMany: (args?: { orderBy?: any; include?: any; select?: any; take?: number }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
  };
  pageVersion: {
    count: () => Promise<number>;
    findUnique: (args: { where: { id: string } }) => Promise<any>;
    findFirst: (args: { where: { id?: string; pageId?: string }; orderBy?: any }) => Promise<any>;
    findMany: (args?: { where?: any; orderBy?: any; take?: number; include?: any }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    aggregate: (args: { where: { pageId: string }; _max: { versionNumber: boolean } }) => Promise<{ _max: { versionNumber: number } }>;
  };
  toolContent: {
    count: () => Promise<number>;
    findUnique: (args: { where: { slug: string } }) => Promise<any>;
    findFirst: (args: { where: { slug?: string; isPublished?: boolean } }) => Promise<any>;
    findMany: (args?: { where?: { isPublished?: boolean }; orderBy?: any }) => Promise<any[]>;
    upsert: (args: { where: { slug: string }; update: any; create: any }) => Promise<any>;
    update: (args: { where: { slug: string }; data: any }) => Promise<any>;
  };
  navigationMenu: {
    count: () => Promise<number>;
    findUnique: (args: { where: { id?: string; location?: string }; include?: any }) => Promise<any>;
    findMany: (args?: { include?: any }) => Promise<any[]>;
    upsert: (args: { where: { location: string }; update: any; create: any }) => Promise<any>;
  };
  navigationItem: {
    count: () => Promise<number>;
    create: (args: { data: any }) => Promise<any>;
    deleteMany: (args: { where: { menuId: string } }) => Promise<{ count: number }>;
  };
  siteSettings: {
    count: () => Promise<number>;
    findFirst: () => Promise<any>;
    upsert: (args: { where: { id: string }; update: any; create: any }) => Promise<any>;
  };
  mediaAsset: {
    count: (args?: { where?: any }) => Promise<number>;
    findUnique: (args: { where: { id?: string; filename?: string } }) => Promise<any>;
    findMany: (args?: { where?: any; orderBy?: any; skip?: number; take?: number }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
    delete: (args: { where: { id: string } }) => Promise<any>;
  };
  blogCategory: {
    count: (args?: any) => Promise<number>;
    findUnique: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findFirst: (args: { where: any }) => Promise<any>;
    findMany: (args?: { where?: any; orderBy?: any; include?: any }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
    delete: (args: { where: { id: string } }) => Promise<any>;
  };
  category: {
    count: (args?: any) => Promise<number>;
    findUnique: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findFirst: (args: { where: any }) => Promise<any>;
    findMany: (args?: { where?: any; orderBy?: any; include?: any }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
    delete: (args: { where: { id: string } }) => Promise<any>;
  };
  blogTag: {
    count: (args?: any) => Promise<number>;
    findUnique: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findFirst: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findMany: (args?: { orderBy?: any }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
    delete: (args: { where: { id: string } }) => Promise<any>;
  };
  tag: {
    count: (args?: any) => Promise<number>;
    findUnique: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findFirst: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findMany: (args?: { orderBy?: any }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
    delete: (args: { where: { id: string } }) => Promise<any>;
  };
  blogPost: {
    count: (args?: { where?: any }) => Promise<number>;
    findUnique: (args: { where: { id?: string; slug?: string } }) => Promise<any>;
    findFirst: (args: { where: any; include?: any }) => Promise<any>;
    findMany: (args?: { where?: any; orderBy?: any; take?: number; skip?: number; include?: any }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
    update: (args: { where: { id: string }; data: any }) => Promise<any>;
    delete: (args: { where: { id: string } }) => Promise<any>;
  };
  blogPostRevision: {
    count: (args?: { where?: any }) => Promise<number>;
    findUnique: (args: { where: { id: string } }) => Promise<any>;
    findMany: (args?: { where?: { postId?: string }; orderBy?: any }) => Promise<any[]>;
    create: (args: { data: any }) => Promise<any>;
  };
  blogPostTag: {
    create: (args: { data: { postId: string; tagId: string } }) => Promise<any>;
    deleteMany: (args: { where: { postId?: string; tagId?: string } }) => Promise<{ count: number }>;
    findMany: (args: { where: { postId?: string; tagId?: string }; include?: any }) => Promise<any[]>;
  };
  redirect: {
    count: (args?: any) => Promise<number>;
    findUnique: (args: { where: { fromPath: string } }) => Promise<any>;
    findMany: (args?: { orderBy?: any }) => Promise<any[]>;
    create: (args: { data: { fromPath: string; toPath: string; statusCode?: number } }) => Promise<any>;
    delete: (args: { where: { id: string } }) => Promise<any>;
  };
  $transaction: <T>(fn: (tx: PrismaRepository) => Promise<T>) => Promise<T>;
  $disconnect: () => Promise<void>;
}

export const prisma: PrismaRepository = {
  adminUser: {
    count: async (args?: any) => {
      let sql = 'SELECT COUNT(*) as count FROM "AdminUser"';
      if (args?.where?.isActive !== undefined) {
        sql += ` WHERE "isActive" = ${args.where.isActive}`;
      }
      const res = await pglite.query(sql);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id?: string; email?: string } }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "AdminUser" WHERE id = $1', [args.where.id]);
      } else if (args.where.email) {
        res = await pglite.query('SELECT * FROM "AdminUser" WHERE LOWER(email) = LOWER($1)', [args.where.email]);
      }
      return (res?.rows[0] as any) || null;
    },
    findMany: async () => {
      const res = await pglite.query('SELECT * FROM "AdminUser" ORDER BY "createdAt" ASC');
      return res.rows as any[];
    },
    upsert: async (args: { where: { email: string }; update: any; create: any }) => {
      const existing = await pglite.query('SELECT * FROM "AdminUser" WHERE email = $1', [args.where.email]);
      if (existing.rows.length > 0) {
        const u = args.update;
        const res = await pglite.query(
          'UPDATE "AdminUser" SET "passwordHash" = COALESCE($1, "passwordHash"), "updatedAt" = NOW() WHERE email = $2 RETURNING *',
          [u.passwordHash || null, args.where.email]
        );
        return res.rows[0] as any;
      } else {
        const c = args.create;
        const id = c.id || `user-${Date.now()}`;
        const res = await pglite.query(
          `INSERT INTO "AdminUser" (id, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
          [id, c.email, c.passwordHash, c.name, c.role || 'ADMIN', c.isActive !== false]
        );
        return res.rows[0] as any;
      }
    }
  },

  page: {
    count: async (args?: any) => {
      let sql = 'SELECT COUNT(*) as count FROM "Page"';
      if (args?.where?.status) {
        sql += ` WHERE status = '${args.where.status}'`;
      }
      const res = await pglite.query(sql);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id?: string; slug?: string } }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "Page" WHERE id = $1', [args.where.id]);
      } else if (args.where.slug) {
        res = await pglite.query('SELECT * FROM "Page" WHERE slug = $1', [args.where.slug]);
      }
      return (res?.rows[0] as any) || null;
    },
    findFirst: async (args: { where: any; include?: any }) => {
      let res;
      if (args.where.OR) {
        const idOrSlug = args.where.OR[0]?.id || args.where.OR[1]?.slug;
        res = await pglite.query('SELECT * FROM "Page" WHERE id = $1 OR slug = $1', [idOrSlug]);
      } else if (args.where.id) {
        res = await pglite.query('SELECT * FROM "Page" WHERE id = $1', [args.where.id]);
      } else if (args.where.slug) {
        res = await pglite.query('SELECT * FROM "Page" WHERE slug = $1', [args.where.slug]);
      }
      const page = (res?.rows[0] as any) || null;
      if (page && args.include?.versions) {
        const versRes = await pglite.query('SELECT * FROM "PageVersion" WHERE "pageId" = $1 ORDER BY "versionNumber" DESC', [page.id]);
        page.versions = versRes.rows;
      }
      return page;
    },
    findMany: async (args?: { orderBy?: any; include?: any; select?: any; take?: number }) => {
      let sql = 'SELECT * FROM "Page" ORDER BY "updatedAt" DESC';
      if (args?.take) sql += ` LIMIT ${args.take}`;
      const res = await pglite.query(sql);
      const pages = res.rows as any[];

      if (args?.include?.versions) {
        for (const p of pages) {
          const versRes = await pglite.query('SELECT id, "versionNumber" FROM "PageVersion" WHERE "pageId" = $1', [p.id]);
          p.versions = versRes.rows;
        }
      }
      return pages;
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `page-${Date.now()}`;
      const res = await pglite.query(
        `INSERT INTO "Page" (id, slug, title, status, "publishedVersionId", "createdAt", "updatedAt", "publishedAt", "createdBy", "updatedBy")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, $7, $8) RETURNING *`,
        [id, d.slug, d.title, d.status || 'DRAFT', d.publishedVersionId || null, d.publishedAt || null, d.createdBy || 'Admin', d.updatedBy || 'Admin']
      );
      return res.rows[0] as any;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const d = args.data;
      const updates = [];
      const params = [];
      let idx = 1;

      if (d.title !== undefined) { updates.push(`title = $${idx++}`); params.push(d.title); }
      if (d.status !== undefined) { updates.push(`status = $${idx++}`); params.push(d.status); }
      if (d.publishedVersionId !== undefined) { updates.push(`"publishedVersionId" = $${idx++}`); params.push(d.publishedVersionId); }
      if (d.publishedAt !== undefined) { updates.push(`"publishedAt" = $${idx++}`); params.push(d.publishedAt); }
      if (d.updatedBy !== undefined) { updates.push(`"updatedBy" = $${idx++}`); params.push(d.updatedBy); }

      updates.push(`"updatedAt" = NOW()`);
      params.push(args.where.id);

      const res = await pglite.query(`UPDATE "Page" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params);
      return res.rows[0] as any;
    }
  },

  pageVersion: {
    count: async () => {
      const res = await pglite.query('SELECT COUNT(*) as count FROM "PageVersion"');
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id: string } }) => {
      const res = await pglite.query('SELECT * FROM "PageVersion" WHERE id = $1', [args.where.id]);
      return (res.rows[0] as any) || null;
    },
    findFirst: async (args: { where: { id?: string; pageId?: string }; orderBy?: any }) => {
      let sql = 'SELECT * FROM "PageVersion" WHERE 1=1';
      const params = [];
      let idx = 1;
      if (args.where.id) { sql += ` AND id = $${idx++}`; params.push(args.where.id); }
      if (args.where.pageId) { sql += ` AND "pageId" = $${idx++}`; params.push(args.where.pageId); }
      sql += ' ORDER BY "versionNumber" DESC LIMIT 1';

      const res = await pglite.query(sql, params);
      return (res.rows[0] as any) || null;
    },
    findMany: async (args?: { where?: any; orderBy?: any; take?: number; include?: any }) => {
      let sql = 'SELECT v.*, p.title as "pageTitle", p.slug as "pageSlug" FROM "PageVersion" v LEFT JOIN "Page" p ON v."pageId" = p.id';
      if (args?.where?.pageId) sql += ` WHERE v."pageId" = '${args.where.pageId}'`;
      sql += ' ORDER BY v."createdAt" DESC';
      if (args?.take) sql += ` LIMIT ${args.take}`;

      const res = await pglite.query(sql);
      return res.rows.map((r: any) => ({
        ...r,
        page: r.pageTitle ? { title: r.pageTitle, slug: r.pageSlug } : null
      }));
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `ver-${Date.now()}-${d.versionNumber || 1}`;
      const res = await pglite.query(
        `INSERT INTO "PageVersion" (id, "pageId", "versionNumber", content, "seoMetadata", "changeSummary", "createdBy", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
        [id, d.pageId, d.versionNumber, JSON.stringify(d.content), JSON.stringify(d.seoMetadata), d.changeSummary || null, d.createdBy || 'Admin']
      );
      return res.rows[0] as any;
    },
    aggregate: async (args: { where: { pageId: string }; _max: { versionNumber: boolean } }) => {
      const res = await pglite.query('SELECT MAX("versionNumber") as max FROM "PageVersion" WHERE "pageId" = $1', [args.where.pageId]);
      return {
        _max: {
          versionNumber: Number((res.rows[0] as any)?.max || 0)
        }
      };
    }
  },

  toolContent: {
    count: async () => {
      const res = await pglite.query('SELECT COUNT(*) as count FROM "ToolContent"');
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { slug: string } }) => {
      const res = await pglite.query('SELECT * FROM "ToolContent" WHERE slug = $1', [args.where.slug]);
      return (res.rows[0] as any) || null;
    },
    findFirst: async (args: { where: { slug?: string; isPublished?: boolean } }) => {
      const res = await pglite.query('SELECT * FROM "ToolContent" WHERE slug = $1 AND "isPublished" = true', [args.where.slug]);
      return (res.rows[0] as any) || null;
    },
    findMany: async (args?: { where?: { isPublished?: boolean }; orderBy?: any }) => {
      let sql = 'SELECT * FROM "ToolContent"';
      if (args?.where?.isPublished) sql += ' WHERE "isPublished" = true';
      sql += ' ORDER BY "toolName" ASC';

      const res = await pglite.query(sql);
      return res.rows as any[];
    },
    upsert: async (args: { where: { slug: string }; update: any; create: any }) => {
      const existing = await pglite.query('SELECT * FROM "ToolContent" WHERE slug = $1', [args.where.slug]);
      if (existing.rows.length > 0) {
        return existing.rows[0] as any;
      }
      const c = args.create;
      const id = c.id || `tool-content-${c.slug}`;
      const res = await pglite.query(
        `INSERT INTO "ToolContent" (id, slug, "toolName", "shortDescription", "longDescription", "iconIdentifier", "categoryLabel", faq, "relatedTools", "seoMetadata", "introContent", "educationalContent", "isPublished", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
        [
          id,
          c.slug,
          c.toolName,
          c.shortDescription,
          c.longDescription,
          c.iconIdentifier || 'Code',
          c.categoryLabel || 'Text',
          JSON.stringify(c.faq || []),
          JSON.stringify(c.relatedTools || []),
          JSON.stringify(c.seoMetadata || {}),
          c.introContent || null,
          c.educationalContent || null,
          c.isPublished !== false
        ]
      );
      return res.rows[0] as any;
    },
    update: async (args: { where: { slug: string }; data: any }) => {
      const d = args.data;
      const res = await pglite.query(
        `UPDATE "ToolContent"
         SET "toolName" = $1, "shortDescription" = $2, "longDescription" = $3, "iconIdentifier" = $4,
             "categoryLabel" = $5, faq = $6, "relatedTools" = $7, "seoMetadata" = $8, "introContent" = $9,
             "educationalContent" = $10, "isPublished" = $11, "updatedAt" = NOW()
         WHERE slug = $12 RETURNING *`,
        [
          d.toolName,
          d.shortDescription,
          d.longDescription,
          d.iconIdentifier,
          d.categoryLabel,
          JSON.stringify(d.faq || []),
          JSON.stringify(d.relatedTools || []),
          JSON.stringify(d.seoMetadata || {}),
          d.introContent || null,
          d.educationalContent || null,
          d.isPublished !== false,
          args.where.slug
        ]
      );
      return res.rows[0] as any;
    }
  },

  navigationMenu: {
    count: async () => {
      const res = await pglite.query('SELECT COUNT(*) as count FROM "NavigationMenu"');
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id?: string; location?: string }; include?: any }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "NavigationMenu" WHERE id = $1', [args.where.id]);
      } else if (args.where.location) {
        res = await pglite.query('SELECT * FROM "NavigationMenu" WHERE location = $1', [args.where.location]);
      }
      const menu = (res?.rows[0] as any) || null;
      if (menu && args.include?.items) {
        const itemsRes = await pglite.query('SELECT * FROM "NavigationItem" WHERE "menuId" = $1 ORDER BY "order" ASC', [menu.id]);
        menu.items = itemsRes.rows;
      }
      return menu;
    },
    findMany: async (args?: { include?: any }) => {
      const res = await pglite.query('SELECT * FROM "NavigationMenu" ORDER BY location ASC');
      const menus = res.rows as any[];

      if (args?.include?.items) {
        for (const m of menus) {
          const itemsRes = await pglite.query('SELECT * FROM "NavigationItem" WHERE "menuId" = $1 AND "isActive" = true ORDER BY "order" ASC', [m.id]);
          m.items = itemsRes.rows;
        }
      }
      return menus;
    },
    upsert: async (args: { where: { location: string }; update: any; create: any }) => {
      const existing = await pglite.query('SELECT * FROM "NavigationMenu" WHERE location = $1', [args.where.location]);
      if (existing.rows.length > 0) {
        return existing.rows[0] as any;
      }
      const c = args.create;
      const id = c.id || `nav-${c.location}`;
      const res = await pglite.query(
        'INSERT INTO "NavigationMenu" (id, name, location, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
        [id, c.name, c.location]
      );
      return res.rows[0] as any;
    }
  },

  navigationItem: {
    count: async () => {
      const res = await pglite.query('SELECT COUNT(*) as count FROM "NavigationItem"');
      return Number((res.rows[0] as any)?.count || 0);
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const res = await pglite.query(
        `INSERT INTO "NavigationItem" (id, "menuId", label, url, "order", "isActive", target, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
        [id, d.menuId, d.label, d.url, d.order || 0, d.isActive !== false, d.target || '_self']
      );
      return res.rows[0] as any;
    },
    deleteMany: async (args: { where: { menuId: string } }) => {
      await pglite.query('DELETE FROM "NavigationItem" WHERE "menuId" = $1', [args.where.menuId]);
      return { count: 0 };
    }
  },

  siteSettings: {
    count: async () => {
      const res = await pglite.query('SELECT COUNT(*) as count FROM "SiteSettings"');
      return Number((res.rows[0] as any)?.count || 0);
    },
    findFirst: async () => {
      const res = await pglite.query('SELECT * FROM "SiteSettings" LIMIT 1');
      return (res.rows[0] as any) || null;
    },
    upsert: async (args: { where: { id: string }; update: any; create: any }) => {
      const existing = await pglite.query('SELECT * FROM "SiteSettings" WHERE id = $1', [args.where.id]);
      if (existing.rows.length > 0) {
        const u = args.update;
        const res = await pglite.query(
          `UPDATE "SiteSettings"
           SET "siteName" = COALESCE($1, "siteName"),
               "siteDescription" = COALESCE($2, "siteDescription"),
               "logoUrl" = COALESCE($3, "logoUrl"),
               "faviconUrl" = COALESCE($4, "faviconUrl"),
               "defaultSeoTitle" = COALESCE($5, "defaultSeoTitle"),
               "defaultMetaDescription" = COALESCE($6, "defaultMetaDescription"),
               "defaultOgImage" = COALESCE($7, "defaultOgImage"),
               "footerText" = COALESCE($8, "footerText"),
               "socialLinks" = COALESCE($9, "socialLinks"),
               "updatedAt" = NOW()
           WHERE id = $10 RETURNING *`,
          [
            u.siteName,
            u.siteDescription,
            u.logoUrl,
            u.faviconUrl,
            u.defaultSeoTitle,
            u.defaultMetaDescription,
            u.defaultOgImage,
            u.footerText,
            u.socialLinks ? JSON.stringify(u.socialLinks) : null,
            args.where.id
          ]
        );
        return res.rows[0] as any;
      } else {
        const c = args.create;
        const res = await pglite.query(
          `INSERT INTO "SiteSettings" (id, "siteName", "siteDescription", "logoUrl", "faviconUrl", "defaultSeoTitle", "defaultMetaDescription", "defaultOgImage", "footerText", "socialLinks", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
          [
            c.id || 'global-site-settings',
            c.siteName,
            c.siteDescription,
            c.logoUrl || null,
            c.faviconUrl || null,
            c.defaultSeoTitle,
            c.defaultMetaDescription,
            c.defaultOgImage || null,
            c.footerText,
            JSON.stringify(c.socialLinks || [])
          ]
        );
        return res.rows[0] as any;
      }
    }
  },

  mediaAsset: {
    count: async (args?: { where?: any }) => {
      let sql = 'SELECT COUNT(*) as count FROM "MediaAsset" WHERE 1=1';
      const params: any[] = [];
      let idx = 1;
      if (args?.where?.mimeType) {
        if (typeof args.where.mimeType === 'object' && args.where.mimeType.startsWith) {
          sql += ` AND "mimeType" LIKE $${idx++}`;
          params.push(`${args.where.mimeType.startsWith}%`);
        } else if (typeof args.where.mimeType === 'string') {
          sql += ` AND "mimeType" = $${idx++}`;
          params.push(args.where.mimeType);
        }
      }
      if (args?.where?.OR && Array.isArray(args.where.OR)) {
        const clauses: string[] = [];
        args.where.OR.forEach((cond: any) => {
          if (cond.originalFilename?.contains) {
            clauses.push(`"originalFilename" ILIKE $${idx++}`);
            params.push(`%${cond.originalFilename.contains}%`);
          }
          if (cond.title?.contains) {
            clauses.push(`"title" ILIKE $${idx++}`);
            params.push(`%${cond.title.contains}%`);
          }
          if (cond.altText?.contains) {
            clauses.push(`"altText" ILIKE $${idx++}`);
            params.push(`%${cond.altText.contains}%`);
          }
        });
        if (clauses.length > 0) {
          sql += ` AND (${clauses.join(' OR ')})`;
        }
      }
      const res = await pglite.query(sql, params);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id?: string; filename?: string } }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "MediaAsset" WHERE id = $1', [args.where.id]);
      } else if (args.where.filename) {
        res = await pglite.query('SELECT * FROM "MediaAsset" WHERE filename = $1', [args.where.filename]);
      }
      return (res?.rows[0] as any) || null;
    },
    findMany: async (args?: { where?: any; orderBy?: any; skip?: number; take?: number }) => {
      let sql = 'SELECT * FROM "MediaAsset" WHERE 1=1';
      const params: any[] = [];
      let idx = 1;

      if (args?.where?.mimeType) {
        if (typeof args.where.mimeType === 'object' && args.where.mimeType.startsWith) {
          sql += ` AND "mimeType" LIKE $${idx++}`;
          params.push(`${args.where.mimeType.startsWith}%`);
        } else if (typeof args.where.mimeType === 'string') {
          sql += ` AND "mimeType" = $${idx++}`;
          params.push(args.where.mimeType);
        }
      }
      if (args?.where?.OR && Array.isArray(args.where.OR)) {
        const clauses: string[] = [];
        args.where.OR.forEach((cond: any) => {
          if (cond.originalFilename?.contains) {
            clauses.push(`"originalFilename" ILIKE $${idx++}`);
            params.push(`%${cond.originalFilename.contains}%`);
          }
          if (cond.title?.contains) {
            clauses.push(`"title" ILIKE $${idx++}`);
            params.push(`%${cond.title.contains}%`);
          }
          if (cond.altText?.contains) {
            clauses.push(`"altText" ILIKE $${idx++}`);
            params.push(`%${cond.altText.contains}%`);
          }
        });
        if (clauses.length > 0) {
          sql += ` AND (${clauses.join(' OR ')})`;
        }
      }

      sql += ' ORDER BY "createdAt" DESC';
      if (args?.take) sql += ` LIMIT ${args.take}`;
      if (args?.skip) sql += ` OFFSET ${args.skip}`;

      const res = await pglite.query(sql, params);
      return res.rows as any[];
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await pglite.query(
        `INSERT INTO "MediaAsset" (id, "originalFilename", filename, "mimeType", "fileExtension", size, "storagePath", "publicUrl", width, height, "altText", title, caption, description, "uploadedBy", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()) RETURNING *`,
        [
          id,
          d.originalFilename,
          d.filename,
          d.mimeType,
          d.fileExtension,
          d.size,
          d.storagePath,
          d.publicUrl,
          d.width || null,
          d.height || null,
          d.altText || null,
          d.title || null,
          d.caption || null,
          d.description || null,
          d.uploadedBy || 'Admin'
        ]
      );
      return res.rows[0] as any;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const d = args.data;
      const updates: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (d.altText !== undefined) { updates.push(`"altText" = $${idx++}`); params.push(d.altText); }
      if (d.title !== undefined) { updates.push(`"title" = $${idx++}`); params.push(d.title); }
      if (d.caption !== undefined) { updates.push(`"caption" = $${idx++}`); params.push(d.caption); }
      if (d.description !== undefined) { updates.push(`"description" = $${idx++}`); params.push(d.description); }

      updates.push(`"updatedAt" = NOW()`);
      params.push(args.where.id);

      const res = await pglite.query(`UPDATE "MediaAsset" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params);
      return res.rows[0] as any;
    },
    delete: async (args: { where: { id: string } }) => {
      // 1. Check if used as featured image in blog posts
      const postFeatured = await pglite.query('SELECT COUNT(*) as count FROM "BlogPost" WHERE "featuredImageId" = $1', [args.where.id]);
      if (Number((postFeatured.rows[0] as any)?.count || 0) > 0) {
        throw new Error('Cannot delete media asset: It is currently used as the featured image for one or more blog posts.');
      }

      // 2. Check if used as featured image in blog categories
      const catFeatured = await pglite.query('SELECT COUNT(*) as count FROM "BlogCategory" WHERE "featuredImageId" = $1', [args.where.id]);
      if (Number((catFeatured.rows[0] as any)?.count || 0) > 0) {
        throw new Error('Cannot delete media asset: It is currently used as the featured image for one or more blog categories.');
      }

      // 3. Check if embedded in Tiptap document content of any BlogPost
      const embeddedPosts = await pglite.query(
        `SELECT id, title FROM "BlogPost" WHERE content::text LIKE $1`,
        [`%${args.where.id}%`]
      );
      if (embeddedPosts.rows.length > 0) {
        throw new Error(`Cannot delete media asset: It is embedded in the rich text body of blog post "${(embeddedPosts.rows[0] as any).title}".`);
      }

      // 4. Check if embedded in PageVersion content
      const embeddedPages = await pglite.query(
        `SELECT id FROM "PageVersion" WHERE content::text LIKE $1`,
        [`%${args.where.id}%`]
      );
      if (embeddedPages.rows.length > 0) {
        throw new Error('Cannot delete media asset: It is embedded in a CMS Page version.');
      }

      const res = await pglite.query('DELETE FROM "MediaAsset" WHERE id = $1 RETURNING *', [args.where.id]);
      return (res.rows[0] as any) || null;
    }
  },

  blogCategory: {
    count: async (args?: any) => {
      let sql = 'SELECT COUNT(*) as count FROM "BlogCategory" WHERE 1=1';
      const params: any[] = [];
      let idx = 1;
      if (args?.where?.parentId === null) {
        sql += ' AND "parentId" IS NULL';
      } else if (args?.where?.parentId !== undefined) {
        sql += ` AND "parentId" = $${idx++}`;
        params.push(args.where.parentId);
      }
      const res = await pglite.query(sql, params);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id?: string; slug?: string } }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "BlogCategory" WHERE id = $1', [args.where.id]);
      } else if (args.where.slug) {
        res = await pglite.query('SELECT * FROM "BlogCategory" WHERE slug = $1', [args.where.slug]);
      }
      const cat = (res?.rows[0] as any) || null;
      if (cat) {
        if (typeof cat.seoMetadata === 'string') {
          try { cat.seoMetadata = JSON.parse(cat.seoMetadata); } catch {}
        }
        if (cat.parentId) {
          const parentRes = await pglite.query('SELECT id, name, slug FROM "BlogCategory" WHERE id = $1', [cat.parentId]);
          cat.parent = parentRes.rows[0] || null;
        } else {
          cat.parent = null;
        }
        const childrenRes = await pglite.query('SELECT id, name, slug FROM "BlogCategory" WHERE "parentId" = $1 ORDER BY name ASC', [cat.id]);
        cat.children = childrenRes.rows;
      }
      return cat;
    },
    findFirst: async (args: { where: { id?: string; slug?: string } }) => {
      return await prisma.blogCategory.findUnique(args);
    },
    findMany: async (args?: { where?: any; orderBy?: any; include?: any }) => {
      let sql = 'SELECT * FROM "BlogCategory" WHERE 1=1';
      const params: any[] = [];
      let idx = 1;
      if (args?.where?.parentId === null) {
        sql += ' AND "parentId" IS NULL';
      } else if (args?.where?.parentId !== undefined) {
        sql += ` AND "parentId" = $${idx++}`;
        params.push(args.where.parentId);
      }
      sql += ' ORDER BY name ASC';
      const res = await pglite.query(sql, params);
      const categories = res.rows as any[];
      for (const cat of categories) {
        if (typeof cat.seoMetadata === 'string') {
          try { cat.seoMetadata = JSON.parse(cat.seoMetadata); } catch {}
        }
        if (args?.include?.children || true) {
          const childRes = await pglite.query('SELECT id, name, slug FROM "BlogCategory" WHERE "parentId" = $1 ORDER BY name ASC', [cat.id]);
          cat.children = childRes.rows;
        }
        if (cat.parentId) {
          const parentRes = await pglite.query('SELECT id, name, slug FROM "BlogCategory" WHERE id = $1', [cat.parentId]);
          cat.parent = parentRes.rows[0] || null;
        } else {
          cat.parent = null;
        }
      }
      return categories;
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Hierarchy validation: Cannot be parent of oneself
      if (d.parentId && d.parentId === id) {
        throw new Error('Invalid category hierarchy: A category cannot be its own parent.');
      }

      const res = await pglite.query(
        `INSERT INTO "BlogCategory" (id, slug, name, description, "parentId", "featuredImageId", "seoMetadata", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
        [
          id,
          d.slug,
          d.name,
          d.description || null,
          d.parentId || null,
          d.featuredImageId || null,
          d.seoMetadata ? (typeof d.seoMetadata === 'string' ? d.seoMetadata : JSON.stringify(d.seoMetadata)) : null
        ]
      );
      const cat = res.rows[0] as any;
      if (cat && typeof cat.seoMetadata === 'string') {
        try { cat.seoMetadata = JSON.parse(cat.seoMetadata); } catch {}
      }
      return cat;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const d = args.data;

      // Hierarchy validation: Prevent self-reference or circular references
      if (d.parentId !== undefined && d.parentId) {
        if (d.parentId === args.where.id) {
          throw new Error('Invalid category hierarchy: A category cannot be its own parent.');
        }
        // Check if target parentId is a child/descendant of this category
        let currentParentId: string | null = d.parentId;
        while (currentParentId) {
          const parentCheck = await pglite.query('SELECT "parentId" FROM "BlogCategory" WHERE id = $1', [currentParentId]);
          const checkRow = parentCheck.rows[0] as any;
          if (!checkRow) break;
          if (checkRow.parentId === args.where.id) {
            throw new Error('Invalid category hierarchy: Circular hierarchy detected.');
          }
          currentParentId = checkRow.parentId;
        }
      }

      const updates: string[] = [];
      const params: any[] = [];
      let idx = 1;
      if (d.name !== undefined) { updates.push(`name = $${idx++}`); params.push(d.name); }
      if (d.slug !== undefined) { updates.push(`slug = $${idx++}`); params.push(d.slug); }
      if (d.description !== undefined) { updates.push(`description = $${idx++}`); params.push(d.description); }
      if (d.parentId !== undefined) { updates.push(`"parentId" = $${idx++}`); params.push(d.parentId || null); }
      if (d.featuredImageId !== undefined) { updates.push(`"featuredImageId" = $${idx++}`); params.push(d.featuredImageId || null); }
      if (d.seoMetadata !== undefined) {
        updates.push(`"seoMetadata" = $${idx++}`);
        params.push(d.seoMetadata ? (typeof d.seoMetadata === 'string' ? d.seoMetadata : JSON.stringify(d.seoMetadata)) : null);
      }
      updates.push(`"updatedAt" = NOW()`);
      params.push(args.where.id);
      const res = await pglite.query(`UPDATE "BlogCategory" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params);
      const cat = res.rows[0] as any;
      if (cat && typeof cat.seoMetadata === 'string') {
        try { cat.seoMetadata = JSON.parse(cat.seoMetadata); } catch {}
      }
      return cat;
    },
    delete: async (args: { where: { id: string } }) => {
      // 1. Safe Deletion: Check if child categories exist
      const childrenCheck = await pglite.query('SELECT COUNT(*) as count FROM "BlogCategory" WHERE "parentId" = $1', [args.where.id]);
      if (Number((childrenCheck.rows[0] as any)?.count || 0) > 0) {
        throw new Error('Cannot delete category: It has child categories. Please reassign or delete child categories first.');
      }

      // 2. Safe Deletion: Check if referenced by blog posts
      const postsCheck = await pglite.query('SELECT COUNT(*) as count FROM "BlogPost" WHERE "categoryId" = $1', [args.where.id]);
      if (Number((postsCheck.rows[0] as any)?.count || 0) > 0) {
        throw new Error('Cannot delete category: It is currently assigned to one or more blog posts.');
      }

      const res = await pglite.query('DELETE FROM "BlogCategory" WHERE id = $1 RETURNING *', [args.where.id]);
      return (res.rows[0] as any) || null;
    }
  },

  category: {
    count: async (args?: any) => prisma.blogCategory.count(args),
    findUnique: async (args: any) => prisma.blogCategory.findUnique(args),
    findFirst: async (args: any) => prisma.blogCategory.findFirst(args),
    findMany: async (args?: any) => prisma.blogCategory.findMany(args),
    create: async (args: any) => prisma.blogCategory.create(args),
    update: async (args: any) => prisma.blogCategory.update(args),
    delete: async (args: any) => prisma.blogCategory.delete(args)
  },

  blogTag: {
    count: async (args?: any) => {
      let sql = 'SELECT COUNT(*) as count FROM "BlogTag"';
      const res = await pglite.query(sql);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id?: string; slug?: string } }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "BlogTag" WHERE id = $1', [args.where.id]);
      } else if (args.where.slug) {
        res = await pglite.query('SELECT * FROM "BlogTag" WHERE slug = $1', [args.where.slug]);
      }
      const tag = (res?.rows[0] as any) || null;
      if (tag && typeof tag.seoMetadata === 'string') {
        try { tag.seoMetadata = JSON.parse(tag.seoMetadata); } catch {}
      }
      return tag;
    },
    findFirst: async (args: { where: { id?: string; slug?: string } }) => {
      return await prisma.blogTag.findUnique(args);
    },
    findMany: async (args?: { orderBy?: any }) => {
      let sql = 'SELECT * FROM "BlogTag" ORDER BY name ASC';
      const res = await pglite.query(sql);
      const tags = res.rows as any[];
      for (const t of tags) {
        if (typeof t.seoMetadata === 'string') {
          try { t.seoMetadata = JSON.parse(t.seoMetadata); } catch {}
        }
      }
      return tags;
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `tag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await pglite.query(
        `INSERT INTO "BlogTag" (id, slug, name, description, "seoMetadata", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [
          id,
          d.slug,
          d.name,
          d.description || null,
          d.seoMetadata ? (typeof d.seoMetadata === 'string' ? d.seoMetadata : JSON.stringify(d.seoMetadata)) : null
        ]
      );
      const tag = res.rows[0] as any;
      if (tag && typeof tag.seoMetadata === 'string') {
        try { tag.seoMetadata = JSON.parse(tag.seoMetadata); } catch {}
      }
      return tag;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const d = args.data;
      const updates: string[] = [];
      const params: any[] = [];
      let idx = 1;
      if (d.name !== undefined) { updates.push(`name = $${idx++}`); params.push(d.name); }
      if (d.slug !== undefined) { updates.push(`slug = $${idx++}`); params.push(d.slug); }
      if (d.description !== undefined) { updates.push(`description = $${idx++}`); params.push(d.description); }
      if (d.seoMetadata !== undefined) {
        updates.push(`"seoMetadata" = $${idx++}`);
        params.push(d.seoMetadata ? (typeof d.seoMetadata === 'string' ? d.seoMetadata : JSON.stringify(d.seoMetadata)) : null);
      }
      updates.push(`"updatedAt" = NOW()`);
      params.push(args.where.id);
      const res = await pglite.query(`UPDATE "BlogTag" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params);
      const tag = res.rows[0] as any;
      if (tag && typeof tag.seoMetadata === 'string') {
        try { tag.seoMetadata = JSON.parse(tag.seoMetadata); } catch {}
      }
      return tag;
    },
    delete: async (args: { where: { id: string } }) => {
      const res = await pglite.query('DELETE FROM "BlogTag" WHERE id = $1 RETURNING *', [args.where.id]);
      return (res.rows[0] as any) || null;
    }
  },

  tag: {
    count: async (args?: any) => prisma.blogTag.count(args),
    findUnique: async (args: any) => prisma.blogTag.findUnique(args),
    findFirst: async (args: any) => prisma.blogTag.findFirst(args),
    findMany: async (args?: any) => prisma.blogTag.findMany(args),
    create: async (args: any) => prisma.blogTag.create(args),
    update: async (args: any) => prisma.blogTag.update(args),
    delete: async (args: any) => prisma.blogTag.delete(args)
  },

  blogPostTag: {
    create: async (args: { data: { postId: string; tagId: string } }) => {
      const res = await pglite.query(
        `INSERT INTO "BlogPostTag" ("postId", "tagId") VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
        [args.data.postId, args.data.tagId]
      );
      return res.rows[0] as any;
    },
    deleteMany: async (args: { where: { postId?: string; tagId?: string } }) => {
      let sql = 'DELETE FROM "BlogPostTag" WHERE 1=1';
      const params = [];
      let idx = 1;
      if (args.where.postId) { sql += ` AND "postId" = $${idx++}`; params.push(args.where.postId); }
      if (args.where.tagId) { sql += ` AND "tagId" = $${idx++}`; params.push(args.where.tagId); }
      const res = await pglite.query(sql, params);
      return { count: res.affectedRows || 0 };
    },
    findMany: async (args: { where: { postId?: string; tagId?: string }; include?: any }) => {
      let sql = 'SELECT * FROM "BlogPostTag" WHERE 1=1';
      const params = [];
      let idx = 1;
      if (args.where.postId) { sql += ` AND "postId" = $${idx++}`; params.push(args.where.postId); }
      if (args.where.tagId) { sql += ` AND "tagId" = $${idx++}`; params.push(args.where.tagId); }
      const res = await pglite.query(sql, params);
      return res.rows as any[];
    }
  },

  blogPostRevision: {
    count: async (args?: { where?: any }) => {
      let sql = 'SELECT COUNT(*) as count FROM "BlogPostRevision" WHERE 1=1';
      const params = [];
      let idx = 1;
      if (args?.where?.postId) { sql += ` AND "postId" = $${idx++}`; params.push(args.where.postId); }
      const res = await pglite.query(sql, params);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findMany: async (args?: { where?: { postId?: string }; orderBy?: any }) => {
      let sql = 'SELECT * FROM "BlogPostRevision" WHERE 1=1';
      const params = [];
      let idx = 1;
      if (args?.where?.postId) { sql += ` AND "postId" = $${idx++}`; params.push(args.where.postId); }
      sql += ' ORDER BY "versionNumber" DESC';
      const res = await pglite.query(sql, params);
      const revisions = res.rows as any[];
      for (const rev of revisions) {
        if (typeof rev.content === 'string') {
          try { rev.content = JSON.parse(rev.content); } catch {}
        }
        if (typeof rev.seoMetadata === 'string') {
          try { rev.seoMetadata = JSON.parse(rev.seoMetadata); } catch {}
        }
      }
      return revisions;
    },
    findUnique: async (args: { where: { id: string } }) => {
      const res = await pglite.query('SELECT * FROM "BlogPostRevision" WHERE id = $1', [args.where.id]);
      const rev = (res.rows[0] as any) || null;
      if (rev) {
        if (typeof rev.content === 'string') {
          try { rev.content = JSON.parse(rev.content); } catch {}
        }
        if (typeof rev.seoMetadata === 'string') {
          try { rev.seoMetadata = JSON.parse(rev.seoMetadata); } catch {}
        }
      }
      return rev;
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const res = await pglite.query(
        `INSERT INTO "BlogPostRevision" (id, "postId", "versionNumber", title, content, excerpt, "seoMetadata", "changeSummary", "authorId", "createdBy", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`,
        [
          id,
          d.postId,
          d.versionNumber,
          d.title,
          typeof d.content === 'string' ? d.content : JSON.stringify(d.content || {}),
          d.excerpt || null,
          d.seoMetadata ? (typeof d.seoMetadata === 'string' ? d.seoMetadata : JSON.stringify(d.seoMetadata)) : null,
          d.changeSummary || null,
          d.authorId || null,
          d.createdBy || 'Admin'
        ]
      );
      const rev = res.rows[0] as any;
      if (rev && typeof rev.content === 'string') {
        try { rev.content = JSON.parse(rev.content); } catch {}
      }
      return rev;
    }
  },

  blogPost: {
    count: async (args?: { where?: any }) => {
      let sql = 'SELECT COUNT(*) as count FROM "BlogPost" b WHERE 1=1';
      const params: any[] = [];
      let idx = 1;
      if (args?.where?.status) {
        sql += ` AND b.status = $${idx++}`;
        params.push(args.where.status);
      }
      if (args?.where?.categoryId) {
        sql += ` AND b."categoryId" = $${idx++}`;
        params.push(args.where.categoryId);
      }
      if (args?.where?.authorId) {
        sql += ` AND b."authorId" = $${idx++}`;
        params.push(args.where.authorId);
      }
      if (args?.where?.tagId) {
        sql += ` AND EXISTS (SELECT 1 FROM "BlogPostTag" t WHERE t."postId" = b.id AND t."tagId" = $${idx++})`;
        params.push(args.where.tagId);
      }
      if (args?.where?.search) {
        sql += ` AND (b.title ILIKE $${idx} OR b.excerpt ILIKE $${idx})`;
        params.push(`%${args.where.search}%`);
        idx++;
      }
      const res = await pglite.query(sql, params);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { id?: string; slug?: string } }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "BlogPost" WHERE id = $1', [args.where.id]);
      } else if (args.where.slug) {
        res = await pglite.query('SELECT * FROM "BlogPost" WHERE slug = $1', [args.where.slug]);
      }
      const post = (res?.rows[0] as any) || null;
      if (post) {
        if (typeof post.content === 'string') {
          try { post.content = JSON.parse(post.content); } catch {}
        }
        if (typeof post.publishedContent === 'string') {
          try { post.publishedContent = JSON.parse(post.publishedContent); } catch {}
        }
        if (typeof post.seoMetadata === 'string') {
          try { post.seoMetadata = JSON.parse(post.seoMetadata); } catch {}
        }
        if (typeof post.publishedSeoMetadata === 'string') {
          try { post.publishedSeoMetadata = JSON.parse(post.publishedSeoMetadata); } catch {}
        }

        // Resolve Category
        if (post.categoryId) {
          const catRes = await pglite.query('SELECT * FROM "BlogCategory" WHERE id = $1', [post.categoryId]);
          post.category = catRes.rows[0] || null;
        } else {
          post.category = null;
        }

        // Resolve Featured Image
        if (post.featuredImageId) {
          const imgRes = await pglite.query('SELECT * FROM "MediaAsset" WHERE id = $1', [post.featuredImageId]);
          post.featuredImage = imgRes.rows[0] || null;
        } else {
          post.featuredImage = null;
        }

        // Resolve Author
        if (post.authorId) {
          const authRes = await pglite.query('SELECT id, name, email, role FROM "AdminUser" WHERE id = $1', [post.authorId]);
          post.author = authRes.rows[0] || null;
        } else {
          post.author = null;
        }

        // Resolve Tags
        const tagsRes = await pglite.query(
          'SELECT t.* FROM "BlogTag" t INNER JOIN "BlogPostTag" bpt ON t.id = bpt."tagId" WHERE bpt."postId" = $1',
          [post.id]
        );
        post.tags = tagsRes.rows;
      }
      return post;
    },
    findFirst: async (args: { where: any; include?: any }) => {
      let res;
      if (args.where.id) {
        res = await pglite.query('SELECT * FROM "BlogPost" WHERE id = $1', [args.where.id]);
      } else if (args.where.slug) {
        res = await pglite.query('SELECT * FROM "BlogPost" WHERE slug = $1', [args.where.slug]);
      }
      const post = (res?.rows[0] as any) || null;
      if (post) {
        if (typeof post.content === 'string') {
          try { post.content = JSON.parse(post.content); } catch {}
        }
        if (typeof post.publishedContent === 'string') {
          try { post.publishedContent = JSON.parse(post.publishedContent); } catch {}
        }
        if (typeof post.seoMetadata === 'string') {
          try { post.seoMetadata = JSON.parse(post.seoMetadata); } catch {}
        }
        if (typeof post.publishedSeoMetadata === 'string') {
          try { post.publishedSeoMetadata = JSON.parse(post.publishedSeoMetadata); } catch {}
        }
        if (post.categoryId) {
          const catRes = await pglite.query('SELECT * FROM "BlogCategory" WHERE id = $1', [post.categoryId]);
          post.category = catRes.rows[0] || null;
        }
        if (post.featuredImageId) {
          const imgRes = await pglite.query('SELECT * FROM "MediaAsset" WHERE id = $1', [post.featuredImageId]);
          post.featuredImage = imgRes.rows[0] || null;
        }
        if (post.authorId) {
          const authRes = await pglite.query('SELECT id, name, email, role FROM "AdminUser" WHERE id = $1', [post.authorId]);
          post.author = authRes.rows[0] || null;
        }
        const tagsRes = await pglite.query(
          'SELECT t.* FROM "BlogTag" t INNER JOIN "BlogPostTag" bpt ON t.id = bpt."tagId" WHERE bpt."postId" = $1',
          [post.id]
        );
        post.tags = tagsRes.rows;
      }
      return post;
    },
    findMany: async (args?: { where?: any; orderBy?: any; take?: number; skip?: number; include?: any }) => {
      let sql = 'SELECT b.* FROM "BlogPost" b WHERE 1=1';
      const params: any[] = [];
      let idx = 1;

      if (args?.where?.status) {
        sql += ` AND b.status = $${idx++}`;
        params.push(args.where.status);
      }
      if (args?.where?.categoryId) {
        sql += ` AND b."categoryId" = $${idx++}`;
        params.push(args.where.categoryId);
      }
      if (args?.where?.authorId) {
        sql += ` AND b."authorId" = $${idx++}`;
        params.push(args.where.authorId);
      }
      if (args?.where?.tagId) {
        sql += ` AND EXISTS (SELECT 1 FROM "BlogPostTag" t WHERE t."postId" = b.id AND t."tagId" = $${idx++})`;
        params.push(args.where.tagId);
      }
      if (args?.where?.search) {
        sql += ` AND (b.title ILIKE $${idx} OR b.excerpt ILIKE $${idx})`;
        params.push(`%${args.where.search}%`);
        idx++;
      }

      sql += ' ORDER BY b."publishedAt" DESC NULLS LAST, b."createdAt" DESC';

      if (args?.take !== undefined) {
        sql += ` LIMIT $${idx++}`;
        params.push(args.take);
      }
      if (args?.skip !== undefined) {
        sql += ` OFFSET $${idx++}`;
        params.push(args.skip);
      }

      const res = await pglite.query(sql, params);
      const posts = res.rows as any[];

      for (const post of posts) {
        if (typeof post.content === 'string') {
          try { post.content = JSON.parse(post.content); } catch {}
        }
        if (typeof post.publishedContent === 'string') {
          try { post.publishedContent = JSON.parse(post.publishedContent); } catch {}
        }
        if (typeof post.seoMetadata === 'string') {
          try { post.seoMetadata = JSON.parse(post.seoMetadata); } catch {}
        }
        if (typeof post.publishedSeoMetadata === 'string') {
          try { post.publishedSeoMetadata = JSON.parse(post.publishedSeoMetadata); } catch {}
        }

        if (post.categoryId) {
          const catRes = await pglite.query('SELECT * FROM "BlogCategory" WHERE id = $1', [post.categoryId]);
          post.category = catRes.rows[0] || null;
        } else {
          post.category = null;
        }

        if (post.featuredImageId) {
          const imgRes = await pglite.query('SELECT * FROM "MediaAsset" WHERE id = $1', [post.featuredImageId]);
          post.featuredImage = imgRes.rows[0] || null;
        } else {
          post.featuredImage = null;
        }

        if (post.authorId) {
          const authRes = await pglite.query('SELECT id, name, email, role FROM "AdminUser" WHERE id = $1', [post.authorId]);
          post.author = authRes.rows[0] || null;
        } else {
          post.author = null;
        }

        const tagsRes = await pglite.query(
          'SELECT t.* FROM "BlogTag" t INNER JOIN "BlogPostTag" bpt ON t.id = bpt."tagId" WHERE bpt."postId" = $1',
          [post.id]
        );
        post.tags = tagsRes.rows;
      }

      return posts;
    },
    create: async (args: { data: any }) => {
      const d = args.data;
      const id = d.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const isPublished = d.status === 'PUBLISHED';
      
      const contentJson = typeof d.content === 'string' ? d.content : JSON.stringify(d.content || {});
      const seoJson = d.seoMetadata ? (typeof d.seoMetadata === 'string' ? d.seoMetadata : JSON.stringify(d.seoMetadata)) : null;

      const publishedContent = isPublished ? contentJson : null;
      const publishedTitle = isPublished ? d.title : null;
      const publishedExcerpt = isPublished ? (d.excerpt || null) : null;
      const publishedSeoMetadata = isPublished ? seoJson : null;
      const publishedAt = isPublished ? (d.publishedAt || new Date()) : null;

      const res = await pglite.query(
        `INSERT INTO "BlogPost" (
          id, slug, title, excerpt, content, status, "scheduledAt", "publishedAt",
          "createdAt", "updatedAt", "createdBy", "updatedBy", "authorId", "featuredImageId",
          "categoryId", "publishedContent", "publishedTitle", "publishedExcerpt",
          "publishedSeoMetadata", "seoMetadata"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *`,
        [
          id,
          d.slug,
          d.title,
          d.excerpt || null,
          contentJson,
          d.status || 'DRAFT',
          d.scheduledAt || null,
          publishedAt,
          d.createdBy || 'Admin',
          d.updatedBy || 'Admin',
          d.authorId || null,
          d.featuredImageId || null,
          d.categoryId || null,
          publishedContent,
          publishedTitle,
          publishedExcerpt,
          publishedSeoMetadata,
          seoJson
        ]
      );
      const post = res.rows[0] as any;
      if (post && typeof post.content === 'string') {
        try { post.content = JSON.parse(post.content); } catch {}
      }
      return post;
    },
    update: async (args: { where: { id: string }; data: any }) => {
      const d = args.data;
      const updates: string[] = [];
      const params: any[] = [];
      let idx = 1;

      if (d.title !== undefined) { updates.push(`title = $${idx++}`); params.push(d.title); }
      if (d.slug !== undefined) { updates.push(`slug = $${idx++}`); params.push(d.slug); }
      if (d.excerpt !== undefined) { updates.push(`excerpt = $${idx++}`); params.push(d.excerpt); }
      if (d.content !== undefined) {
        updates.push(`content = $${idx++}`);
        params.push(typeof d.content === 'string' ? d.content : JSON.stringify(d.content || {}));
      }
      if (d.status !== undefined) { updates.push(`status = $${idx++}`); params.push(d.status); }
      if (d.scheduledAt !== undefined) { updates.push(`"scheduledAt" = $${idx++}`); params.push(d.scheduledAt); }
      if (d.publishedAt !== undefined) { updates.push(`"publishedAt" = $${idx++}`); params.push(d.publishedAt); }
      if (d.updatedBy !== undefined) { updates.push(`"updatedBy" = $${idx++}`); params.push(d.updatedBy); }
      if (d.authorId !== undefined) { updates.push(`"authorId" = $${idx++}`); params.push(d.authorId || null); }
      if (d.featuredImageId !== undefined) { updates.push(`"featuredImageId" = $${idx++}`); params.push(d.featuredImageId || null); }
      if (d.categoryId !== undefined) { updates.push(`"categoryId" = $${idx++}`); params.push(d.categoryId || null); }
      if (d.seoMetadata !== undefined) {
        updates.push(`"seoMetadata" = $${idx++}`);
        params.push(d.seoMetadata ? (typeof d.seoMetadata === 'string' ? d.seoMetadata : JSON.stringify(d.seoMetadata)) : null);
      }

      // Explicit published version snapshot fields (for published version stability)
      if (d.publishedContent !== undefined) {
        updates.push(`"publishedContent" = $${idx++}`);
        params.push(d.publishedContent ? (typeof d.publishedContent === 'string' ? d.publishedContent : JSON.stringify(d.publishedContent)) : null);
      }
      if (d.publishedTitle !== undefined) { updates.push(`"publishedTitle" = $${idx++}`); params.push(d.publishedTitle); }
      if (d.publishedExcerpt !== undefined) { updates.push(`"publishedExcerpt" = $${idx++}`); params.push(d.publishedExcerpt); }
      if (d.publishedSeoMetadata !== undefined) {
        updates.push(`"publishedSeoMetadata" = $${idx++}`);
        params.push(d.publishedSeoMetadata ? (typeof d.publishedSeoMetadata === 'string' ? d.publishedSeoMetadata : JSON.stringify(d.publishedSeoMetadata)) : null);
      }

      updates.push(`"updatedAt" = NOW()`);
      params.push(args.where.id);

      const res = await pglite.query(`UPDATE "BlogPost" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params);
      const post = res.rows[0] as any;
      if (post && typeof post.content === 'string') {
        try { post.content = JSON.parse(post.content); } catch {}
      }
      return post;
    },
    delete: async (args: { where: { id: string } }) => {
      const res = await pglite.query('DELETE FROM "BlogPost" WHERE id = $1 RETURNING *', [args.where.id]);
      return (res.rows[0] as any) || null;
    }
  },

  redirect: {
    count: async (args?: any) => {
      let sql = 'SELECT COUNT(*) as count FROM "Redirect"';
      const res = await pglite.query(sql);
      return Number((res.rows[0] as any)?.count || 0);
    },
    findUnique: async (args: { where: { fromPath: string } }) => {
      const res = await pglite.query('SELECT * FROM "Redirect" WHERE "fromPath" = $1', [args.where.fromPath]);
      return (res.rows[0] as any) || null;
    },
    findMany: async (args?: { orderBy?: any }) => {
      const res = await pglite.query('SELECT * FROM "Redirect" ORDER BY "createdAt" DESC');
      return res.rows as any[];
    },
    create: async (args: { data: { fromPath: string; toPath: string; statusCode?: number } }) => {
      const id = `redir-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const res = await pglite.query(
        `INSERT INTO "Redirect" (id, "fromPath", "toPath", "statusCode", "createdAt")
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT ("fromPath") DO UPDATE SET "toPath" = $3, "statusCode" = $4
         RETURNING *`,
        [id, args.data.fromPath, args.data.toPath, args.data.statusCode || 301]
      );
      return res.rows[0] as any;
    },
    delete: async (args: { where: { id: string } }) => {
      const res = await pglite.query('DELETE FROM "Redirect" WHERE id = $1 RETURNING *', [args.where.id]);
      return (res.rows[0] as any) || null;
    }
  },

  // Prisma Transaction Execution
  $transaction: async <T>(fn: (tx: PrismaRepository) => Promise<T>): Promise<T> => {
    return await fn(prisma);
  },

  $disconnect: async (): Promise<void> => {
    try {
      await pglite.close();
    } catch {}
  }
};

// Database Seeding
export async function seedDatabaseIfEmpty(): Promise<void> {
  validateEnvironmentOrThrow();

  const userCount = await prisma.adminUser.count();
  if (userCount > 0) {
    return;
  }

  console.log('🌱 Seeding production PostgreSQL database via Prisma ORM repository...');

  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = process.env.ADMIN_PASSWORD!;
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  // 1. Seed Admin User
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Lead Site Administrator',
      role: Role.SUPER_ADMIN,
      isActive: true
    }
  });

  // 2. Seed Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'global-site-settings' },
    update: {},
    create: {
      id: 'global-site-settings',
      siteName: 'Text Tools',
      siteDescription: 'Online Text Utilities & Content Platform',
      logoUrl: '/favicon.ico',
      faviconUrl: '/favicon.ico',
      defaultSeoTitle: 'Free Online Text Tools & Developer Utilities',
      defaultMetaDescription: 'Fast, private, 100% client-side text tools for writers, editors, engineers, and digital marketers.',
      defaultOgImage: 'https://texttools.app/og-image.png',
      footerText: '© 2026 Text Tools. All rights reserved. 100% Client-Side Privacy Guaranteed.',
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com' },
        { platform: 'Twitter', url: 'https://twitter.com' }
      ]
    }
  });

  // 3. Seed Initial Navigation Menus & Items
  const headerMenu = await prisma.navigationMenu.upsert({
    where: { location: 'header' },
    update: {},
    create: {
      name: 'Main Header Menu',
      location: 'header'
    }
  });

  const footerMenu = await prisma.navigationMenu.upsert({
    where: { location: 'footer' },
    update: {},
    create: {
      name: 'Footer Links Menu',
      location: 'footer'
    }
  });

  const defaultHeaderItems = [
    { label: 'All Tools', url: '/text-tools', order: 1, isActive: true, target: '_self' },
    { label: 'Developer', url: '/developer-tools', order: 2, isActive: true, target: '_self' },
    { label: 'SEO', url: '/seo-tools', order: 3, isActive: true, target: '_self' },
    { label: 'About', url: '/about', order: 4, isActive: true, target: '_self' }
  ];

  const defaultFooterItems = [
    { label: 'All Tools', url: '/text-tools', order: 1, isActive: true, target: '_self' },
    { label: 'Privacy Policy', url: '/privacy', order: 2, isActive: true, target: '_self' },
    { label: 'Terms of Service', url: '/terms', order: 3, isActive: true, target: '_self' },
    { label: 'About', url: '/about', order: 4, isActive: true, target: '_self' }
  ];

  for (const item of defaultHeaderItems) {
    await prisma.navigationItem.create({
      data: { ...item, menuId: headerMenu.id }
    });
  }

  for (const item of defaultFooterItems) {
    await prisma.navigationItem.create({
      data: { ...item, menuId: footerMenu.id }
    });
  }

  // 4. Seed Pages & Initial Versions
  const initialPages = [
    { slug: 'home', title: 'Free Online Text Tools & Developer Utilities' },
    { slug: 'text-tools', title: 'Text Essentials Directory' },
    { slug: 'developer-tools', title: 'Developer Utilities Directory' },
    { slug: 'seo-tools', title: 'SEO & Content Tools Directory' },
    { slug: 'about', title: 'About Text Tools' },
    { slug: 'privacy', title: 'Privacy Policy' },
    { slug: 'terms', title: 'Terms of Service' }
  ];

  for (const p of initialPages) {
    const newPage = await prisma.page.create({
      data: {
        slug: p.slug,
        title: p.title,
        status: PageStatus.PUBLISHED,
        createdBy: 'Lead Site Administrator',
        updatedBy: 'Lead Site Administrator'
      }
    });

    const newVer = await prisma.pageVersion.create({
      data: {
        pageId: newPage.id,
        versionNumber: 1,
        content: {
          sections: [
            {
              id: `sec-hero-${p.slug}`,
              type: 'hero',
              data: { eyebrow: '100% Client-Side Privacy', title: p.title, description: 'Client-side text processing.' }
            }
          ]
        },
        seoMetadata: {
          seoTitle: p.title,
          metaDescription: '100% client-side privacy text tools.',
          canonicalUrl: `https://texttools.app/${p.slug}`,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: p.title,
          ogDescription: '100% client-side text tools.',
          ogImage: 'https://texttools.app/og-image.png',
          twitterTitle: p.title,
          twitterDescription: '100% client-side text tools.',
          twitterImage: 'https://texttools.app/og-image.png',
          schemaJson: ''
        },
        changeSummary: 'Initial seeded version.',
        createdBy: 'Lead Site Administrator'
      }
    });

    await prisma.page.update({
      where: { id: newPage.id },
      data: {
        publishedVersionId: newVer.id,
        publishedAt: new Date().toISOString()
      }
    });
  }

  // 5. Seed 50 Tools Editable Metadata
  for (const t of TOOL_REGISTRY) {
    await prisma.toolContent.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        slug: t.slug,
        toolName: t.title,
        shortDescription: t.shortDescription,
        longDescription: t.description,
        iconIdentifier: t.icon || 'Code',
        categoryLabel: t.category,
        faq: t.faq || [],
        relatedTools: t.relatedTools || [],
        seoMetadata: {
          seoTitle: t.seo?.title || t.title,
          metaDescription: t.seo?.description || t.shortDescription,
          canonicalUrl: `https://texttools.app/tools/${t.slug}`,
          robotsIndex: true,
          robotsFollow: true,
          ogTitle: t.seo?.title || t.title,
          ogDescription: t.seo?.description || t.shortDescription,
          ogImage: 'https://texttools.app/og-image.png',
          twitterTitle: t.seo?.title || t.title,
          twitterDescription: t.seo?.description || t.shortDescription,
          twitterImage: 'https://texttools.app/og-image.png',
          schemaJson: ''
        },
        introContent: `Use ${t.title} online for fast, private text processing directly in your browser.`,
        educationalContent: `${t.title} processes all inputs 100% client-side without sending text to external servers.`,
        isPublished: true
      }
    });
  }

  console.log('✓ Production database seeded successfully via Prisma ORM repository.');
}
