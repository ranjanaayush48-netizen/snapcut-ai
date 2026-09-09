import axios from 'axios';
import FormData from 'form-data';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { verifyN8nSecret } from '../../utils/crypto.js';

export interface N8nJobPayload {
  jobId: string;
  userId: string;
  inputUrl: string;
  originalFilename: string;
  callbackUrl: string;
  timestamp: string;
  imageBuffer: Buffer;
  mimeType: string;
}

export interface N8nCallbackPayload {
  jobId: string;
  status: 'completed' | 'failed';
  outputUrl?: string;
  outputAssetId?: string;
  errorCode?: string;
  errorMessage?: string;
  durationMs?: number;
}

export interface N8nTriggerResult {
  accepted: boolean;
  outputUrl?: string;
  outputAssetId?: string;
}

const isHttpUrl = (value: unknown): value is string =>
  typeof value === 'string' && /^https?:\/\//i.test(value);

const cloudNameFromUrl = (url?: string): string => {
  if (!url) return '';
  const match = url.match(/res\.cloudinary\.com\/([^/]+)/i);
  return match?.[1] || '';
};

const buildCloudinaryUrl = (publicId: string, version?: string | number, fallbackUrl?: string): string | undefined => {
  const cloudName = env.CLOUDINARY_CLOUD_NAME || cloudNameFromUrl(fallbackUrl);
  if (!cloudName || !publicId) return undefined;
  const versionSegment = version ? `v${version}/` : '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${versionSegment}${publicId}`;
};

export function extractN8nOutput(data: unknown, fallbackInputUrl?: string): { outputUrl?: string; outputAssetId?: string } {
  const visited = new Set<unknown>();
  const queue: unknown[] = [data];
  let publicId: string | undefined;
  let assetId: string | undefined;
  let version: string | number | undefined;
  let outputUrl: string | undefined;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    const record = current as Record<string, unknown>;

    const secureUrl = record.secure_url;
    const url = record.url;
    const output = record.output_url ?? record.outputUrl ?? record.image_url ?? record.processed_url;
    if (!outputUrl && isHttpUrl(secureUrl)) outputUrl = secureUrl;
    if (!outputUrl && isHttpUrl(output)) outputUrl = output;
    if (!outputUrl && isHttpUrl(url) && String(url).includes('res.cloudinary.com')) outputUrl = url;

    if (!publicId && typeof record.public_id === 'string' && record.public_id) publicId = record.public_id;
    if (!assetId && typeof record.asset_id === 'string' && record.asset_id) assetId = record.asset_id;
    if (version === undefined && (typeof record.version === 'number' || typeof record.version === 'string')) {
      version = record.version;
    }

    if (record.json) queue.push(record.json);
    if (record.body) queue.push(record.body);
    if (record.data) queue.push(record.data);
  }

  if (!outputUrl && publicId) {
    outputUrl = buildCloudinaryUrl(publicId, version, fallbackInputUrl);
  }

  return {
    outputUrl,
    outputAssetId: publicId || assetId
  };
}

class N8nService {
  isEnabled(): boolean {
    return Boolean(env.N8N_WEBHOOK_URL && env.N8N_WEBHOOK_URL.startsWith('http'));
  }

  async triggerWorkflow(payload: N8nJobPayload): Promise<N8nTriggerResult> {
    if (!this.isEnabled()) {
      logger.info('n8n Cloud webhook URL not set; will process job directly via internal pipeline');
      return { accepted: false };
    }

    try {
      logger.info('Dispatching job to n8n Cloud webhook as binary multipart', {
        jobId: payload.jobId,
        url: env.N8N_WEBHOOK_URL,
        filename: payload.originalFilename,
        bytes: payload.imageBuffer.length
      });

      const form = new FormData();
      const filename = payload.originalFilename || 'upload.png';
      const mimeType = payload.mimeType || 'application/octet-stream';

      // n8n Webhook stores multipart files on the binary object using the field name
      form.append('image', payload.imageBuffer, {
        filename,
        contentType: mimeType,
        knownLength: payload.imageBuffer.length
      });
      form.append('job_id', payload.jobId);
      form.append('user_id', payload.userId);
      form.append('input_url', payload.inputUrl);
      form.append('original_filename', filename);
      form.append('callback_url', payload.callbackUrl);
      form.append('timestamp', payload.timestamp);
      form.append('mime_type', mimeType);

      const response = await axios.post(env.N8N_WEBHOOK_URL, form, {
        headers: {
          ...form.getHeaders(),
          'x-n8n-webhook-secret': env.N8N_WEBHOOK_SECRET
        },
        timeout: 120000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      if (response.status < 200 || response.status >= 300) {
        return { accepted: false };
      }

      const extracted = extractN8nOutput(response.data, payload.inputUrl);
      if (extracted.outputUrl) {
        logger.info('n8n webhook returned processed image URL', {
          jobId: payload.jobId,
          outputUrl: extracted.outputUrl
        });
      } else {
        logger.warn('n8n webhook succeeded but response had no image URL; waiting for callback if configured', {
          jobId: payload.jobId,
          responsePreview: JSON.stringify(response.data)?.slice(0, 500)
        });
      }

      return {
        accepted: true,
        outputUrl: extracted.outputUrl,
        outputAssetId: extracted.outputAssetId
      };
    } catch (error: any) {
      logger.error('Failed to trigger n8n Cloud workflow', {
        jobId: payload.jobId,
        error: error.message
      });
      return { accepted: false };
    }
  }

  validateCallbackSecret(secretHeader: string | undefined): boolean {
    return verifyN8nSecret(secretHeader, env.N8N_WEBHOOK_SECRET);
  }
}

export const n8nService = new N8nService();
