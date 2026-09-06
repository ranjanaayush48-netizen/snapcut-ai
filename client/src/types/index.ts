export type PlanTier = 'free' | 'pro' | 'business';
export type UserRole = 'user' | 'admin';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  plan: PlanTier;
}

export interface ProcessingJob {
  id: string;
  userId: string;
  originalFilename: string;
  inputUrl: string;
  outputUrl?: string;
  status: JobStatus;
  errorCode?: string;
  errorMessage?: string;
  fileSize?: number;
  durationMs?: number;
  createdAt: string;
  completedAt?: string;
}

export interface UserUsage {
  plan: PlanTier;
  planName: string;
  dailyUsed: number;
  dailyLimit: number;
  remainingDaily: number;
  creditBalance: number;
  maxFileSizeMB: number;
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

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceINR: number;
  priceFormatted: string;
  popular?: boolean;
}

export interface PaymentItem {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  plan?: string;
  creditsAdded?: number;
  createdAt: string;
}
