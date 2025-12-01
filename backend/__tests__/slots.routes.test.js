const express = require('express');
const request = require('supertest');

let availRows;
let slotRowsMap;

// Minimal supabase mock following chaining style in route
jest.mock('../supabaseClient', () => ({
  from: (table) => {
    if (table === 'Availability') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({ data: availRows, error: null })
          })
        })
      };
    }
    if (table === 'Slot') {
      return {
        select: () => ({
          eq: (col, availabilityId) => ({
            eq: () => ({
              eq: () => ({ data: slotRowsMap[availabilityId] || [], error: null })
            })
          })
        })
      };
    }
    return { select: () => ({}) };
  }
}));

const slotsRouter = require('../API/service/slots.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/slots', slotsRouter);
  return app;
};

describe('slots.routes', () => {
  let app;
  beforeEach(() => {
    availRows = [
      { availability_id: 10, start_time: '09:00', end_time: '10:00' },
      { availability_id: 11, start_time: '10:00', end_time: '11:00' }
    ];
    slotRowsMap = {
      10: [
        { slot_id: 1, start_time: '09:00:00', end_time: '09:30:00', status: 'available', date: '2025-12-01' },
        { slot_id: 2, start_time: '09:30:00', end_time: '10:00:00', status: 'available', date: '2025-12-01' }
      ],
      11: [
        { slot_id: 3, start_time: '10:00:00', end_time: '10:30:00', status: 'available', date: '2025-12-01' },
        { slot_id: 4, start_time: '10:30:00', end_time: '11:00:00', status: 'available', date: '2025-12-01' }
      ]
    };
    app = makeApp();
  });

  test('GET /slots/available returns combined slots', async () => {
    const res = await request(app).get('/slots/available?doctor_id=55&date=2025-12-01');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(4);
    expect(res.body[0]).toHaveProperty('slot_id');
  });

  test('GET /slots/available missing params returns 400', async () => {
    const res = await request(app).get('/slots/available?doctor_id=55');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});