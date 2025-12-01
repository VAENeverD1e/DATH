const express = require('express');
const request = require('supertest');
const departmentsRouter = require('../API/admin/departments.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/departments', departmentsRouter);
  return app;
};

describe('departments.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  test('#TODO: create department - returns 201', async () => {
    // #TODO: mock insert into departments table
    // #TODO: POST /departments → 201
  });

  test('#TODO: duplicate name - returns 409', async () => {
    // #TODO: mock insert to fail on duplicate
    // #TODO: expect 409
  });

  test('#TODO: list - returns all departments', async () => {
    // #TODO: mock select
    // #TODO: GET /departments → 200
  });
});