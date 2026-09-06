import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { jobService } from '../services/jobService.js';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse.js';
import { n8nService } from '../integrations/n8n/n8nService.js';

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
      const secret = req.headers['x-n8n-callback-secret'] as string | undefined;
      if (!n8nService.validateCallbackSecret(secret)) {
        return sendError(res, 403, 'INVALID_CALLBACK_SECRET', 'Invalid n8n callback authentication secret.');
      }

      const { job_id, status, output_url, output_asset_id, error_code, error_message, duration_ms } = req.body;

      await jobService.handleN8nCallback({
        jobId: job_id,
        status,
        outputUrl: output_url,
        outputAssetId: output_asset_id,
        errorCode: error_code,
        errorMessage: error_message,
        durationMs: duration_ms
      });

      return sendSuccess(res, { received: true, jobId: job_id });
    } catch (error) {
      next(error);
    }
  }
}
