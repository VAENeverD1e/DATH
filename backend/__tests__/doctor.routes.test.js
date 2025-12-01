const express = require('express');
const request = require('supertest');
const doctorRouter = require('../API/doctors/doctor.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/doctors', doctorRouter);
  return app;
};

describe('doctor.routes', () => {
  let app;
  beforeAll(() => {
    app = makeApp();
  });

  test('#TODO: list - returns doctors array', async () => {
    // #TODO: mock supabase.from('doctors').select to return sample list
    // #TODO: GET /doctors → 200 and array length > 0
  });

  test('#TODO: details - returns a doctor by id', async () => {
    // #TODO: mock select.eq('id', ...) to return one doctor
    // #TODO: GET /doctors/:id → 200 with details
  });

  test('#TODO: details - not found returns 404', async () => {
    // #TODO: mock select to return []
    // #TODO: expect 404
  });
});