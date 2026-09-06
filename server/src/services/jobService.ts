import { db } from '../database/supabaseClient.js';
import { usageService } from './usageService.js';
import { cloudinaryService } from '../integrations/cloudinary/cloudinaryService.js';
import { backgroundRemovalService } from '../integrations/background-removal/backgroundRemovalService.js';
import { n8nService, N8nCallbackPayload } from '../integrations/n8n/n8nService.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/apiResponse.js';
import { ProcessingJob, PlanTier } from '../types/index.js';

export class JobService {
  /**
   * Primary entry point for removing an image background
   */
  async processImage(params: {
    userId: string;
    plan: PlanTier;
    buffer: Buffer;
    originalFilename: string;
    mimeType: string;
    size: number;
  }): Promise<ProcessingJob> {
    const { userId, plan, buffer, originalFilename, mimeType, size } = params;

    // 1. Verify usage and credit eligibility
    const eligibility = await usageService.checkEligibility(userId, plan);
    if (!eligibility.allowed) {
      throw new AppError(
        403,
        'USAGE_LIMIT_EXCEEDED',
        eligibility.reason || "You've reached your current processing limit. Upgrade your plan or try again when your limit resets."
      );
    }

    // 2. Reserve usage
    await usageService.reserveUsage(userId, eligibility.useCredit);

    // 3. Upload input image to temporary storage
    let inputUrl = '';
    let inputAssetId = '';
    try {
      const uploadResult = await cloudinaryService.uploadTemporaryImage(buffer, originalFilename, 'originals');
      inputUrl = uploadResult.url;
      inputAssetId = uploadResult.assetId;
    } catch (err: any) {
      await usageService.refundUsage(userId, eligibility.useCredit);
      throw new AppError(500, 'UPLOAD_FAILED', 'Failed to store uploaded image temporarily.');
    }

    // 4. Create initial database job
    const job = await db.createJob({
      userId,
      originalFilename,
      inputAssetId,
      inputUrl,
      status: 'processing',
      fileSize: size,
      mimeType
    });

    const startTime = Date.now();

    // 5. Orchestrate AI processing: n8n Cloud vs Direct Internal Service
    if (n8nService.isEnabled()) {
      const callbackUrl = `${env.FRONTEND_URL ? env.FRONTEND_URL.replace('5173', '5000') : 'http://localhost:5000'}/api/jobs/n8n-callback`;
      const triggered = await n8nService.triggerWorkflow({
        jobId: job.id,
        userId,
        inputUrl,
        originalFilename,
        callbackUrl,
        timestamp: new Date().toISOString()
      });

      if (triggered) {
        // Asynchronous processing handed over to n8n Cloud
        return job;
      }
      logger.info('Falling back to direct background removal service pipeline');
    }

    // Direct synchronous AI execution pipeline
    try {
      logger.info('Running AI background removal pipeline', { jobId: job.id, filename: originalFilename });
      const aiResult = await backgroundRemovalService.removeBackground(buffer, originalFilename);

      // Upload processed transparent PNG to Cloudinary
      const outputUpload = await cloudinaryService.uploadTemporaryImage(
        aiResult.imageBuffer,
        `processed_${originalFilename.replace(/\.[^/.]+$/, '')}.png`,
        'results'
      );

      const durationMs = Date.now() - startTime;
      const completedJob = await db.updateJob(job.id, {
        status: 'completed',
        outputUrl: outputUpload.url,
        outputAssetId: outputUpload.assetId,
        completedAt: new Date().toISOString(),
        durationMs
      });

      return completedJob || { ...job, status: 'completed', outputUrl: outputUpload.url };
    } catch (err: any) {
      logger.error('Background removal failed', { jobId: job.id, error: err.message });
      // Reconcile / refund usage on processing failure
      await usageService.refundUsage(userId, eligibility.useCredit);

      await db.updateJob(job.id, {
        status: 'failed',
        errorCode: 'PROCESSING_FAILED',
        errorMessage: "We couldn't process this image right now. Please try again."
      });

      throw new AppError(500, 'PROCESSING_FAILED', "We couldn't process this image right now. Please try again.");
    }
  }

  /**
   * Callback receiver for n8n Cloud webhook workflow
   */
  async handleN8nCallback(payload: N8nCallbackPayload): Promise<void> {
    const job = await db.getJob(payload.jobId);
    if (!job) {
      throw new AppError(404, 'JOB_NOT_FOUND', `Processing job ${payload.jobId} not found.`);
    }

    if (payload.status === 'completed') {
      await db.updateJob(payload.jobId, {
        status: 'completed',
        outputUrl: payload.outputUrl,
        outputAssetId: payload.outputAssetId,
        completedAt: new Date().toISOString(),
        durationMs: payload.durationMs
      });
      logger.info('Job marked completed by n8n Cloud callback', { jobId: payload.jobId });
    } else {
      await db.updateJob(payload.jobId, {
        status: 'failed',
        errorCode: payload.errorCode || 'N8N_PROCESSING_FAILED',
        errorMessage: payload.errorMessage || "We couldn't process this image right now. Please try again."
      });
      // Refund usage if failed
      await usageService.refundUsage(job.userId, false);
      logger.warn('Job marked failed by n8n Cloud callback', { jobId: payload.jobId, error: payload.errorMessage });
    }
  }

  /**
   * Get job status and verify ownership
   */
  async getJob(jobId: string, userId: string): Promise<ProcessingJob> {
    const job = await db.getJob(jobId);
    if (!job) {
      throw new AppError(404, 'JOB_NOT_FOUND', 'Processing job not found.');
    }
    if (job.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this job.');
    }
    return job;
  }

  /**
   * Get paginated job history for user
   */
  async getUserHistory(userId: string, page: number = 1, limit: number = 10) {
    return db.getUserJobs(userId, page, limit);
  }
}

export const jobService = new JobService();
