import imageSize from 'image-size';

export interface ImageDimensions {
  width: number | null;
  height: number | null;
}

export class MediaMetadataService {
  /**
   * Extracts dimensions from an image buffer
   */
  static extractImageDimensions(buffer: Buffer, mimeType: string): ImageDimensions {
    if (!mimeType.startsWith('image/')) {
      return { width: null, height: null };
    }

    try {
      const dimensions = imageSize(buffer);
      return {
        width: dimensions.width || null,
        height: dimensions.height || null
      };
    } catch {
      return { width: null, height: null };
    }
  }
}
