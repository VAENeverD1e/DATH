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
      const tableQueue = queues.get(table) || [];
      if (!tableQueue.length) {
        throw new Error(`No mock responses queued for table: ${table}`);
      }
      return tableQueue.shift();
    },
  };
};

const createQueryBuilder = (options = {}) => {
  const {
    result = { data: [], error: null },
    singleResult,
    deleteResult = { error: null },
  } = options;

  const builder = {
    _result: result,
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    ilike: jest.fn(() => builder),
    order: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    update: jest.fn(() => builder),
    delete: jest.fn(() => Promise.resolve(deleteResult)),
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

const bcryptHashMock = jest.fn().mockResolvedValue('hashed-password');
jest.mock('bcrypt', () => ({
  hash: (...args) => bcryptHashMock(...args),
}));

const jwtVerifyMock = jest.fn().mockReturnValue({ userId: 'admin-1', role: 'admin' });
jest.mock('jsonwebtoken', () => ({
  verify: (...args) => jwtVerifyMock(...args),
}));

const supabase = require('../supabaseClient.js');
const adminRouter = require('../API/admin/admin.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/admin', adminRouter);
  return app;
};

describe('admin.routes', () => {
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
    supabase.__reset();
    jwtVerifyMock.mockReturnValue({ userId: 'admin-1', role: 'admin' });
  });

  const adminHeaders = { Authorization: 'Bearer admin-token' };

  const validPayload = {
    username: 'drsmith',
    email: 'drsmith@example.com',
    password: 'Secret123',
    phone_number: '+1 555 000 9999',
    date_of_birth: '1980-03-04',
    address: '1 Clinic Way',
    gender: 'Male',
    department_id: 1,
    specialization: 'Cardiology',
    license_number: 'LIC-12345',
    years_of_experience: 10,
  };

  test('add doctor - admin role required', async () => {
    const insertedUser = {
      data: [
        {
          id: 'user-10',
          username: validPayload.username,
          email: validPayload.email,
          phone_number: validPayload.phone_number,
          date_of_birth: validPayload.date_of_birth,
          address: validPayload.address,
          gender: validPayload.gender,
          role: 'doctor',
        },
      ],
      error: null,
    };

    const insertedDoctor = {
      data: [
        {
          doctor_id: 'doc-5',
          user_id: 'user-10',
          specialization: validPayload.specialization,
          license_number: validPayload.license_number,
          years_of_experience: validPayload.years_of_experience,
          department_id: validPayload.department_id,
        },
      ],
      error: null,
    };

    supabase.__setMockTables({
      Users: [
        createQueryBuilder({ result: { data: [], error: null } }), // username check
        createQueryBuilder({ result: insertedUser }), // insert new user
      ],
      Doctor: [
        createQueryBuilder({ result: { data: [], error: null } }), // license check
        createQueryBuilder({ result: insertedDoctor }), // insert new doctor
      ],
      Department: [
        createQueryBuilder({ result: { data: [{ department_id: 1 }], error: null } }),
      ],
    });

    const res = await request(app)
      .post('/admin/doctors')
      .set(adminHeaders)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      doctor_id: 'doc-5',
      user_id: 'user-10',
      username: 'drsmith',
      license_number: 'LIC-12345',
    });
    expect(bcryptHashMock).toHaveBeenCalledWith(validPayload.password, 10);
  });

  test('add doctor - non-admin returns 403', async () => {
    jwtVerifyMock.mockReturnValueOnce({ userId: 'user-2', role: 'user' });

    const res = await request(app)
      .post('/admin/doctors')
      .set(adminHeaders)
      .send(validPayload);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  test('list doctors - returns list when admin', async () => {
    const doctors = {
      data: [
        {
          doctor_id: 'doc-1',
          user_id: 'user-1',
          specialization: 'Cardio',
          license_number: 'LIC1',
          years_of_experience: 8,
          user: { username: 'docA', email: 'docA@example.com', phone_number: '111' },
          department: { department_id: 2, name: 'Heart' },
        },
      ],
      error: null,
    };

    supabase.__setMockTables({
      Doctor: [createQueryBuilder({ result: doctors })],
    });

    const res = await request(app)
      .get('/admin/doctors')
      .set(adminHeaders);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ doctor_id: 'doc-1', department_name: 'Heart' });
  });
});