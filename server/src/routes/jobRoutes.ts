import { Router, Request, Response, NextFunction } from 'express';
import { JobController, uploadSingleImage } from '../controllers/jobController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { backgroundRemovalLimiter } from '../middleware/rateLimiter.js';
import { n8nCallbackSchema } from '../validation/index.js';
import { sendError } from '../utils/apiResponse.js';

const router = Router();

// POST /api/remove-background
router.post(
  '/remove-background',
  backgroundRemovalLimiter,
  requireAuth,
  uploadSingleImage,
  JobController.removeBackground
);

// GET /api/jobs/:id
router.get('/jobs/:id', requireAuth, JobController.getJob);

// GET /api/history
router.get('/history', requireAuth, JobController.getUserHistory);

const validateN8nCallback = (req: Request, res: Response, next: NextFunction) => {
  const merged = { ...(req.query || {}), ...(req.body || {}) };
  const result = n8nCallbackSchema.safeParse(merged);
  if (!result.success) {
    const issue = result.error.issues[0];
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      issue ? issue.message : 'Invalid n8n callback payload',
      result.error.flatten()
    );
  }
  req.body = result.data;
  next();
};

// POST /api/jobs/n8n-callback (Webhook from n8n Cloud)
router.post(
  '/jobs/n8n-callback',
  validateN8nCallback,
  JobController.handleN8nCallback
);

export default router;
