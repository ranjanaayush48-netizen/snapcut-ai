import { Request, Response, NextFunction } from 'express';
import { db } from '../database/supabaseClient.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AdminController {
  /**
   * GET /api/admin/metrics
   */
  static async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await db.getAdminMetrics();
      return sendSuccess(res, metrics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/users
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const demoUsers = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'alex.creator@example.com',
          displayName: 'Alex Rivers',
          plan: 'pro',
          credits: 92,
          jobsCount: 38,
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'admin@snapcut.ai',
          displayName: 'SnapCut Admin',
          plan: 'business',
          credits: 500,
          jobsCount: 142,
          createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'sarah.store@shopify.in',
          displayName: 'Sarah Khan',
          plan: 'business',
          credits: 440,
          jobsCount: 89,
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
        },
        {
          id: '00000000-0000-0000-0000-000000000004',
          email: 'vikram.design@agency.co',
          displayName: 'Vikram Mehta',
          plan: 'free',
          credits: 3,
          jobsCount: 12,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ];
      return sendSuccess(res, { users: demoUsers });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/jobs
   */
  static async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const recentJobs = [
        {
          id: 'job-98214-a9',
          userEmail: 'sarah.store@shopify.in',
          originalFilename: 'sneaker-product-white.jpg',
          status: 'completed',
          durationMs: 1450,
          createdAt: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          id: 'job-98213-b2',
          userEmail: 'alex.creator@example.com',
          originalFilename: 'portrait_headshot.png',
          status: 'completed',
          durationMs: 1210,
          createdAt: new Date(Date.now() - 42 * 60000).toISOString()
        },
        {
          id: 'job-98212-c5',
          userEmail: 'vikram.design@agency.co',
          originalFilename: 'watch-luxury-reflection.webp',
          status: 'completed',
          durationMs: 1680,
          createdAt: new Date(Date.now() - 75 * 60000).toISOString()
        },
        {
          id: 'job-98211-d1',
          userEmail: 'random.guest@domain.com',
          originalFilename: 'corrupt-payload.bmp',
          status: 'failed',
          errorCode: 'INVALID_IMAGE_FORMAT',
          durationMs: 320,
          createdAt: new Date(Date.now() - 120 * 60000).toISOString()
        }
      ];
      return sendSuccess(res, { jobs: recentJobs });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/payments
   */
  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = [
        {
          id: 'pay-rzp-001',
          orderId: 'order_Nxk92La10s',
          userEmail: 'sarah.store@shopify.in',
          amount: 1499,
          currency: 'INR',
          plan: 'business',
          status: 'captured',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 'pay-rzp-002',
          orderId: 'order_Mzo82Pk59a',
          userEmail: 'alex.creator@example.com',
          amount: 499,
          currency: 'INR',
          plan: 'pro',
          status: 'captured',
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
        },
        {
          id: 'pay-rzp-003',
          orderId: 'order_Kql11Rt40z',
          userEmail: 'alex.creator@example.com',
          amount: 599,
          currency: 'INR',
          plan: 'credits_150',
          status: 'captured',
          createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
        }
      ];
      return sendSuccess(res, { payments });
    } catch (error) {
      next(error);
    }
  }
}
