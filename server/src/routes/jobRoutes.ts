import { Router } from 'express';
import { JobController, uploadSingleImage } from '../controllers/jobController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { backgroundRemovalLimiter } from '../middleware/rateLimiter.js';
import { validateBody, n8nCallbackSchema } from '../validation/index.js';

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

// POST /api/jobs/n8n-callback (Webhook from n8n Cloud)
router.post(
  '/jobs/n8n-callback',
  validateBody(n8nCallbackSchema),
  JobController.handleN8nCallback
);

export default router;
