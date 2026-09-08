export type PlanTier = 'free' | 'pro' | 'business';
export type UserRole = 'user' | 'admin';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentStatus = 'created' | 'captured' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  plan: PlanTier;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt?: number;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  plan: PlanTier;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingJob {
  id: string;
  userId: string;
  originalFilename: string;
  inputAssetId?: string;
  outputAssetId?: string;
  inputUrl: string;
  outputUrl?: string;
  providerJobId?: string;
  status: JobStatus;
  errorCode?: string;
  errorMessage?: string;
  fileSize?: number;
  mimeType?: string;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  date: string;
  dailyCount: number;
  creditsUsed: number;
  updatedAt: string;
}

export interface CreditRecord {
  id: string;
  userId: string;
  balance: number;
  updatedAt: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  plan?: PlanTier;
  creditsAdded?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceINR: number;
  priceFormatted: string;
  dailyFreeLimit: number;
  monthlyCredits: number;
  maxFileSizeMB: number;
  features: string[];
  popular?: boolean;
}
