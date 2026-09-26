-- Drop old tables if they exist from temporary setup
DROP TABLE IF EXISTS "BlogPostTag" CASCADE;
DROP TABLE IF EXISTS "BlogPostRevision" CASCADE;
DROP TABLE IF EXISTS "BlogPost" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Tag" CASCADE;
DROP TABLE IF EXISTS "BlogCategory" CASCADE;
DROP TABLE IF EXISTS "BlogTag" CASCADE;
DROP TABLE IF EXISTS "Redirect" CASCADE;
DROP TYPE IF EXISTS "BlogPostStatus" CASCADE;

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateTable "BlogCategory"
CREATE TABLE IF NOT EXISTS "BlogCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "featuredImageId" TEXT,
    "seoMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable "BlogTag"
CREATE TABLE IF NOT EXISTS "BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "seoMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable "BlogPost"
CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'Admin',
    "updatedBy" TEXT NOT NULL DEFAULT 'Admin',
    "authorId" TEXT,
    "featuredImageId" TEXT,
    "categoryId" TEXT,
    "publishedVersionId" TEXT,
    "publishedContent" JSONB,
    "publishedTitle" TEXT,
    "publishedExcerpt" TEXT,
    "publishedSeoMetadata" JSONB,
    "seoMetadata" JSONB,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable "BlogPostRevision"
CREATE TABLE IF NOT EXISTS "BlogPostRevision" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "excerpt" TEXT,
    "seoMetadata" JSONB,
    "changeSummary" TEXT,
    "authorId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable "BlogPostTag"
CREATE TABLE IF NOT EXISTS "BlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable "Redirect"
CREATE TABLE IF NOT EXISTS "Redirect" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogCategory_slug_key" ON "BlogCategory"("slug");
CREATE INDEX IF NOT EXISTS "BlogCategory_slug_idx" ON "BlogCategory"("slug");
CREATE INDEX IF NOT EXISTS "BlogCategory_parentId_idx" ON "BlogCategory"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogTag_slug_key" ON "BlogTag"("slug");
CREATE INDEX IF NOT EXISTS "BlogTag_slug_idx" ON "BlogTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_status_idx" ON "BlogPost"("status");
CREATE INDEX IF NOT EXISTS "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");
CREATE INDEX IF NOT EXISTS "BlogPost_authorId_idx" ON "BlogPost"("authorId");
CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");
CREATE INDEX IF NOT EXISTS "BlogPost_createdAt_idx" ON "BlogPost"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BlogPostRevision_postId_idx" ON "BlogPostRevision"("postId");
CREATE INDEX IF NOT EXISTS "BlogPostRevision_postId_versionNumber_idx" ON "BlogPostRevision"("postId", "versionNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BlogPostTag_postId_idx" ON "BlogPostTag"("postId");
CREATE INDEX IF NOT EXISTS "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Redirect_fromPath_key" ON "Redirect"("fromPath");
CREATE INDEX IF NOT EXISTS "Redirect_fromPath_idx" ON "Redirect"("fromPath");

-- AddForeignKey
ALTER TABLE "BlogCategory" ADD CONSTRAINT "BlogCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BlogCategory" ADD CONSTRAINT "BlogCategory_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostRevision" ADD CONSTRAINT "BlogPostRevision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
