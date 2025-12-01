const express = require('express');
const request = require('supertest');

// Mock auth middleware for doctor role
jest.mock('../middlewares/authMiddleware', () => ({
  authMiddleware: (req, _res, next) => { req.user = { id: 5, role: 'doctor' }; next(); },
  requireRole: () => (_req, _res, next) => next()
}));

let doctorRow;
let appointmentRow;
let existingReport;
let insertedReport;

jest.mock('../supabaseClient', () => ({
  from: (table) => {
    let filters = {};
    return {
      select: () => ({
        eq: (col, val) => {
          filters[col] = val;
          return {
            eq: (col2, val2) => {
              filters[col2] = val2;
              return {
                single: async () => {
                  // Doctor
                  if (table === 'Doctor') {
                    if (filters.user_id === 5 && doctorRow) return { data: doctorRow, error: null };
                    return { data: null, error: { message: 'not found' } };
                  }
                  // Appointment (must match appointment_id and doctor_id)
                  if (table === 'Appointment') {
                    if (appointmentRow && filters.appointment_id === appointmentRow.appointment_id && filters.doctor_id === appointmentRow.doctor_id) {
                      return { data: appointmentRow, error: null };
                    }
                    return { data: null, error: { message: 'not found' } };
                  }
                  // Medical_Report existing check (only filters.appointment_id)
                  if (table === 'Medical_Report') {
                    if (typeof filters.appointment_id !== 'undefined') {
                      return { data: existingReport, error: null };
                    }
                  }
                  return { data: null, error: null };
                }
              };
            },
            single: async () => {
              // Case where only one eq used (Doctor with user_id or Medical_Report)
              if (table === 'Doctor') {
                if (filters.user_id === 5 && doctorRow) return { data: doctorRow, error: null };
                return { data: null, error: { message: 'not found' } };
              }
              if (table === 'Medical_Report') {
                return { data: existingReport, error: null };
              }
              return { data: null, error: null };
            }
          };
        }
      }),
      insert: (rows) => {
        if (table === 'Medical_Report') {
          insertedReport = { report_id: 11, appointment_id: rows[0].appointment_id, diagnosis: rows[0].diagnosis, treatment_plan: rows[0].treatment_plan };
          return { select: () => ({ single: async () => ({ data: insertedReport, error: null }) }) };
        }
        if (table === 'Appointment') {
          return { eq: () => ({}) };
        }
        return {};
      },
      update: () => ({ eq: () => ({}) })
    };
  }
}));

const reportRouter = require('../API/doctors/report.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/reports', reportRouter);
  return app;
};

describe('report.routes', () => {
  let app;
  beforeEach(() => {
    doctorRow = { doctor_id: 9 };
    appointmentRow = { appointment_id: 123, doctor_id: 9 };
    existingReport = null;
    insertedReport = null;
    app = makeApp();
  });

  test('POST /reports creates new report (201)', async () => {
    const res = await request(app)
      .post('/reports')
      .send({ appointment_id: 123, diagnosis: 'Flu', treatment_plan: 'Rest' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('report_id');
    expect(res.body.diagnosis).toBe('Flu');
  });

  test('POST /reports when report exists returns 400', async () => {
    existingReport = { report_id: 77, appointment_id: 123 };
    const res = await request(app)
      .post('/reports')
      .send({ appointment_id: 123, diagnosis: 'Flu', treatment_plan: 'Rest' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /reports invalid appointment returns 403', async () => {
    appointmentRow = null; // Simulate not found or unauthorized
    const res = await request(app)
      .post('/reports')
      .send({ appointment_id: 999, diagnosis: 'X', treatment_plan: 'Y' });
    expect(res.status).toBe(403);
  });
});