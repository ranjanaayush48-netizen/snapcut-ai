import crypto from 'crypto';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../../src/utils/crypto.js';

describe('Razorpay Cryptographic Signature Verification', () => {
  const secret = 'test_razorpay_secret_key_123';
  const orderId = 'order_9A33XzjWaL';
  const paymentId = 'pay_29GAjs72jK';

  it('should successfully verify a valid payment signature', () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = verifyRazorpaySignature(orderId, paymentId, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it('should reject a tampered payment signature', () => {
    const fakeSignature = 'bad0000000000000000000000000000000000000000000000000000000000000';
    const isValid = verifyRazorpaySignature(orderId, paymentId, fakeSignature, secret);
    expect(isValid).toBe(false);
  });

  it('should reject when orderId or paymentId is altered', () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = verifyRazorpaySignature('altered_order_id', paymentId, validSignature, secret);
    expect(isValid).toBe(false);
  });

  it('should successfully verify a valid webhook signature', () => {
    const rawBody = JSON.stringify({ event: 'payment.captured', entity: { id: paymentId } });
    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, secret);
    expect(isValid).toBe(true);
  });
});
