import path from 'path';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

export class MediaValidationService {
  /**
   * Sanitizes original filename to prevent directory traversal & null-byte attacks
   */
  static sanitizeFilename(originalName: string): { sanitizedName: string; extension: string } {
    if (!originalName || typeof originalName !== 'string') {
      throw new Error('Invalid filename provided.');
    }

    // Strip null bytes and control characters
    const cleanName = originalName.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');
    const basename = path.basename(cleanName);
    const ext = path.extname(basename).toLowerCase();

    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Invalid or unsupported file extension '${ext}'. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Strip unsafe characters from filename prefix
    const nameWithoutExt = path.basename(basename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safePrefix = nameWithoutExt.substring(0, 50) || 'file';

    return {
      sanitizedName: `${safePrefix}${ext}`,
      extension: ext
    };
  }

  /**
   * Validates file buffer magic bytes against expected MIME signatures
   */
  static validateMagicBytes(buffer: Buffer, mimeType: string, extension: string): boolean {
    if (!buffer || buffer.length < 4) return false;

    // Magic Bytes signatures
    const hex = buffer.toString('hex', 0, 8).toUpperCase();

    // JPEG: FF D8 FF
    if (hex.startsWith('FFD8FF')) {
      return mimeType === 'image/jpeg' && ['.jpg', '.jpeg'].includes(extension);
    }

    // PNG: 89 50 4E 47
    if (hex.startsWith('89504E47')) {
      return mimeType === 'image/png' && extension === '.png';
    }

    // GIF: 47 49 46 38 (GIF87a or GIF89a)
    if (hex.startsWith('47494638')) {
      return mimeType === 'image/gif' && extension === '.gif';
    }

    // WebP: RIFF ... WEBP (52 49 46 46 ... 57 45 42 50)
    if (hex.startsWith('52494646') && buffer.toString('utf8', 8, 12) === 'WEBP') {
      return mimeType === 'image/webp' && extension === '.webp';
    }

    // PDF: %PDF (25 50 44 46)
    if (hex.startsWith('25504446')) {
      return mimeType === 'application/pdf' && extension === '.pdf';
    }

    return false;
  }

  /**
   * Validates file size limits
   */
  static validateFileSize(sizeInBytes: number, maxMb: number = 20): void {
    const maxBytes = maxMb * 1024 * 1024;
    if (sizeInBytes <= 0) {
      throw new Error('Uploaded file is empty.');
    }
    if (sizeInBytes > maxBytes) {
      throw new Error(`File size (${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of ${maxMb} MB.`);
    }
  }
}
