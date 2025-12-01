process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-key';

// CommonJS-friendly Jest mocks
jest.mock('./supabaseClient.js', () => {
  const fakeQuery = () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: [], error: null }),
    update: () => ({ data: [], error: null }),
    delete: () => ({ data: [], error: null }),
    eq: () => fakeQuery(),
  });
  return {
    __esModule: true,
    default: {
      from: () => fakeQuery(),
      auth: {
        signUp: async () => ({ data: {}, error: null }),
        signInWithPassword: async () => ({ data: {}, error: null }),
        getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }),
      },
    },
  };
});

jest.mock('jsonwebtoken', () => ({
  sign: () => 'mock-token',
  verify: () => ({ userId: 'u1', role: 'admin' }),
  decode: () => ({ userId: 'u1' }),
}));

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: async () => 'hashed',
    compare: async () => true,
  },
}));