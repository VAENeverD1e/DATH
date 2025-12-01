const express = require('express');
const request = require('supertest');
const departmentsRouter = require('../API/admin/departments.routes.js');
const supabase = require('../supabaseClient');

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/departments', departmentsRouter);
  return app;
};

describe('departments.routes', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    app = makeApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /departments', () => {
    test('should return all departments', async () => {
      const mockDepartments = [
        { department_id: 1, name: 'Cardiology' },
        { department_id: 2, name: 'Neurology' }
      ];

      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          data: mockDepartments,
          error: null
        }))
      }));

      const res = await request(app).get('/departments');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockDepartments);
      expect(supabase.from).toHaveBeenCalledWith('Department');
    });

    test('should return empty array when no departments exist', async () => {
      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          data: [],
          error: null
        }))
      }));

      const res = await request(app).get('/departments');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('should return 500 on database error', async () => {
      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          data: null,
          error: { message: 'Database connection failed' }
        }))
      }));

      const res = await request(app).get('/departments');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch departments');
    });
  });

  describe('POST /departments', () => {
    test('should create department with admin auth - returns 201', async () => {
      const newDept = { name: 'Pediatrics' };
      const createdDept = { department_id: 3, name: 'Pediatrics' };

      // Mock uniqueness check - no existing
      const mockEq = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [],
          error: null
        }))
      }));

      const mockSelect = jest.fn(() => ({
        eq: mockEq
      }));

      // Mock insert
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: [createdDept],
            error: null
          }))
        }))
      }));

      supabase.from = jest.fn((table) => {
        if (table === 'Department') {
          return {
            select: mockSelect,
            insert: mockInsert
          };
        }
      });

      const res = await request(app)
        .post('/departments')
        .set('Authorization', 'Bearer mock-token')
        .send(newDept);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdDept);
      expect(mockInsert).toHaveBeenCalledWith([{ name: 'Pediatrics' }]);
    });

    test('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/departments')
        .set('Authorization', 'Bearer mock-token')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing required field');
      expect(res.body.fields).toContain('name');
    });

    test('should return 409 if department name already exists', async () => {
      const duplicateDept = { name: 'Cardiology' };

      // Mock uniqueness check - existing found
      const mockEq = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [{ department_id: 1 }],
          error: null
        }))
      }));

      const mockSelect = jest.fn(() => ({
        eq: mockEq
      }));

      supabase.from = jest.fn(() => ({
        select: mockSelect
      }));

      const res = await request(app)
        .post('/departments')
        .set('Authorization', 'Bearer mock-token')
        .send(duplicateDept);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Department name already exists');
    });

    test('should return 401 if no auth token provided', async () => {
      const res = await request(app)
        .post('/departments')
        .send({ name: 'Orthopedics' });

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /departments/:id', () => {
    test('should update department name - returns 200', async () => {
      const deptId = 1;
      const updateData = { name: 'Cardiology Updated' };
      const existingDept = { department_id: 1, name: 'Cardiology' };
      const updatedDept = { department_id: 1, name: 'Cardiology Updated' };

      // Mock fetch existing
      const mockEqFetch = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [existingDept],
          error: null
        }))
      }));

      // Mock uniqueness check
      const mockEqUnique = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [],
          error: null
        }))
      }));

      // Mock update
      const mockEqUpdate = jest.fn(() => ({
        select: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: [updatedDept],
            error: null
          }))
        }))
      }));

      let callCount = 0;
      supabase.from = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return { select: () => ({ eq: mockEqFetch }) };
        } else if (callCount === 2) {
          return { select: () => ({ eq: mockEqUnique }) };
        } else {
          return { update: () => ({ eq: mockEqUpdate }) };
        }
      });

      const res = await request(app)
        .patch(`/departments/${deptId}`)
        .set('Authorization', 'Bearer mock-token')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedDept);
    });

    test('should return 404 if department not found', async () => {
      const deptId = 999;

      const mockEq = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [],
          error: null
        }))
      }));

      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: mockEq
        }))
      }));

      const res = await request(app)
        .patch(`/departments/${deptId}`)
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'New Name' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Department not found');
    });

    test('should return 409 if new name already exists', async () => {
      const deptId = 1;
      const existingDept = { department_id: 1, name: 'Cardiology' };

      // Mock fetch existing
      const mockEqFetch = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [existingDept],
          error: null
        }))
      }));

      // Mock uniqueness check - duplicate found
      const mockEqUnique = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [{ department_id: 2 }],
          error: null
        }))
      }));

      let callCount = 0;
      supabase.from = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return { select: () => ({ eq: mockEqFetch }) };
        } else {
          return { select: () => ({ eq: mockEqUnique }) };
        }
      });

      const res = await request(app)
        .patch(`/departments/${deptId}`)
        .set('Authorization', 'Bearer mock-token')
        .send({ name: 'Neurology' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Department name already exists');
    });

    test('should return existing department if no changes', async () => {
      const deptId = 1;
      const existingDept = { department_id: 1, name: 'Cardiology' };

      const mockEq = jest.fn(() => ({
        limit: jest.fn(() => ({
          data: [existingDept],
          error: null
        }))
      }));

      supabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: mockEq
        }))
      }));

      const res = await request(app)
        .patch(`/departments/${deptId}`)
        .set('Authorization', 'Bearer mock-token')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toEqual(existingDept);
    });
  });

  describe('DELETE /departments/:id', () => {
    test('should delete department - returns 200', async () => {
      const deptId = 1;

      const mockEq = jest.fn(() => ({
        data: null,
        error: null
      }));

      supabase.from = jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: mockEq
        }))
      }));

      const res = await request(app)
        .delete(`/departments/${deptId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Department deleted successfully');
      expect(res.body.id).toBe(deptId.toString());
    });

    test('should return 409 if department has related doctors (FK violation)', async () => {
      const deptId = 1;

      const mockEq = jest.fn(() => ({
        data: null,
        error: { code: '23503', message: 'Foreign key violation' }
      }));

      supabase.from = jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: mockEq
        }))
      }));

      const res = await request(app)
        .delete(`/departments/${deptId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Cannot delete department with related records (e.g., doctors)');
    });

    test('should return 500 on other database errors', async () => {
      const deptId = 1;

      const mockEq = jest.fn(() => ({
        data: null,
        error: { message: 'Database connection failed' }
      }));

      supabase.from = jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: mockEq
        }))
      }));

      const res = await request(app)
        .delete(`/departments/${deptId}`)
        .set('Authorization', 'Bearer mock-token');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed deleting department');
    });

    test('should return 401 if no auth token provided', async () => {
      const res = await request(app)
        .delete('/departments/1');

      expect(res.status).toBe(401);
    });
  });
});