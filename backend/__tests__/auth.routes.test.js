const express = require('express');
const request = require('supertest');
const authRouter = require('../API/auth/auth.routes.js');

// Minimal app harness to mount the router
const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  return app;
};

describe('auth.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  test('#TODO: register - returns 201 with user id', async () => {
    // #TODO: mock supabase.auth.signUp to return { user: { id: 'u1' } }
    // #TODO: send POST /auth/register with valid payload
    // #TODO: expect 201 and response contains user id
  });

  test('#TODO: register - duplicate email returns 409', async () => {
    // #TODO: mock signUp to return error for duplicate
    // #TODO: expect status 409
  });

  test('#TODO: login - returns 200 with token', async () => {
    // #TODO: mock supabase.auth.signInWithPassword to succeed
    // #TODO: expect 200 and a JWT token in body
  });

  test('#TODO: login - wrong password returns 401', async () => {
    // #TODO: mock signInWithPassword to fail
    // #TODO: expect 401
  });

  test('#TODO: me - requires auth, returns profile', async () => {
    // #TODO: set Authorization: Bearer mock-token
    // #TODO: mock supabase.auth.getUser + users table select
    // #TODO: GET /auth/me → 200 with user profile
  });
});