const express = require('express');
const request = require('supertest');

// Mock auth middleware to always authenticate as a doctor user
jest.mock('../middlewares/authMiddleware', () => ({
  authMiddleware: (req, _res, next) => {
    req.user = { id: 1, role: 'doctor' };
    next();
  },
  requireRole: () => (_req, _res, next) => next()
}));

// Simple supabase mock with minimal chaining needed for routes
let doctorRecord;
let availabilityList;
let newAvailability;

const buildQueryObject = (table) => {
  const state = { table };
  return {
    select: jest.fn(() => {
      return {
        eq: jest.fn((col, val) => {
          // Doctor single record
          if (table === 'Doctor' && col === 'user_id') {
            return {
              single: async () => ({ data: doctorRecord, error: null })
            };
          }
          // Availability list
          if (table === 'Availability' && col === 'doctor_id') {
            return Promise.resolve({ data: availabilityList, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        }),
        single: async () => ({ data: doctorRecord, error: null })
      };
    }),
    insert: jest.fn((rows) => {
      if (table === 'Availability') {
        newAvailability = {
          availability_id: 99,
          doctor_id: doctorRecord.doctor_id,
          day_of_week: rows[0].day_of_week,
          start_time: rows[0].start_time,
          end_time: rows[0].end_time
        };
        return {
          select: () => ({ single: async () => ({ data: newAvailability, error: null }) })
        };
      }
      if (table === 'Slot') {
        return Promise.resolve({ error: null });
      }
      return Promise.resolve({ error: null });
    })
  };
};

jest.mock('../supabaseClient', () => ({
  from: (table) => buildQueryObject(table)
}));

const availabilityRouter = require('../API/doctors/availability.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/availability', availabilityRouter);
  return app;
};

describe('availability.routes', () => {
  let app;
  beforeEach(() => {
    doctorRecord = { doctor_id: 10 };
    availabilityList = [
      { availability_id: 1, doctor_id: 10, day_of_week: 'Monday', start_time: '09:00', end_time: '11:00' },
      { availability_id: 2, doctor_id: 10, day_of_week: 'Tuesday', start_time: '13:00', end_time: '15:00' }
    ];
    app = makeApp();
  });

  test('GET /availability returns list for doctor (200)', async () => {
    const res = await request(app).get('/availability');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('availability_id');
  });

  test('POST /availability valid window returns 201 and record', async () => {
    const payload = { day_of_week: 'Wednesday', start_time: '08:00', end_time: '10:00' };
    const res = await request(app).post('/availability').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('availability_id');
    expect(res.body.day_of_week).toBe(payload.day_of_week);
  });

  test('POST /availability invalid time (start >= end) returns 400', async () => {
    const payload = { day_of_week: 'Thursday', start_time: '10:00', end_time: '09:00' };
    const res = await request(app).post('/availability').send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});