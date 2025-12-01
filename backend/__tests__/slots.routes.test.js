const express = require('express');
const request = require('supertest');
const slotsRouter = require('../API/service/slots.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/slots', slotsRouter);
  return app;
};

describe('slots.routes', () => {
  let app;
  beforeAll(() => {
    app = makeApp();
  });

  test('#TODO: generate - returns 30-minute slots within availability window', async () => {
    // #TODO: mock availability for a doctor (e.g., 09:00-12:00)
    // #TODO: GET /slots?doctorId=...&date=... → 200 with slots like 09:00-09:30, ...
  });

  test('#TODO: invalid time - returns 400', async () => {
    // #TODO: request with malformed date/time
    // #TODO: expect 400
  });
});