const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const { authMiddleware, requireRole } = require('../../middlewares/authMiddleware')
// const authMiddleware = require('../../middlewares/authMiddleware')

// GET /api/admin/doctors
router.get('/doctors', authMiddleware, requireRole('admin') ,async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table, join with Users (on user_id) and Department (on department_id)
  // #TODO: Return list of all doctors with: doctor_id, username, email, phone_number, specialization, license_number, years_of_experience, department name
  const { specialization } = req.query;  
  try {

    // Build select with foreign key relationships (adjust names if schema differs)
    let query = supabase
      .from('Doctor')
      .select(`doctor_id, user_id, specialization, license_number, years_of_experience, user:Users!Doctor_user_id_fkey(username,email,phone_number), department:Department!Doctor_department_id_fkey(department_id,name)`) // explicit FK joins
      .order('doctor_id', { ascending: true });

    if (specialization) {
      query = query.ilike('specialization', `%${specialization}%`);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch doctors', details: error.message || error });
    }

    const mapped = (data || []).map(d => ({
      doctor_id: d.doctor_id,
      user_id: d.user_id,
      username: d.user?.username || null,
      email: d.user?.email || null,
      phone_number: d.user?.phone_number || null,
      specialization: d.specialization,
      license_number: d.license_number,
      years_of_experience: d.years_of_experience,
      department_id: d.department?.department_id || null,
      department_name: d.department?.name || null
    }));

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
})

