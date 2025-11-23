const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const authMiddleware = require('../../middlewares/authMiddleware')

// POST /api/appointments (book appointment) - Trần Hùng Sơn
router.post('/', authMiddleware, async (req, res) => {
  // #TODO: Use authMiddleware to get user_id from req.user (add authMiddleware to this route)
  // #TODO: Query Patients table to get patient_id (id) from user_id
  // #TODO: Get doctor_id, slot_id, reason_for_visit, duration from req.body
  // #TODO: Query Slot table to check if slot_id exists and status='available'
  // #TODO: If slot not available, return 400 error 'Slot not available'
  // #TODO: Check patient doesn't have overlapping appointment at same time
  // #TODO: Insert into Appointment table with patient_id, doctor_id, slot_id, duration, reason_for_visit, status='Pending'
  // #TODO: Update Slot status to 'booked'
  // #TODO: Return success with appointment details
  try {
    const user_id = req.user.id; // from JWT via authMiddleware
    const { doctor_id, slot_id, reason_for_visit, duration = 30 } = req.body;

    if (!doctor_id || !slot_id || !reason_for_visit) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { data: patient, error: patientError } = await supabase
      .from('Patients')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const patient_id = patient.id;

    const { data: slot, error: slotError } = await supabase
      .from('Slot')
      .select('slot_id, status, availability_id, start_time, end_time')
      .eq('slot_id', slot_id)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ message: 'Slot not available' });
    }

    const { data: conflicting } = await supabase
      .from('Appointment')
      .select('appointment_id')
      .eq('patient_id', patient_id)
      .eq('slot_id', slot_id);

    if (conflicting?.length > 0) {
      return res.status(400).json({ message: 'You already have an appointment in this slot' });
    }

    const { data: appointment, error: appointError } = await supabase
      .from('Appointment')
      .insert({
        patient_id,
        doctor_id,
        slot_id,
        duration,
        reason_for_visit,
        status: 'Pending'
      })
      .select()
      .single();

    if (appointError) {
      console.error('Insert error:', appointError);
      return res.status(500).json({ message: 'Failed to book appointment' });
    }

    await supabase
      .from('Slot')
      .update({ status: 'booked' })
      .eq('slot_id', slot_id);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
})

// GET /api/appointments/my (patient's appointments) - Lê Mạnh Hưng
router.get('/my', authMiddleware, async (req, res) => {
  // #TODO: Use authMiddleware to get user_id from req.user (add authMiddleware to this route)
  // #TODO: Query Patients table to get patient_id (id) from user_id
  // #TODO: Query Appointment table where patient_id matches
  // #TODO: Join with Doctor, Users (for doctor info), and Slot (for date/time) tables
  // #TODO: Return list of appointments with: appointment_id, doctor name, specialization, date, start_time, end_time, duration, reason_for_visit, status
  try {
    const user_id = req.user;
    const { data: patient } = await supabase
      .from('Patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select(`
        appointment_id,
        duration,
        reason_for_visit,
        status,
        created_at,
        Slot!inner(date, start_time, end_time),
        Doctor!inner(
          specialization,
          Users!user_id(username)
        )
      `)
      .eq('patient_id', patient.id)
      .order('Slot.date', { ascending: false })
      .order('Slot.start_time');

    if (error) throw error;

    const formatted = appointments.map(a => ({
      appointment_id: a.appointment_id,
      doctor_name: a.Doctor.Users.username,
      specialization: a.Doctor.specialization,
      date: a.Slot.date,
      start_time: a.Slot.start_time,
      end_time: a.Slot.end_time,
      duration: a.duration,
      reason_for_visit: a.reason_for_visit,
      status: a.status
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// GET /api/appointments/doctor (doctor's appointments) - Nguyễn Quang Huy
router.get('/doctor', authMiddleware, requireRole('doctor'), async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get optional query param: date from req.query (default to today's date)
  // #TODO: Query Appointment table where doctor_id matches
  // #TODO: Join with Slot table to filter by date
  // #TODO: Join with Patients and Users tables to get patient info
  // #TODO: Return list of appointments with: appointment_id, patient name, phone_number, date, start_time, end_time, duration, reason_for_visit, status
  try {
    const user_id = req.user.id;
    const dateFilter = req.query.date || new Date().toISOString().split('T')[0]; // today if not provided

    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', user_id)
      .single();

    if (!doctor) return res.status(403).json({ message: 'Doctor profile not found' });

    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select(`
        appointment_id,
        duration,
        reason_for_visit,
        status,
        Slot!inner(date, start_time, end_time),
        Patients!inner(
          insurance_number,
          Users!user_id(username, phone_number)
        )
      `)
      .eq('doctor_id', doctor.doctor_id)
      .eq('Slot.date', dateFilter)
      .order('Slot.start_time');

    if (error) throw error;

    const formatted = appointments.map(a => ({
      appointment_id: a.appointment_id,
      patient_name: a.Patients.Users.username,
      phone_number: a.Patients.Users.phone_number,
      insurance_number: a.Patients.insurance_number,
      date: a.Slot.date,
      start_time: a.Slot.start_time,
      end_time: a.Slot.end_time,
      duration: a.duration,
      reason_for_visit: a.reason_for_visit,
      status: a.status
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// PATCH /api/appointments/:id/status (doctor marks status) - Nguyễn Quang Huy
router.patch('/:id/status', authMiddleware, requireRole('doctor'), async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get appointment_id from req.params.id
  // #TODO: Get new status from req.body (valid values: 'Pending', 'Confirmed', 'Completed', 'Cancelled')
  // #TODO: Query Appointment table to verify appointment_id exists and belongs to this doctor_id
  // #TODO: If not found or wrong doctor, return 403 error 'Not authorized'
  // #TODO: Update Appointment status in database
  // #TODO: Return success response with updated appointment
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user_id = req.user.id;

    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', user_id)
      .single();

    if (!doctor) return res.status(403).json({ message: 'Not authorized' });

    // Verify appointment belongs to this doctor
    const { data: appointment } = await supabase
      .from('Appointment')
      .select('appointment_id, doctor_id')
      .eq('appointment_id', id)
      .eq('doctor_id', doctor.doctor_id)
      .single();

    if (!appointment) {
      return res.status(403).json({ message: 'Not authorized or appointment not found' });
    }

    const { data: updated, error } = await supabase
      .from('Appointment')
      .update({ status })
      .eq('appointment_id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Appointment status updated',
      appointment: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

module.exports = router