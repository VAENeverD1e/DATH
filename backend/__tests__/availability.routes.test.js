const express = require('express');
const request = require('supertest');
const availabilityRouter = require('../API/doctors/availability.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/availability', availabilityRouter);
  return app;
};

describe('availability.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  test('#TODO: set availability - returns 200 for valid window', async () => {
    // #TODO: mock insert/update into availability table
    // #TODO: POST /availability with start/end → 200
  });

  test('#TODO: overlaps existing - returns 409', async () => {
    // #TODO: mock to detect overlap
    // #TODO: expect 409
  });
});