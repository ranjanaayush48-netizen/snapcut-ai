import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin routes with authentication & admin role guard
router.use(requireAuth, requireAdmin);

// GET /api/admin/metrics
router.get('/metrics', AdminController.getMetrics);

// GET /api/admin/users
router.get('/users', AdminController.getUsers);

// GET /api/admin/jobs
router.get('/jobs', AdminController.getJobs);

// GET /api/admin/payments
router.get('/payments', AdminController.getPayments);

export default router;
