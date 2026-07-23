import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.7;

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
}

/**
 * Downscales an image so its longest side is at most MAX_DIMENSION and
 * re-encodes it as JPEG at JPEG_QUALITY — keeps ID photo uploads fast and
 * cheap on storage without a visible quality loss.
 */
export async function compressForUpload(
  uri: string,
  originalWidth?: number,
  originalHeight?: number
): Promise<CompressedImage> {
  const context = ImageManipulator.manipulate(uri);
  const longestSide = Math.max(originalWidth ?? 0, originalHeight ?? 0);

  if (longestSide > MAX_DIMENSION) {
    if ((originalWidth ?? 0) >= (originalHeight ?? 0)) {
      context.resize({ width: MAX_DIMENSION });
    } else {
      context.resize({ height: MAX_DIMENSION });
    }
  }

  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  return { uri: result.uri, width: result.width, height: result.height };
}