// POST /api/admin/doctors
router.post('/doctors', authMiddleware, requireRole('admin'), async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin' (add authMiddleware and requireRole to this route)
  // #TODO: Get username, email, password, phone_number, date_of_birth, address, gender, department_id, specialization, license_number, years_of_experience from req.body
  // #TODO: Validate required fields (username, password, license_number, department_id are required)
  // #TODO: Check if username or license_number already exists
  // #TODO: Hash password using bcrypt
  // #TODO: Insert into Users table with role='doctor'
  // #TODO: Get new user_id from insert result
  // #TODO: Insert into Doctor table with user_id, specialization, license_number, years_of_experience, department_id
  // #TODO: Return success with new doctor info (exclude password)
  const bcrypt = require('bcrypt');
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Missing JSON body. Ensure Content-Type: application/json and a valid JSON payload.' })
    }
    const {
      username,
      email,
      password,
      phone_number,
      date_of_birth,
      address,
      gender,
      department_id,
      specialization,
      license_number,
      years_of_experience
    } = req.body || {};

    // Basic required validation
    const missing = [];
    if (!username) missing.push('username');
    if (!password) missing.push('password');
    if (!license_number) missing.push('license_number');
    if (!department_id) missing.push('department_id');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing required fields', fields: missing });
    }

    // Check username uniqueness
    const { data: existingUser, error: userCheckError } = await supabase
      .from('Users')
      .select('id')
      .eq('username', username)
      .limit(1);
    if (userCheckError) {
      return res.status(500).json({ error: 'Failed checking username', details: userCheckError.message || userCheckError });
    }
    if (existingUser && existingUser.length) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Check license uniqueness
    const { data: existingLicense, error: licenseCheckError } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('license_number', license_number)
      .limit(1);
    if (licenseCheckError) {
      return res.status(500).json({ error: 'Failed checking license_number', details: licenseCheckError.message || licenseCheckError });
    }
    if (existingLicense && existingLicense.length) {
      return res.status(409).json({ error: 'License number already exists' });
    }

    // Validate department exists before creating user (avoid orphan user if invalid)
    const { data: deptRows, error: deptErr } = await supabase
      .from('Department')
      .select('department_id')
      .eq('department_id', department_id)
      .limit(1);
    if (deptErr) {
      return res.status(500).json({ error: 'Failed checking department', details: deptErr.message || deptErr });
    }
    if (!deptRows || !deptRows.length) {
      return res.status(400).json({ error: 'Invalid department_id: not found' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert into Users table (do not select password back)
    const { data: userInsert, error: userInsertError } = await supabase
      .from('Users')
      .insert([
        {
          username,
          email: email || null,
          phone_number: phone_number || null,
          date_of_birth: date_of_birth || null,
          address: address || null,
          gender: gender || null,
          role: 'doctor',
          password: password_hash // hashed password stored in password column per schema
        }

      ])
      .select('id, username, email, phone_number, date_of_birth, address, gender, role');

    if (userInsertError || !userInsert || !userInsert.length) {
      return res.status(500).json({ error: 'Failed to create user', details: userInsertError?.message || userInsertError });
    }
    const newUser = userInsert[0];
    const user_id = newUser.id;

    // Insert into Doctor table
    const { data: doctorInsert, error: doctorInsertError } = await supabase
      .from('Doctor')
      .insert([
        {
          user_id,
          specialization: specialization || null,
          license_number,
          years_of_experience: years_of_experience ?? null,
          department_id
        }
      ])
      .select('doctor_id,user_id, specialization, license_number, years_of_experience, department_id');

    if (doctorInsertError || !doctorInsert || !doctorInsert.length) {
      // Compensation: remove created user to avoid orphan on FK failure
      await supabase.from('Users').delete().eq('id', user_id);
      return res.status(500).json({ error: 'Failed to create doctor profile', details: doctorInsertError?.message || doctorInsertError });
    }
    const newDoctor = doctorInsert[0];

    return res.status(201).json({
      doctor_id: newDoctor.doctor_id,
      user_id,
      username: newUser.username,
      email: newUser.email,
      phone_number: newUser.phone_number,
      specialization: newDoctor.specialization,
      license_number: newDoctor.license_number,
      years_of_experience: newDoctor.years_of_experience,
      department_id: newDoctor.department_id
    });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
});

// PATCH /api/admin/doctors/:id
router.patch('/doctors/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const doctor_id = req.params.id; // path param
    const { username, email, phone_number, specialization, license_number, years_of_experience, department_id } = req.body;
const { data: doctorRows, error: findDoctorErr } = await supabase
      .from('Doctor')
      .select('doctor_id, user_id, license_number, specialization, years_of_experience, department_id')
      .eq('doctor_id', doctor_id)
      .limit(1);
    if (findDoctorErr) {
      return res.status(500).json({ error: 'Failed fetching doctor', details: findDoctorErr.message || findDoctorErr });
    }
    if (!doctorRows || !doctorRows.length) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    const existingDoctor = doctorRows[0];
    const user_id = existingDoctor.user_id;

    // 2. Fetch existing user (to compare username)
    const { data: userRows, error: findUserErr } = await supabase
      .from('Users')
      .select('id, username')
      .eq('id', user_id)
      .limit(1);
    if (findUserErr) {
      return res.status(500).json({ error: 'Failed fetching user', details: findUserErr.message || findUserErr });
    }
    const existingUser = userRows && userRows[0];
    if (!existingUser) {
      return res.status(404).json({ error: 'Linked user not found' });
    }

    // 3. Duplicate checks only if values actually change
    if (username && username !== existingUser.username) {
      const { data: dupUser, error: dupUserErr } = await supabase
        .from('Users')
        .select('id')
        .eq('username', username)
        .limit(1);
      if (dupUserErr) {
        return res.status(500).json({ error: 'Failed checking username', details: dupUserErr.message || dupUserErr });
      }
      if (dupUser && dupUser.length) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    }
    if (license_number && license_number !== existingDoctor.license_number) {
      const { data: dupLic, error: dupLicErr } = await supabase
        .from('Doctor')
        .select('doctor_id')
        .eq('license_number', license_number)
        .limit(1);
      if (dupLicErr) {
        return res.status(500).json({ error: 'Failed checking license_number', details: dupLicErr.message || dupLicErr });
      }
      if (dupLic && dupLic.length) {
        return res.status(409).json({ error: 'License number already exists' });
      }
    }

    // 4. Build update objects (skip undefined)
    const userUpdate = {};
    if (username !== undefined) userUpdate.username = username;
    if (email !== undefined) userUpdate.email = email;
    if (phone_number !== undefined) userUpdate.phone_number = phone_number;

    const doctorUpdate = {};
    if (specialization !== undefined) doctorUpdate.specialization = specialization;
    if (license_number !== undefined) doctorUpdate.license_number = license_number;
    if (years_of_experience !== undefined) doctorUpdate.years_of_experience = years_of_experience;
    if (department_id !== undefined) doctorUpdate.department_id = department_id;

    // 5. Perform updates (if any fields provided)
    let updatedUser = existingUser;
    if (Object.keys(userUpdate).length) {
      const { data: userUpdRows, error: userUpdErr } = await supabase
        .from('Users')
        .update(userUpdate)
        .eq('id', user_id)
        .select('id, username, email, phone_number');
      if (userUpdErr) {
        return res.status(500).json({ error: 'Failed updating user', details: userUpdErr.message || userUpdErr });
      }
      updatedUser = userUpdRows[0];
    }

    let updatedDoctor = existingDoctor;
    if (Object.keys(doctorUpdate).length) {
      const { data: docUpdRows, error: docUpdErr } = await supabase
        .from('Doctor')
        .update(doctorUpdate)
        .eq('doctor_id', doctor_id)
        .select('doctor_id, specialization, license_number, years_of_experience, department_id, user_id');
      if (docUpdErr) {
        return res.status(500).json({ error: 'Failed updating doctor', details: docUpdErr.message || docUpdErr });
      }
      updatedDoctor = docUpdRows[0];
    }

    // 6. Response
    return res.json({
      doctor_id: updatedDoctor.doctor_id,
      user_id: updatedDoctor.user_id,
      username: updatedUser.username,
      email: updatedUser.email || null,
      phone_number: updatedUser.phone_number || null,
      specialization: updatedDoctor.specialization,
      license_number: updatedDoctor.license_number,
      years_of_experience: updatedDoctor.years_of_experience,
      department_id: updatedDoctor.department_id
    });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
});

