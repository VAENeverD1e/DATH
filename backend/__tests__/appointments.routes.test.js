const express = require('express');
const request = require('supertest');
const appointmentsRouter = require('../API/service/appointments.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/appointments', appointmentsRouter);
  return app;
};

describe('appointments.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  test('#TODO: create - returns 201 for valid booking', async () => {
    // #TODO: mock supabase.from('appointments').insert to succeed
    // #TODO: POST /appointments with doctorId, patientId, slot → 201
  });

  test('#TODO: create - slot conflict returns 409', async () => {
    // #TODO: mock insert to fail due to unique/overlap
    // #TODO: expect 409
  });

  test('#TODO: list - returns patient appointments', async () => {
    // #TODO: set Authorization header
    // #TODO: mock select with filtering by userId
    // #TODO: GET /appointments?scope=patient → 200
  });
});