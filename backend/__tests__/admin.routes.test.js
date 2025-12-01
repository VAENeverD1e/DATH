const express = require('express');
const request = require('supertest');
const adminRouter = require('../API/admin/admin.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/admin', adminRouter);
  return app;
};

describe('admin.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  test('#TODO: add doctor - admin role required', async () => {
    // #TODO: set Authorization with admin role (mock verify → role: 'admin')
    // #TODO: mock insert into doctors table
    // #TODO: POST /admin/doctors → 201
  });

  test('#TODO: add doctor - non-admin returns 403', async () => {
    // #TODO: override jsonwebtoken.verify to return role: 'user'
    // #TODO: expect 403
  });

  test('#TODO: list doctors - returns paginated list', async () => {
    // #TODO: mock select with limit/offset
    // #TODO: GET /admin/doctors → 200
  });
});