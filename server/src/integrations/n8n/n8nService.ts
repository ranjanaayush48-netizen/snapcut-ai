import axios from 'axios';
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

class N8nService {
  /**
   * Check if n8n Cloud is configured
   */
  isEnabled(): boolean {
    return Boolean(env.N8N_WEBHOOK_URL && env.N8N_WEBHOOK_URL.startsWith('http'));
  }

  /**
   * Dispatches an image processing job payload to n8n Cloud
   */
  async triggerWorkflow(payload: N8nJobPayload): Promise<boolean> {
    if (!this.isEnabled()) {
      logger.info('n8n Cloud webhook URL not set; will process job directly via internal pipeline');
      return false;
    }

    try {
      logger.info('Dispatching job to n8n Cloud webhook', { jobId: payload.jobId, url: env.N8N_WEBHOOK_URL });
      const response = await axios.post(
        env.N8N_WEBHOOK_URL,
        {
          job_id: payload.jobId,
          user_id: payload.userId,
          input_url: payload.inputUrl,
          original_filename: payload.originalFilename,
          callback_url: payload.callbackUrl,
          timestamp: payload.timestamp
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-n8n-webhook-secret': env.N8N_WEBHOOK_SECRET
          },
          timeout: 10000
        }
      );

      return response.status >= 200 && response.status < 300;
    } catch (error: any) {
      logger.error('Failed to trigger n8n Cloud workflow', {
        jobId: payload.jobId,
        error: error.message
      });
      // Return false so caller can fallback to direct processing
      return false;
    }
  }

  /**
   * Validates authentication of incoming n8n callback
   */
  validateCallbackSecret(secretHeader: string | undefined): boolean {
    return verifyN8nSecret(secretHeader, env.N8N_WEBHOOK_SECRET);
  }
}

export const n8nService = new N8nService();
