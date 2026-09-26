import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../../db/prisma';

export class MediaStorageService {
  /**
   * Gets the root storage directory from MEDIA_STORAGE_PATH env variable
   */
  static getStorageRootDir(): string {
    const rawPath = process.env.MEDIA_STORAGE_PATH || path.resolve(process.cwd(), 'uploads');
    const resolvedPath = path.resolve(rawPath);
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true });
    }
    return resolvedPath;
  }

  /**
   * Generates a collision-resistant unique filename while preserving extension
   */
  static generateUniqueFilename(extension: string): string {
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uuid = crypto.randomUUID().replace(/-/g, '').substring(0, 12);
    return `${datePrefix}_${uuid}${extension.toLowerCase()}`;
  }

  /**
   * Resolves physical storage path with strict path traversal prevention
   */
  static resolveStoragePath(filename: string): string {
    const rootDir = this.getStorageRootDir();

    // Prevent path traversal null-byte / relative path hacks
    const cleanFilename = path.basename(filename.replace(/\0/g, ''));
    const resolvedPath = path.resolve(rootDir, cleanFilename);

    if (!resolvedPath.startsWith(rootDir)) {
      throw new Error('SECURITY ALERT: Path traversal attempt detected and blocked.');
    }

    return resolvedPath;
  }

  /**
   * Writes buffer to local filesystem
   */
  static async writeMediaFile(filename: string, buffer: Buffer): Promise<string> {
    const targetPath = this.resolveStoragePath(filename);
    await fs.promises.writeFile(targetPath, buffer);
    return targetPath;
  }

  /**
   * Deletes physical media file safely
   */
  static async deletePhysicalFile(filename: string): Promise<boolean> {
    try {
      const targetPath = this.resolveStoragePath(filename);
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
        return true;
      }
    } catch (err) {
      console.error(`Failed to delete physical file ${filename}:`, err);
    }
    return false;
  }

  /**
   * Scans filesystem and database for orphan files and missing records
   */
  static async getMediaDiagnostics() {
    const rootDir = this.getStorageRootDir();
    const diskFiles = await fs.promises.readdir(rootDir);
    const dbAssets = await prisma.mediaAsset.findMany();

    const dbFilenames = new Set(dbAssets.map((a: any) => a.filename));
    const diskFilenameSet = new Set(diskFiles);

    const physicalFilesMissingInDb = diskFiles.filter((f) => !dbFilenames.has(f));
    const dbRecordsMissingOnDisk = dbAssets.filter((a: any) => !diskFilenameSet.has(a.filename));

    return {
      totalDiskFiles: diskFiles.length,
      totalDbRecords: dbAssets.length,
      orphanPhysicalFiles: physicalFilesMissingInDb,
      missingPhysicalFilesForDbRecords: dbRecordsMissingOnDisk
    };
  }
}
