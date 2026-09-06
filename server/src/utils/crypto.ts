import crypto from 'crypto';

/**
 * Verifies Razorpay payment signature
 * signature = HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return timingSafeEqual(expectedSignature, signature);
}

/**
 * Verifies Razorpay webhook signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return timingSafeEqual(expectedSignature, signature);
}

/**
 * Verifies n8n webhook secret header
 */
export function verifyN8nSecret(incomingSecret: string | undefined, configuredSecret: string): boolean {
  if (!incomingSecret || !configuredSecret) {
    return false;
  }
  return timingSafeEqual(incomingSecret, configuredSecret);
}

function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
