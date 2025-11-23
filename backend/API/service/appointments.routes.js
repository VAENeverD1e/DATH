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
router.get('/my', async (req, res) => {
  // #TODO: Use authMiddleware to get user_id from req.user (add authMiddleware to this route)
  // #TODO: Query Patients table to get patient_id (id) from user_id
  // #TODO: Query Appointment table where patient_id matches
  // #TODO: Join with Doctor, Users (for doctor info), and Slot (for date/time) tables
  // #TODO: Return list of appointments with: appointment_id, doctor name, specialization, date, start_time, end_time, duration, reason_for_visit, status
})

// GET /api/appointments/doctor (doctor's appointments) - Nguyễn Quang Huy
router.get('/doctor', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    // 1. Get doctor_id
    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()
      
    if (!doctor) return res.status(403).json({ error: 'Doctor profile not found' })

    // 2. Get date from query (default today)
    const dateFilter = req.query.date || new Date().toISOString().split('T')[0]

    // 3. Query appointments
    
    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select(`
        appointment_id,
        status,
        reason_for_visit,
        duration,
        Slot!inner (
          date,
          start_time,
          end_time
        ),
        Patients (
          id,
          Users (
            username,
            phone_number,
            email,
            gender,
            date_of_birth
          )
        )
      `)
      .eq('doctor_id', doctor.doctor_id)
      .eq('Slot.date', dateFilter)
      .order('start_time', { foreignTable: 'Slot', ascending: true })

    if (error) throw error

    // 4. Format data
    const formattedData = appointments.map(app => ({
      appointment_id: app.appointment_id,
      status: app.status,
      date: app.Slot.date,
      start_time: app.Slot.start_time,
      end_time: app.Slot.end_time,
      patient_name: app.Patients?.Users?.username || 'Unknown',
      patient_phone: app.Patients?.Users?.phone_number,
      reason: app.reason_for_visit
    }))

    return res.json(formattedData)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// PATCH /api/appointments/:id/status (doctor marks status) - Nguyễn Quang Huy
router.patch('/:id/status', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const appointmentId = req.params.id
    const { status } = req.body
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    // 1. Get doctor_id
    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()

    // 2. Update with condition that the doctor_id owns this appointment
    const { data, error } = await supabase
      .from('Appointment')
      .update({ status: status })
      .eq('appointment_id', appointmentId)
      .eq('doctor_id', doctor.doctor_id) // Security: Only update if correct doctor
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return res.status(403).json({ error: 'Appointment not found or you are not authorized' })
    }

    return res.json(data[0])

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

module.exports = router