// DELETE /api/admin/doctors/:id
router.delete('/doctors/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const doctor_id = req.params.id;
    // Fetch doctor to get user_id
    const { data: doctorRows, error: findDoctorErr } = await supabase
      .from('Doctor')
      .select('doctor_id, user_id')
      .eq('doctor_id', doctor_id)
      .limit(1);
    if (findDoctorErr) {
      return res.status(500).json({ error: 'Failed fetching doctor', details: findDoctorErr.message || findDoctorErr });
    }
    if (!doctorRows || !doctorRows.length) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    const user_id = doctorRows[0].user_id;

    // Delete Doctor first (to satisfy FK constraints referencing doctor_id)
    const { error: doctorDeleteErr } = await supabase
      .from('Doctor')
      .delete()
      .eq('doctor_id', doctor_id);
    if (doctorDeleteErr) {
      // Foreign key violation code in Postgres is typically 23503
      if (doctorDeleteErr.code === '23503') {
        return res.status(409).json({ error: 'Cannot delete doctor with existing related records (e.g., appointments)' });
      }
      return res.status(500).json({ error: 'Failed deleting doctor', details: doctorDeleteErr.message || doctorDeleteErr });
    }

    // Delete associated user
    const { error: userDeleteErr } = await supabase
      .from('Users')
      .delete()
      .eq('id', user_id);
    if (userDeleteErr) {
      // At this point doctor is gone; log and return error
      return res.status(500).json({ error: 'Failed deleting linked user', details: userDeleteErr.message || userDeleteErr });
    }

    return res.json({ message: 'Doctor deleted successfully', doctor_id, user_id });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
});

// GET /api/admin/appointments - list all appointments with doctor & patient info
router.get('/appointments', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Appointment')
      .select(`
        appointment_id,
        duration,
        reason_for_visit,
        status,
        doctor_id,
        patient_id,
        Slot!slot_id(date,start_time,end_time),
        Doctor!doctor_id(
          doctor_id,
          specialization,
          Users!user_id(username)
        ),
        Patients!patient_id(
          Users!user_id(username)
        )
      `)
      .order('appointment_id', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch appointments', details: error.message || error });
    }

    const mapped = (data || []).map(a => ({
      appointment_id: a.appointment_id,
      doctor_id: a.doctor_id,
      patient_id: a.patient_id,
      doctor_name: a.Doctor?.Users?.username || null,
      patient_name: a.Patients?.Users?.username || null,
      specialization: a.Doctor?.specialization || null,
      date: a.Slot?.date || null,
      start_time: a.Slot?.start_time || null,
      end_time: a.Slot?.end_time || null,
      duration: a.duration,
      reason_for_visit: a.reason_for_visit,
      status: a.status
    }));

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
});

// GET /api/admin/doctors/:doctor_id/appointments - appointments for a specific doctor (admin view)
router.get('/doctors/:doctor_id/appointments', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { doctor_id } = req.params;
    if (!doctor_id) {
      return res.status(400).json({ error: 'Missing doctor_id parameter' });
    }

    // Verify doctor exists
    const { data: doctorRows, error: docErr } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('doctor_id', doctor_id)
      .limit(1);
    if (docErr) {
      return res.status(500).json({ error: 'Failed checking doctor', details: docErr.message || docErr });
    }
    if (!doctorRows || !doctorRows.length) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const { data, error } = await supabase
      .from('Appointment')
      .select(`
        appointment_id,
        duration,
        reason_for_visit,
        status,
        slot_id,
        Slot!slot_id(date,start_time,end_time),
        Patients!patient_id(
          id,
          insurance_number,
          Users!user_id(username, phone_number)
        )
      `)
      .eq('doctor_id', doctor_id)
      .order('appointment_id', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch doctor appointments', details: error.message || error });
    }

    const mapped = (data || []).map(a => ({
      appointment_id: a.appointment_id,
      slot_id: a.slot_id,
      patient_id: a.Patients?.id || null,
      patient_name: a.Patients?.Users?.username || null,
      patient_phone: a.Patients?.Users?.phone_number || null,
      insurance_number: a.Patients?.insurance_number || null,
      date: a.Slot?.date || null,
      start_time: a.Slot?.start_time || null,
      end_time: a.Slot?.end_time || null,
      duration: a.duration,
      reason_for_visit: a.reason_for_visit,
      status: a.status
    }));

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
});
module.exports = router