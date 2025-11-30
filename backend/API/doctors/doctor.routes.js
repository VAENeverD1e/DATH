const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')

// GET /api/doctors
router.get('/', async (req, res) => {
  // #TODO: Get optional query param: department_id from req.query
  // #TODO: Query Doctor table, join with Users (on user_id) and Department (on department_id)
  // #TODO: If department_id provided, filter by it
  // #TODO: Return list of doctors with: doctor_id, username, email, specialization, license_number, years_of_experience, department name
    try {
    const { department_id } = req.query;

    let query = supabase
      .from('Doctor')
      .select(`
        doctor_id,
        specialization,
        license_number,
        years_of_experience,
        department_id,
        user_id,
        Users!user_id (
          username,
          email
        ),
        Department!department_id (
          name
        )
      `);  // All Doctor records should be doctors - no filter on joined Users.role needed

    if (department_id) {
      query = query.eq('department_id', department_id);
    }

    const { data: doctors, error } = await query;

    if (error) {
      console.error('Supabase error (list doctors):', error);
      return res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }

    if (!doctors || doctors.length === 0) {
      return res.status(200).json([]);
    }

    const formattedDoctors = doctors.map(doc => ({
      doctor_id: doc.doctor_id,
      username: doc.Users?.username || null,
      email: doc.Users?.email || null,
      specialization: doc.specialization,
      license_number: doc.license_number,
      years_of_experience: doc.years_of_experience,
      department: doc.Department?.name || null,
      department_id: doc.department_id,
    }));

    res.status(200).json(formattedDoctors);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
})

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
try {
    const { id } = req.params;

    const { data: doctor, error } = await supabase
      .from('Doctor')
      .select(`
        doctor_id,
        specialization,
        license_number,
        years_of_experience,
        department_id,
        user_id,
        Users!user_id (
          username,
          email,
          phone_number
        ),
        Department!department_id (
          name
        )
      `)
      .eq('doctor_id', id)
      .single(); // Expect exactly one

    if (error || !doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const formattedDoctor = {
      doctor_id: doctor.doctor_id,
      username: doctor.Users?.username || null,
      email: doctor.Users?.email || null,
      phone_number: doctor.Users?.phone_number || null,
      specialization: doctor.specialization,
      license_number: doctor.license_number,
      years_of_experience: doctor.years_of_experience,
      department: doctor.Department?.name || null,
      department_id: doctor.department_id,
    };

    res.status(200).json(formattedDoctor);
  } catch (err) {
    console.error('Unexpected error (doctor detail):', err);
    res.status(500).json({ message: 'Internal server error' });
  }
})

module.exports = router