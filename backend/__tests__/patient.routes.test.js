const express = require('express');
const request = require('supertest');
const patientRouter = require('../API/patients/patient.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/patient', patientRouter);
  return app;
};

describe('patient.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  test('#TODO: get profile - returns 200 with patient data', async () => {
    // #TODO: mock select on patients table
    // #TODO: GET /patient/profile with Authorization header
  });

  test('#TODO: update profile - valid returns 200', async () => {
    // #TODO: mock update on patients table
    // #TODO: PUT /patient/profile → 200
  });

  test('#TODO: unauthorized - missing token returns 401', async () => {
    // #TODO: request profile without Authorization
    // #TODO: expect 401
  });
});