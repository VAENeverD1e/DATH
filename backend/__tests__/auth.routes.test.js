const express = require('express');
const request = require('supertest');

const supabaseQueues = () => {
  const queues = new Map();
  return {
    clear: () => queues.clear(),
    setTables: (tableMap) => {
      queues.clear();
      Object.entries(tableMap).forEach(([table, builders]) => {
        queues.set(table, [...builders]);
      });
    },
    next: (table) => {
      const tableQueue = queues.get(table) || [];
      if (!tableQueue.length) {
        throw new Error(`No mock queries queued for table: ${table}`);
      }
      return tableQueue.shift();
    }
  };
};

const queueController = supabaseQueues();

const createQueryBuilder = (overrides = {}) => {
  const builder = {};
  const resolvedLimit = overrides.limit ?? { data: [], error: null };
  const resolvedSingle = overrides.single ?? { data: null, error: null };
  const resolvedInsert = overrides.insert ?? { data: null, error: null };

  builder.select = jest.fn().mockImplementation(() => builder);
  builder.eq = jest.fn().mockImplementation(() => builder);
  builder.limit = jest.fn().mockImplementation(() => Promise.resolve(resolvedLimit));
  builder.single = jest.fn().mockImplementation(() => Promise.resolve(resolvedSingle));
  builder.insert = jest.fn().mockImplementation(() => {
    if (overrides.onInsert) {
      overrides.onInsert();
    }
    if (overrides.insertReturnsPromise) {
      return Promise.resolve(resolvedInsert);
    }
    return builder;
  });
  builder.delete = jest.fn().mockImplementation(() => Promise.resolve({ error: null }));
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
};

const supabaseAuthMocks = {
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  getUser: jest.fn(),
};

jest.mock('../supabaseClient.js', () => {
  return {
    from: jest.fn((table) => queueController.next(table)),
    auth: supabaseAuthMocks,
    __setMockTables: (tableMap) => queueController.setTables(tableMap),
    __reset: () => queueController.clear(),
  };
});

const bcryptHashMock = jest.fn().mockResolvedValue('hashed-password');
const bcryptCompareMock = jest.fn().mockResolvedValue(true);
jest.mock('bcrypt', () => ({
  hash: bcryptHashMock,
  compare: bcryptCompareMock,
}));

const jwtSignMock = jest.fn().mockReturnValue('mock-jwt');
const jwtVerifyMock = jest.fn().mockReturnValue({ userId: 'user-123', role: 'patient' });
jest.mock('jsonwebtoken', () => ({
  sign: jwtSignMock,
  verify: jwtVerifyMock,
}));

const supabase = require('../supabaseClient.js');
const authRouter = require('../API/auth/auth.routes.js');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  return app;
};

describe('auth.routes', () => {
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
    supabase.__reset();
  });

  const baseRegisterPayload = {
    username: 'new_user',
    email: 'test@example.com',
    password: 'Password1',
    phone_number: '+1 555 333 2222',
    date_of_birth: '1990-01-02',
    address: '123 Test Street',
    gender: 'Male',
    insurance_provider: 'Aetna',
    insurance_number: 'ABCD-1234',
  };

  test('register - returns 201 with user id', async () => {
    const insertedUser = {
      id: 'u1',
      username: 'new_user',
      email: 'test@example.com',
      phone_number: '+1 555 333 2222',
      date_of_birth: '1990-01-02',
      address: '123 Test Street',
      gender: 'Male',
      role: 'patient',
    };

    supabase.__setMockTables({
      Users: [
        createQueryBuilder({ limit: { data: [], error: null } }),
        createQueryBuilder({ limit: { data: [], error: null } }),
        createQueryBuilder({ single: { data: insertedUser, error: null } }),
      ],
      Patients: [
        createQueryBuilder({ insertReturnsPromise: true, insert: { data: [{ id: 'u1' }], error: null } }),
      ],
    });

    const res = await request(app).post('/auth/register').send(baseRegisterPayload);

    expect(res.status).toBe(201);
    expect(res.body.token).toBe('mock-jwt');
    expect(res.body.user).toMatchObject({ id: 'u1', email: 'test@example.com' });
    expect(bcryptHashMock).toHaveBeenCalledWith('Password1', 10);
  });

  test('register - duplicate email returns 409', async () => {
    supabase.__setMockTables({
      Users: [
        createQueryBuilder({ limit: { data: [], error: null } }),
        createQueryBuilder({ limit: { data: [{ id: 'existing' }], error: null } }),
      ],
    });

    const res = await request(app).post('/auth/register').send(baseRegisterPayload);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already exists');
  });

  test('login - returns 200 with token', async () => {
    const dbUser = {
      id: 'user-5',
      username: 'jdoe',
      email: 'jdoe@example.com',
      password: 'hashed-password',
      phone_number: '123',
      date_of_birth: '1995-04-05',
      address: 'Somewhere',
      gender: 'Male',
      role: 'patient',
    };

    supabase.__setMockTables({
      Users: [createQueryBuilder({ limit: { data: [dbUser], error: null } })],
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'jdoe', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('mock-jwt');
    expect(res.body.user).toMatchObject({ id: 'user-5', username: 'jdoe' });
    expect(bcryptCompareMock).toHaveBeenCalledWith('Password1', 'hashed-password');
  });

  test('login - wrong password returns 401', async () => {
    const dbUser = {
      id: 'user-6',
      username: 'jane',
      email: 'jane@example.com',
      password: 'hashed-secret',
      role: 'patient',
    };

    supabase.__setMockTables({
      Users: [createQueryBuilder({ limit: { data: [dbUser], error: null } })],
    });

    bcryptCompareMock.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'jane', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  test('me - requires auth, returns profile', async () => {
    const profileUser = {
      id: 'profile-1',
      username: 'patient1',
      email: 'patient1@example.com',
      phone_number: '999',
      date_of_birth: '1980-07-07',
      address: 'Road 1',
      gender: 'Female',
      role: 'patient',
    };

    const patientRecord = { id: 'profile-1', user_id: 'profile-1', insurance_provider: 'Aetna' };

    jwtVerifyMock.mockReturnValueOnce({ userId: 'profile-1', role: 'patient' });

    supabase.__setMockTables({
      Users: [createQueryBuilder({ single: { data: profileUser, error: null } })],
      Patients: [createQueryBuilder({ limit: { data: [patientRecord], error: null } })],
    });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 'profile-1', patient: patientRecord });
  });
});