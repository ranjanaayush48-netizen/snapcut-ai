import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

class CloudinaryService {
  private isConfigured: boolean = false;

  constructor() {
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true
      });
      this.isConfigured = true;
      logger.info('Cloudinary initialized with secure API configuration');
    } else {
      logger.info('Cloudinary credentials not provided. Using local inline image processor for uploads.');
    }
  }

  /**
   * Upload an image buffer or base64 to Cloudinary with temporary expiration tags
   */
  async uploadTemporaryImage(
    buffer: Buffer,
    filename: string,
    folder: 'originals' | 'results' = 'originals'
  ): Promise<{ url: string; assetId: string }> {
    if (!this.isConfigured) {
      // Return a standard data URI or placeholder URL for zero-friction local testing
      const base64 = buffer.toString('base64');
      const mime = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const fakeId = `snapcut_local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const url = `data:${mime};base64,${base64}`;
      return { url, assetId: fakeId };
    }

    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `snapcut/temp/${folder}`,
            tags: ['snapcut', `temp_${folder}`, `retention_${env.IMAGE_RETENTION_SECONDS}s`],
            resource_type: 'image',
            format: folder === 'results' ? 'png' : undefined,
            context: {
              uploaded_at: new Date().toISOString(),
              retention_seconds: env.IMAGE_RETENTION_SECONDS.toString()
            }
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return {
        url: result.secure_url,
        assetId: result.public_id
      };
    } catch (error: any) {
      logger.error('Cloudinary upload error', { error: error.message });
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteAsset(assetId: string): Promise<boolean> {
    if (!this.isConfigured || assetId.startsWith('snapcut_local_')) {
      return true;
    }

    try {
      const res = await cloudinary.uploader.destroy(assetId);
      logger.info('Cloudinary asset deleted', { assetId, result: res.result });
      return res.result === 'ok';
    } catch (error: any) {
      logger.error('Failed to delete Cloudinary asset', { assetId, error: error.message });
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
