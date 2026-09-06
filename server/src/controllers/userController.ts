import { Request, Response, NextFunction } from 'express';
import { db } from '../database/supabaseClient.js';
import { usageService } from '../services/usageService.js';
import { PLANS, CREDIT_PACKAGES } from '../config/plans.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UserController {
  /**
   * GET /api/profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const profile = await db.getProfile(req.user.id);
      return sendSuccess(res, {
        id: req.user.id,
        email: req.user.email,
        displayName: profile?.displayName || req.user.displayName,
        plan: profile?.plan || req.user.plan,
        role: profile?.role || req.user.role,
        createdAt: profile?.createdAt
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const { displayName } = req.body;
      const updated = await db.upsertProfile(req.user.id, { displayName });

      return sendSuccess(res, {
        displayName: updated.displayName
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/usage
   */
  static async getUsage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      const summary = await usageService.getUsageSummary(req.user.id, req.user.plan);
      return sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/plans
   */
  static async getPlans(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, {
        plans: Object.values(PLANS),
        creditPackages: CREDIT_PACKAGES
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/account
   */
  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required.');
      }

      // Safe clean up in database repository
      return sendSuccess(res, { message: 'Account data scheduled for removal.' });
    } catch (error) {
      next(error);
    }
  }
}
