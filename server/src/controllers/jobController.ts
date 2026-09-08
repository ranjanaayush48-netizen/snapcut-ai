import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { jobService } from '../services/jobService.js';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse.js';
import { n8nService } from '../integrations/n8n/n8nService.js';
import { logger } from '../utils/logger.js';

// Configure Multer for in-memory file uploads with strict 10MB limit and MIME validation
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'INVALID_FILE_TYPE', 'Please upload a JPG, PNG, or WEBP image under 10 MB.'));
    }
  }
});

export const uploadSingleImage = upload.single('image');

export class JobController {
  /**
   * POST /api/remove-background
   */
  static async removeBackground(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return sendError(res, 400, 'NO_FILE_PROVIDED', 'Please upload a JPG, PNG, or WEBP image under 10 MB.');
      }

      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const job = await jobService.processImage({
        userId: req.user.id,
        plan: req.user.plan,
        buffer: req.file.buffer,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      });

      return sendSuccess(res, {
        jobId: job.id,
        status: job.status,
        originalFilename: job.originalFilename,
        inputUrl: job.inputUrl,
        outputUrl: job.outputUrl,
        durationMs: job.durationMs,
        createdAt: job.createdAt,
        completedAt: job.completedAt
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/jobs/:id
   */
  static async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const job = await jobService.getJob(req.params.id, req.user.id);
      return sendSuccess(res, job);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/history
   */
  static async getUserHistory(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const result = await jobService.getUserHistory(req.user.id, page, limit);
      return sendSuccess(res, {
        items: result.items,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/jobs/n8n-callback
   */
  static async handleN8nCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const env = await import('../config/env.js').then(m => m.env);
      const secretHeader =
        (req.headers['x-n8n-callback-secret'] as string | undefined) ||
        (req.headers['x-n8n-webhook-secret'] as string | undefined) ||
        (req.query.secret as string | undefined);

      const secretValid = n8nService.validateCallbackSecret(secretHeader);
      const relaxedDevMode = !secretValid && env.NODE_ENV !== 'production';
      if (!secretValid && !relaxedDevMode) {
        return sendError(res, 403, 'INVALID_CALLBACK_SECRET', 'Invalid n8n callback authentication secret.');
      }
      if (relaxedDevMode) {
        logger.info('[n8n] Callback secret not provided; accepting in non-production dev mode (set x-n8n-webhook-secret header in production)');
      }

      const body = req.body || {};
      const qs = req.query || {};

      const jobId =
        (body.job_id as string) ||
        (body.jobId as string) ||
        (qs.job_id as string) ||
        (qs.jobId as string) ||
        (body.jobID as string);

      const rawOutputUrl =
        (body.secure_url as string) ||
        (body.url as string) ||
        (body.output_url as string) ||
        (body.outputUrl as string) ||
        (body.image_url as string) ||
        (body.processed_url as string);

      const outputAssetId =
        (body.output_asset_id as string) ||
        (body.outputAssetId as string) ||
        (body.public_id as string) ||
        (body.asset_id as string);

      const { extractN8nOutput } = await import('../integrations/n8n/n8nService.js');
      const extracted = extractN8nOutput(body);
      const outputUrl = rawOutputUrl || extracted.outputUrl;

      const errorCode =
        (body.error_code as string) ||
        (body.errorCode as string) ||
        (body.code as string);

      const errorMessage =
        (body.error_message as string) ||
        (body.errorMessage as string) ||
        (body.message as string) ||
        (body.error as string);

      const rawDuration =
        (body.duration_ms as number) ??
        (body.durationMs as number) ??
        (body.duration as number);
      const durationMs = typeof rawDuration === 'number' ? rawDuration : undefined;

      let status: 'completed' | 'failed';
      if (body.status === 'completed' || body.status === 'failed') {
        status = body.status;
      } else if (outputUrl) {
        status = 'completed';
      } else if (errorCode || errorMessage) {
        status = 'failed';
      } else {
        return sendError(
          res,
          400,
          'INVALID_CALLBACK_PAYLOAD',
          'Missing status, or provide url/output_url on success, or error_code/error_message on failure.'
        );
      }

      logger.info(`[n8n] Callback received → jobId=${jobId} status=${status} outputUrl=${outputUrl || '—'}`);

      await jobService.handleN8nCallback({
        jobId,
        status,
        outputUrl,
        outputAssetId: outputAssetId || extracted.outputAssetId,
        errorCode,
        errorMessage,
        durationMs
      });

      return sendSuccess(res, { received: true, jobId, status });
    } catch (error: any) {
      logger.error('[n8n] Callback handler failed', { error: error?.message, stack: error?.stack });
      next(error);
    }
  }
}
