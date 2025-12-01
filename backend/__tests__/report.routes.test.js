const express = require('express');
const request = require('supertest');
const reportRouter = require('../API/doctors/report.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/reports', reportRouter);
  return app;
};

describe('report.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  test('#TODO: create report - returns 201', async () => {
    // #TODO: mock insert into reports table
    // #TODO: POST /reports with appointmentId, content → 201
  });

  test('#TODO: invalid payload - returns 400', async () => {
    // #TODO: send malformed payload
    // #TODO: expect 400
  });
});