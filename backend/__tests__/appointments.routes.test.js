const express = require('express');
const request = require('supertest');

const createQueueController = () => {
  const queues = new Map();
  return {
    reset: () => queues.clear(),
    setTables: (tableMap) => {
      queues.clear();
      Object.entries(tableMap).forEach(([table, builders]) => {
        queues.set(table, [...builders]);
      });
    },
    next: (table) => {
      const queue = queues.get(table) || [];
      if (!queue.length) {
        throw new Error(`No mock query queued for table: ${table}`);
      }
      return queue.shift();
    },
  };
};

const createQueryBuilder = (options = {}) => {
  const {
    result = { data: [], error: null },
    singleResult,
  } = options;

  const builder = {
    _result: result,
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    ilike: jest.fn(() => builder),
    order: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    single: jest.fn(() => Promise.resolve(singleResult ?? builder._result)),
    then: (resolve, reject) => Promise.resolve(builder._result).then(resolve, reject),
    catch: (reject) => Promise.resolve(builder._result).catch(reject),
  };
  return builder;
};

const queueController = createQueueController();

const supabaseMock = {
  from: jest.fn((table) => queueController.next(table)),
  __setMockTables: (tableMap) => queueController.setTables(tableMap),
  __reset: () => queueController.reset(),
};

jest.mock('../supabaseClient.js', () => supabaseMock);

const jwtVerifyMock = jest.fn().mockReturnValue({ userId: 'user-1', role: 'patient' });
jest.mock('jsonwebtoken', () => ({
  verify: (...args) => jwtVerifyMock(...args),
}));

const supabase = require('../supabaseClient.js');
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

  afterEach(() => {
    jest.clearAllMocks();
    supabase.__reset();
    jwtVerifyMock.mockReturnValue({ userId: 'user-1', role: 'patient' });
  });

  const authHeader = { Authorization: 'Bearer token' };

  test('create - returns 201 for valid booking', async () => {
    const slotInfo = {
      slot_id: 'slot-1',
      status: 'available',
      availability_id: 'avail-1',
      start_time: '09:00',
      end_time: '09:30',
    };
    const appointmentRecord = {
      appointment_id: 'app-1',
      patient_id: 'patient-1',
      doctor_id: 'doc-1',
      slot_id: 'slot-1',
      status: 'Pending',
      reason_for_visit: 'Checkup',
    };

    supabase.__setMockTables({
      Patients: [
        createQueryBuilder({ singleResult: { data: { id: 'patient-1' }, error: null } }),
      ],
      Slot: [
        createQueryBuilder({ singleResult: { data: slotInfo, error: null } }),
        createQueryBuilder({ result: { data: [], error: null } }),
      ],
      Appointment: [
        createQueryBuilder({ result: { data: [], error: null } }),
        createQueryBuilder({ singleResult: { data: appointmentRecord, error: null } }),
      ],
    });

    const res = await request(app)
      .post('/appointments')
      .set(authHeader)
      .send({ doctor_id: 'doc-1', slot_id: 'slot-1', reason_for_visit: 'Checkup', duration: 30 });

    expect(res.status).toBe(201);
    expect(res.body.appointment).toMatchObject({ appointment_id: 'app-1', slot_id: 'slot-1' });
  });

  test('create - slot conflict returns 400', async () => {
    supabase.__setMockTables({
      Patients: [
        createQueryBuilder({ singleResult: { data: { id: 'patient-1' }, error: null } }),
      ],
      Slot: [
        createQueryBuilder({ singleResult: { data: { slot_id: 'slot-1', status: 'available' }, error: null } }),
      ],
      Appointment: [
        createQueryBuilder({ result: { data: [{ appointment_id: 'existing' }], error: null } }),
      ],
    });

    const res = await request(app)
      .post('/appointments')
      .set(authHeader)
      .send({ doctor_id: 'doc-1', slot_id: 'slot-1', reason_for_visit: 'Checkup' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already have an appointment/i);
  });

  test('list - returns patient appointments', async () => {
    const appointmentRecords = [
      {
        appointment_id: 'app-1',
        duration: 30,
        reason_for_visit: 'Consult',
        status: 'Pending',
        Slot: { date: '2025-01-01', start_time: '09:00', end_time: '09:30' },
        Doctor: { specialization: 'Cardio', Users: { username: 'Dr. Heart' } },
      },
    ];

    supabase.__setMockTables({
      Patients: [
        createQueryBuilder({ singleResult: { data: { id: 'patient-1' }, error: null } }),
      ],
      Appointment: [
        createQueryBuilder({ result: { data: appointmentRecords, error: null } }),
      ],
    });

    const res = await request(app)
      .get('/appointments/my')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ appointment_id: 'app-1', doctor_name: 'Dr. Heart' });
  });
});