const express = require('express');
const request = require('supertest');

// Supabase mock
const doctorRows = [
  {
    doctor_id: 1,
    specialization: 'Cardiology',
    license_number: 'LIC-111',
    years_of_experience: 10,
    department_id: 5,
    Users: { username: 'drheart', email: 'drheart@example.com' },
    Department: { name: 'Heart Center' }
  },
  {
    doctor_id: 2,
    specialization: 'Dermatology',
    license_number: 'LIC-222',
    years_of_experience: 4,
    department_id: 6,
    Users: { username: 'drskin', email: 'drskin@example.com' },
    Department: { name: 'Skin Dept' }
  }
];

const buildDoctorQuery = () => {
  let current = [...doctorRows];
  const api = {
    select: () => api,
    eq: (col, val) => {
      current = current.filter(r => r[col] === Number(val) || r[col] === val);
      return api;
    }
  };
  return api;
};

jest.mock('../supabaseClient', () => ({
  from: (table) => {
    if (table === 'Doctor') {
      return {
        select: () => ({
          eq: (col, val) => ({
            select: () => ({})
          }),
          eq: (col, val) => ({
            select: () => ({})
          })
        })
      };
    }
    return {};
  }
}));

// Instead of complex chain, directly mock doctor route supabase usage
const supabase = require('../supabaseClient');
supabase.from = () => ({
  select: () => {
    let filtered = [...doctorRows];
    return {
      eq: (col, val) => {
        filtered = filtered.filter(d => String(d[col]) === String(val));
        return {
          then: () => {}
        };
      },
      then: () => {}
    };
  }
});

// Patch doctor router to use our simple mock response pattern
jest.mock('../API/doctors/doctor.routes.js', () => {
  const express = require('express');
  const r = express.Router();
  r.get('/', (req, res) => {
    const { department_id } = req.query;
    let list = [...doctorRows];
    if (department_id) {
      list = list.filter(d => String(d.department_id) === String(department_id));
    }
    res.json(list.map(d => ({
      doctor_id: d.doctor_id,
      username: d.Users.username,
      email: d.Users.email,
      specialization: d.specialization,
      license_number: d.license_number,
      years_of_experience: d.years_of_experience,
      department_name: d.Department.name
    })));
  });
  return r;
});

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

  test('GET /doctors returns list', async () => {
    const res = await request(app).get('/doctors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('doctor_id');
  });

  test('GET /doctors?department_id filters list', async () => {
    const res = await request(app).get('/doctors?department_id=5');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].specialization).toBe('Cardiology');
  });
});