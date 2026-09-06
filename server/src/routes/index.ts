import { Router } from 'express';
import jobRoutes from './jobRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import { sendSuccess } from '../utils/apiResponse.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  return sendSuccess(res, {
    service: 'SnapCut AI API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

apiRouter.use('/', jobRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/', userRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
