const express = require('express');
const request = require('supertest');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware.js');

const makeApp = () => {
  const app = express();
  app.get('/protected', authMiddleware, requireRole(['admin']), (req, res) => {
    res.json({ ok: true, user: req.user });
  });
  return app;
};

describe('authMiddleware', () => {
  test('rejects missing token', async () => {
    const app = makeApp();
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  test('accepts valid token and role', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer mock-token');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});