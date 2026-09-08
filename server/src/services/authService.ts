import { supabase, db } from '../database/supabaseClient.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/apiResponse.js';
import { AuthUser, AuthSession } from '../types/index.js';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  verifySessionToken
} from '../utils/crypto.js';

export interface SignupParams {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginParams {
  email: string;
  password?: string;
}

export class AuthService {
  /**
   * Register a new user account with initial complimentary credits
   */
  async signup(params: SignupParams): Promise<AuthSession> {
    const { email, password, displayName = 'Creator' } = params;
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new AppError(400, 'INVALID_EMAIL', 'Please provide a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new AppError(400, 'WEAK_PASSWORD', 'Password must be at least 6 characters long.');
    }

    // 1. Live Supabase Authentication Provider
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: displayName }
          }
        });

        if (error) {
          logger.warn('Supabase signup error', { error: error.message });
          throw new AppError(400, 'SIGNUP_FAILED', error.message);
        }

        const userId = data.user?.id;
        if (!userId) {
          throw new AppError(500, 'AUTH_ERROR', 'User creation failed.');
        }

        // Initialize profile and credits
        await db.upsertProfile(userId, { displayName, plan: 'free', role: 'user' });
        await db.setCredits(userId, 5);

        const token = data.session?.access_token || generateSessionToken(userId, env.SUPABASE_JWT_SECRET);
        return {
          user: {
            id: userId,
            email: normalizedEmail,
            displayName,
            role: 'user',
            plan: 'free'
          },
          token
        };
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        logger.error('Supabase signup unexpected failure', { error: err.message });
        // Fallback to local store if Supabase network fails
      }
    }

    // 2. High-Fidelity Local Development Auth Engine
    const existing = await db.findUserCredentialByEmail(normalizedEmail);
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists. Please log in.');
    }

    const passwordHash = hashPassword(password);
    const cred = await db.createUserCredential(normalizedEmail, passwordHash, displayName, 'user', 'free');
    const token = generateSessionToken(cred.id, env.SUPABASE_JWT_SECRET);

    logger.info('Registered new user via local auth service', { userId: cred.id, email: normalizedEmail });

    return {
      user: {
        id: cred.id,
        email: cred.email,
        displayName: cred.displayName,
        role: cred.role,
        plan: cred.plan
      },
      token
    };
  }

  /**
   * Authenticate user credentials and return an authorized session token
   */
  async login(params: LoginParams): Promise<AuthSession> {
    const { email, password } = params;
    const normalizedEmail = email.toLowerCase().trim();

    // Instant demo testing profiles
    if (normalizedEmail === 'demo@snapcut.ai' || normalizedEmail === 'user@snapcut.ai') {
      const demoUserId = '00000000-0000-0000-0000-000000000001';
      const profile = await db.getProfile(demoUserId);
      return {
        user: {
          id: demoUserId,
          email: 'demo@snapcut.ai',
          displayName: profile?.displayName || 'Alex Rivers',
          role: 'user',
          plan: profile?.plan || 'free'
        },
        token: generateSessionToken(demoUserId, env.SUPABASE_JWT_SECRET)
      };
    }

    if (normalizedEmail === 'admin@snapcut.ai') {
      const adminUserId = '00000000-0000-0000-0000-000000000002';
      const profile = await db.getProfile(adminUserId);
      return {
        user: {
          id: adminUserId,
          email: 'admin@snapcut.ai',
          displayName: profile?.displayName || 'SnapCut Admin',
          role: 'admin',
          plan: profile?.plan || 'business'
        },
        token: generateSessionToken(adminUserId, env.SUPABASE_JWT_SECRET)
      };
    }

    // 1. Live Supabase Authentication Provider
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

        if (error) {
          logger.warn('Supabase signin error', { error: error.message });
          throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
        }

        const userId = data.user.id;
        const profile = await db.getProfile(userId);
        return {
          user: {
            id: userId,
            email: normalizedEmail,
            displayName: profile?.displayName || data.user.user_metadata?.full_name || 'User',
            role: profile?.role || 'user',
            plan: profile?.plan || 'free'
          },
          token: data.session.access_token
        };
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        logger.error('Supabase signin unexpected failure, checking local store', { error: err.message });
      }
    }

    // 2. High-Fidelity Local Development Auth Engine
    const cred = await db.findUserCredentialByEmail(normalizedEmail);
    if (!cred) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    if (password && !verifyPassword(password, cred.passwordHash)) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const profile = await db.getProfile(cred.id);
    const token = generateSessionToken(cred.id, env.SUPABASE_JWT_SECRET);

    logger.info('User logged in via local auth service', { userId: cred.id, email: normalizedEmail });

    return {
      user: {
        id: cred.id,
        email: cred.email,
        displayName: profile?.displayName || cred.displayName,
        role: profile?.role || cred.role,
        plan: profile?.plan || cred.plan
      },
      token
    };
  }

  /**
   * Verifies an incoming authorization token (Supabase JWT, HMAC session token, or demo token)
   */
  async verifyToken(token: string): Promise<AuthUser | null> {
    if (!token) return null;

    // A. Demo tokens
    if (token === 'demo-token-user' || token.startsWith('demo-token-user')) {
      const demoUserId = '00000000-0000-0000-0000-000000000001';
      const profile = await db.getProfile(demoUserId);
      return {
        id: demoUserId,
        email: 'demo@snapcut.ai',
        displayName: profile?.displayName || 'Alex Rivers',
        role: 'user',
        plan: profile?.plan || 'free'
      };
    }

    if (token === 'demo-token-admin' || token.startsWith('demo-token-admin')) {
      const adminUserId = '00000000-0000-0000-0000-000000000002';
      const profile = await db.getProfile(adminUserId);
      return {
        id: adminUserId,
        email: 'admin@snapcut.ai',
        displayName: profile?.displayName || 'SnapCut Admin',
        role: 'admin',
        plan: profile?.plan || 'business'
      };
    }

    // B. HMAC session token (sct_...)
    if (token.startsWith('sct_')) {
      const userId = verifySessionToken(token, env.SUPABASE_JWT_SECRET);
      if (!userId) return null;

      const profile = await db.getProfile(userId);
      const cred = await db.findUserCredentialById(userId);

      return {
        id: userId,
        email: cred?.email || (profile?.role === 'admin' ? 'admin@snapcut.ai' : 'user@snapcut.ai'),
        displayName: profile?.displayName || cred?.displayName || 'User',
        role: profile?.role || cred?.role || 'user',
        plan: profile?.plan || cred?.plan || 'free'
      };
    }

    // C. Supabase JWT verification
    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;

        const profile = await db.getProfile(user.id);
        return {
          id: user.id,
          email: user.email || '',
          displayName: profile?.displayName || user.user_metadata?.full_name || 'User',
          role: profile?.role || 'user',
          plan: profile?.plan || 'free'
        };
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Request password reset link / instructions
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${env.FRONTEND_URL}/reset-password`
        });
      } catch (err: any) {
        logger.warn('Supabase resetPasswordForEmail error', { error: err.message });
      }
    }

    // Always return success message to avoid email enumeration attacks
    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been dispatched.'
    };
  }

  /**
   * Update account password
   */
  async resetPassword(tokenOrUserId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.length < 6) {
      throw new AppError(400, 'WEAK_PASSWORD', 'Password must be at least 6 characters long.');
    }

    if (supabase) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
        return { success: true, message: 'Password updated successfully.' };
      } catch (err: any) {
        logger.warn('Supabase updateUser error', { error: err.message });
      }
    }

    const passwordHash = hashPassword(newPassword);
    // If token passed, resolve user id
    let userId = tokenOrUserId;
    if (tokenOrUserId.startsWith('sct_')) {
      const resolved = verifySessionToken(tokenOrUserId, env.SUPABASE_JWT_SECRET);
      if (resolved) userId = resolved;
    }

    await db.updateUserPassword(userId, passwordHash);
    return { success: true, message: 'Password updated successfully.' };
  }
}

export const authService = new AuthService();
