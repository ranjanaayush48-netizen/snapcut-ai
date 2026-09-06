import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`✨ SnapCut AI Backend API running at http://localhost:${PORT}`);
  logger.info(`🔧 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
  logger.info(`🤖 Background Removal Provider: ${env.BACKGROUND_REMOVAL_PROVIDER}`);
  logger.info(`⚙️ n8n Cloud Webhook: ${env.N8N_WEBHOOK_URL ? 'Configured' : 'Disabled (Direct Pipeline)'}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
