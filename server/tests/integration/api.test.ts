import request from 'supertest';
import app from '../../src/app.js';

describe('SnapCut AI REST API Integration Tests', () => {
  it('GET /api/health returns 200 with service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('SnapCut AI API');
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /api/plans returns public plan pricing and credit packages', async () => {
    const res = await request(app).get('/api/plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.plans.length).toBe(3);
    expect(res.body.data.creditPackages.length).toBe(3);
  });

  it('POST /api/remove-background requires authentication', async () => {
    const res = await request(app).post('/api/remove-background');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/history requires authentication', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/admin/metrics rejects non-admin users with 403', async () => {
    // Demo user token
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', 'Bearer demo-token-user');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_ADMIN_ONLY');
  });

  it('GET /api/admin/metrics permits admin user', async () => {
    // Demo admin token
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', 'Bearer demo-token-admin');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeGreaterThan(0);
  });

  it('POST /api/remove-background rejects request without image file', async () => {
    const res = await request(app)
      .post('/api/remove-background')
      .set('Authorization', 'Bearer demo-token-user');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NO_FILE_PROVIDED');
  });
});
