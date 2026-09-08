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

/**
 * Secure password hashing using PBKDF2 with SHA-512
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Validates a plaintext password against a stored PBKDF2 hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return timingSafeEqual(derivedKey, key);
  } catch {
    return false;
  }
}

/**
 * Generates an HMAC-signed session token containing userId and expiration timestamp
 */
export function generateSessionToken(userId: string, secret: string = 'snapcut-auth-secret'): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `sct_${payload}.${signature}`;
}

/**
 * Validates session token and returns userId if valid
 */
export function verifySessionToken(token: string, secret: string = 'snapcut-auth-secret'): string | null {
  try {
    if (!token.startsWith('sct_')) return null;
    const raw = token.slice(4);
    const [payload, signature] = raw.split('.');
    if (!payload || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (!timingSafeEqual(expectedSig, signature)) return null;

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (parsed.expiresAt < Date.now()) return null;

    return parsed.userId;
  } catch {
    return null;
  }
}

