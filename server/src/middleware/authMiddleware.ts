import { Request, Response, NextFunction } from 'express';
import { supabase, db } from '../database/supabaseClient.js';
import { AppError } from '../utils/apiResponse.js';
import { AuthUser } from '../types/index.js';

// Extend Express Request to include typed user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authentication token.');
    }

    const token = authHeader.split(' ')[1];

    // Check for demo token for local development & immediate testing
    if (token.startsWith('demo-token-')) {
      const isDemoAdmin = token.includes('admin');
      const userId = isDemoAdmin
        ? '00000000-0000-0000-0000-000000000002'
        : '00000000-0000-0000-0000-000000000001';

      const profile = await db.getProfile(userId);
      req.user = {
        id: userId,
        email: isDemoAdmin ? 'admin@snapcut.ai' : 'demo@snapcut.ai',
        displayName: profile?.displayName || (isDemoAdmin ? 'SnapCut Admin' : 'Alex Rivers'),
        role: profile?.role || (isDemoAdmin ? 'admin' : 'user'),
        plan: profile?.plan || (isDemoAdmin ? 'business' : 'free')
      };
      return next();
    }

    // Verify token with live Supabase if available
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired session. Please log in again.');
      }

      const profile = await db.getProfile(user.id);
      req.user = {
        id: user.id,
        email: user.email || '',
        displayName: profile?.displayName || user.user_metadata?.full_name || 'User',
        role: profile?.role || 'user',
        plan: profile?.plan || 'free'
      };
      return next();
    }

    // Fallback development default user
    const defaultUserId = '00000000-0000-0000-0000-000000000001';
    const profile = await db.getProfile(defaultUserId);
    req.user = {
      id: defaultUserId,
      email: 'demo@snapcut.ai',
      displayName: profile?.displayName || 'Alex Rivers',
      role: profile?.role || 'user',
      plan: profile?.plan || 'free'
    };
    return next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError(403, 'FORBIDDEN_ADMIN_ONLY', 'Administrator privileges required.'));
  }
  next();
}
