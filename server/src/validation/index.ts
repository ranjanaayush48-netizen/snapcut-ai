import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const createOrderSchema = z.object({
  itemType: z.enum(['plan', 'credits']),
  itemId: z.string().min(1, 'Item identifier is required')
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  itemType: z.enum(['plan', 'credits']),
  itemId: z.string().min(1)
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50)
});

export const n8nCallbackSchema = z.object({
  job_id: z.string().min(1),
  status: z.enum(['completed', 'failed']),
  output_url: z.string().optional(),
  output_asset_id: z.string().optional(),
  error_code: z.string().optional(),
  error_message: z.string().optional(),
  duration_ms: z.number().optional()
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        issue ? issue.message : 'Invalid request payload',
        result.error.flatten()
      );
    }
    req.body = result.data;
    next();
  };
};
