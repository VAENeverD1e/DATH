const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
// const authMiddleware = require('../../middlewares/authMiddleware')

// POST /api/appointments (book appointment) - Trần Hùng Sơn
router.post('/', async (req, res) => {
  // #TODO: Use authMiddleware to get user_id from req.user (add authMiddleware to this route)
  // #TODO: Query Patients table to get patient_id (id) from user_id
  // #TODO: Get doctor_id, slot_id, reason_for_visit, duration from req.body
  // #TODO: Query Slot table to check if slot_id exists and status='available'
  // #TODO: If slot not available, return 400 error 'Slot not available'
  // #TODO: Check patient doesn't have overlapping appointment at same time
  // #TODO: Insert into Appointment table with patient_id, doctor_id, slot_id, duration, reason_for_visit, status='Pending'
  // #TODO: Update Slot status to 'booked'
  // #TODO: Return success with appointment details
})

// GET /api/appointments/my (patient's appointments) - Lê Mạnh Hưng
router.get('/my', authMiddleware, async (req, res) => {
  try {
    // Use authMiddleware to get user_id from req.user
    const userId = req.user.id;

    // Query Patients table to get patient_id (id) from user_id
    const { data: patient, error: patientError } = await supabase
      .from('Patients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientId = patient.id;

    // Query Appointment table where patient_id matches
    // Join with Doctor, Users (for doctor info), and Slot (for date/time) tables
    const { data: appointments, error: appointmentsError } = await supabase
      .from('Appointments')
      .select(`
        id,
        reason_for_visit,
        status,
        Doctors (
          Users (
            username
          ),
          specialization
        ),
        Slots (
          date,
          start_time,
          end_time,
          duration
        )
      `)
      .eq('patient_id', patientId);

    if (appointmentsError) {
      throw appointmentsError;
    }

    // Return list of appointments with the required fields
    const response = appointments.map(appt => ({
      appointment_id: appt.id,
      doctor_name: appt.Doctors.Users.username,
      specialization: appt.Doctors.specialization,
      date: appt.Slots.date,
      start_time: appt.Slots.start_time,
      end_time: appt.Slots.end_time,
      duration: appt.Slots.duration,
      reason_for_visit: appt.reason_for_visit,
      status: appt.status,
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// GET /api/appointments/doctor (doctor's appointments) - Nguyễn Quang Huy
router.get('/doctor', async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get optional query param: date from req.query (default to today's date)
  // #TODO: Query Appointment table where doctor_id matches
  // #TODO: Join with Slot table to filter by date
  // #TODO: Join with Patients and Users tables to get patient info
  // #TODO: Return list of appointments with: appointment_id, patient name, phone_number, date, start_time, end_time, duration, reason_for_visit, status
})

// PATCH /api/appointments/:id/status (doctor marks status) - Nguyễn Quang Huy
router.patch('/:id/status', async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get appointment_id from req.params.id
  // #TODO: Get new status from req.body (valid values: 'Pending', 'Confirmed', 'Completed', 'Cancelled')
  // #TODO: Query Appointment table to verify appointment_id exists and belongs to this doctor_id
  // #TODO: If not found or wrong doctor, return 403 error 'Not authorized'
  // #TODO: Update Appointment status in database
  // #TODO: Return success response with updated appointment
})

module.exports = router