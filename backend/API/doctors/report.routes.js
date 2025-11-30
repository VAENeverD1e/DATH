const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const { authMiddleware, requireRole } = require('../../middlewares/authMiddleware')

// POST /api/reports (create medical report for appointment)
router.post('/', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const { appointment_id, diagnosis, treatment_plan } = req.body

    // 1. Get doctor_id 
    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()

    if (!doctor) return res.status(403).json({ error: 'Unauthorized' })

    // 2. Verify appointment exists and belongs to doctor
    const { data: appointment, error: appError } = await supabase
      .from('Appointment')
      .select('appointment_id')
      .eq('appointment_id', appointment_id)
      .eq('doctor_id', doctor.doctor_id)
      .single()

    if (appError || !appointment) {
      return res.status(403).json({ error: 'Appointment not found or unauthorized' })
    }

    // 3. Check if report already exists
    const { data: existingReport } = await supabase
      .from('Medical_Report')
      .select('report_id')
      .eq('appointment_id', appointment_id)
      .single()

    if (existingReport) {
      return res.status(400).json({ error: 'Report already exists for this appointment' })
    }

    // 4. Insert Report
    const { data: newReport, error: insertError } = await supabase
      .from('Medical_Report')
      .insert([{
        appointment_id,
        diagnosis,
        treatment_plan
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Update Appointment Status -> 'Completed'
    await supabase
      .from('Appointment')
      .update({ status: 'Completed' })
      .eq('appointment_id', appointment_id)

    return res.status(201).json(newReport)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// GET /api/reports/:appointmentId (get report for an appointment)
router.get('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params
    const currentUserId = req.user.id
    const userRole = req.user.role

    // 1. Query Report + Appointment Info
    // Join from Appointment -> Doctor/Patients -> Users to check permissions
    const { data: report, error } = await supabase
      .from('Medical_Report')
      .select(`
        *,
        Appointment (
          doctor_id,
          patient_id,
          Doctor (user_id),
          Patients (user_id)
        )
      `)
      .eq('appointment_id', appointmentId)
      .single()

    if (error || !report) return res.status(404).json({ error: 'Report not found' })

    // 2. Verify Permission
    // - If user is the doctor in charge (Doctor.user_id == currentUserId)
    // - if user is the patient (Patients.user_id == currentUserId)
    
    const doctorUserId = report.Appointment?.Doctor?.user_id
    const patientUserId = report.Appointment?.Patients?.user_id

    const isAuthorized = (currentUserId === doctorUserId) || (currentUserId === patientUserId)

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to view this report' })
    }

    // 3. Return data
    const responseData = {
      report_id: report.report_id,
      appointment_id: report.appointment_id,
      diagnosis: report.diagnosis,
      treatment_plan: report.treatment_plan
    }

    return res.json(responseData)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

module.exports = router