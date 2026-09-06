import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody, updateProfileSchema } from '../validation/index.js';

const router = Router();

// GET /api/plans (Public)
router.get('/plans', UserController.getPlans);

// GET /api/profile
router.get('/profile', requireAuth, UserController.getProfile);

// PUT /api/profile
router.put('/profile', requireAuth, validateBody(updateProfileSchema), UserController.updateProfile);

// GET /api/usage
router.get('/usage', requireAuth, UserController.getUsage);

// DELETE /api/account
router.delete('/account', requireAuth, UserController.deleteAccount);

export default router;
