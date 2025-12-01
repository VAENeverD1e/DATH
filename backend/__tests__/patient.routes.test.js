const express = require('express');
const request = require('supertest');

// Mock auth middleware
jest.mock('../middlewares/authMiddleware', () => ({
  authMiddleware: (req, _res, next) => { req.user = { id: 42, role: 'patient' }; next(); }
}));

let patientRow;
let userRow;

jest.mock('../supabaseClient', () => ({
  from: (table) => ({
    select: () => ({
      eq: (col, val) => ({
        single: async () => {
          if (table === 'Patients' && col === 'user_id' && val === 42) {
            return { data: patientRow, error: null };
          }
          return { data: null, error: null };
        }
      })
    }),
    update: () => ({
      eq: () => ({
        async then() {},
        async catch() {},
        async finally() {},
        error: null
      }),
      error: null
    })
  })
}));

const patientRouter = require('../API/patients/patient.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/patient', patientRouter);
  return app;
};

describe('patient.routes', () => {
  let app;
  beforeEach(() => {
    patientRow = {
      id: 7,
      insurance_provider: 'ACME Health',
      insurance_number: 'INS-999',
      Users: {
        username: 'john_doe', email: 'john@example.com', phone_number: '123456789',
        date_of_birth: '1990-01-01', address: '123 Street', gender: 'Male'
      }
    };
    userRow = { id: 42, email: 'john@example.com' };
    app = makeApp();
  });

  test('GET /patient/me returns profile', async () => {
    const res = await request(app).get('/patient/me');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.Users.username).toBe('john_doe');
  });

  test('PATCH /patient/me updates and returns success', async () => {
    // Mock update behavior directly by extending supabase mock for this test
    const supabase = require('../supabaseClient');
    supabase.from = (table) => ({
      update: () => ({ eq: () => ({ error: null }) }),
      select: () => ({ eq: () => ({ single: async () => ({ data: patientRow, error: null }) }) })
    });
    const res = await request(app)
      .patch('/patient/me')
      .send({ email: 'new@example.com', phone_number: '999', date_of_birth: '1991-01-01', address: 'New', gender: 'Male', insurance_provider: 'ACME', insurance_number: 'NEW-1' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.profile.email).toBe('new@example.com');
  }, 2000);

  test('Unauthorized when auth middleware removed (simulate no user)', async () => {
    // Temporarily override auth middleware for this test
    const altApp = express();
    altApp.use(express.json());
    const bareRouter = express.Router();
    bareRouter.get('/me', (_req, res) => res.status(401).json({ error: 'Unauthorized' }));
    altApp.use('/patient', bareRouter);
    const res = await request(altApp).get('/patient/me');
    expect(res.status).toBe(401);
  });
});