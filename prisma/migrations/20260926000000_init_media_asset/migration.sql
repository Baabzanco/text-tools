-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable "AdminUser"
CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable "Page"
CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable "PageVersion"
CREATE TABLE IF NOT EXISTS "PageVersion" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "seoMetadata" JSONB NOT NULL,
    "changeSummary" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable "ToolContent"
CREATE TABLE IF NOT EXISTS "ToolContent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "iconIdentifier" TEXT NOT NULL DEFAULT 'Code',
    "categoryLabel" TEXT NOT NULL DEFAULT 'Text',
    "faq" JSONB NOT NULL,
    "relatedTools" JSONB NOT NULL,
    "seoMetadata" JSONB NOT NULL,
    "introContent" TEXT,
    "educationalContent" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable "NavigationMenu"
CREATE TABLE IF NOT EXISTS "NavigationMenu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable "NavigationItem"
CREATE TABLE IF NOT EXISTS "NavigationItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "target" TEXT NOT NULL DEFAULT '_self',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable "SiteSettings"
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Text Tools',
    "siteDescription" TEXT NOT NULL DEFAULT 'Online Text Utilities & Content Platform',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "defaultSeoTitle" TEXT NOT NULL DEFAULT 'Free Online Text Tools & Developer Utilities',
    "defaultMetaDescription" TEXT NOT NULL DEFAULT 'Fast, private, 100% client-side text tools for writers, editors, engineers, and digital marketers.',
    "defaultOgImage" TEXT,
    "footerText" TEXT NOT NULL DEFAULT '© 2026 Text Tools. All rights reserved. 100% Client-Side Privacy Guaranteed.',
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable "MediaAsset"
CREATE TABLE IF NOT EXISTS "MediaAsset" (
    "id" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX IF NOT EXISTS "AdminUser_email_idx" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");
CREATE INDEX IF NOT EXISTS "Page_slug_idx" ON "Page"("slug");
CREATE INDEX IF NOT EXISTS "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PageVersion_pageId_idx" ON "PageVersion"("pageId");
CREATE INDEX IF NOT EXISTS "PageVersion_pageId_versionNumber_idx" ON "PageVersion"("pageId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ToolContent_slug_key" ON "ToolContent"("slug");
CREATE INDEX IF NOT EXISTS "ToolContent_slug_idx" ON "ToolContent"("slug");
CREATE INDEX IF NOT EXISTS "ToolContent_isPublished_idx" ON "ToolContent"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "NavigationMenu_name_key" ON "NavigationMenu"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "NavigationMenu_location_key" ON "NavigationMenu"("location");
CREATE INDEX IF NOT EXISTS "NavigationMenu_location_idx" ON "NavigationMenu"("location");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NavigationItem_menuId_idx" ON "NavigationItem"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_filename_key" ON "MediaAsset"("filename");
CREATE INDEX IF NOT EXISTS "MediaAsset_mimeType_idx" ON "MediaAsset"("mimeType");
CREATE INDEX IF NOT EXISTS "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");
CREATE INDEX IF NOT EXISTS "MediaAsset_filename_idx" ON "MediaAsset"("filename");

-- AddForeignKey
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NavigationItem" ADD CONSTRAINT "NavigationItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "NavigationMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
