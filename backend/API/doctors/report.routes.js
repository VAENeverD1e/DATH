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
        Appointment!Medical_Report_appointment_id_fkey (
          doctor_id,
          patient_id,
          Doctor!Appointment_doctor_id_fkey (user_id),
          Patients!Appointment_patient_id_fkey (user_id)
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

// PATCH /api/reports/:reportId (doctor edits medical report)
router.patch('/:reportId', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const { reportId } = req.params
    const { diagnosis, treatment_plan } = req.body

    if (!diagnosis && !treatment_plan) {
      return res.status(400).json({ error: 'At least one field (diagnosis or treatment_plan) is required' })
    }

    // 1. Get doctor_id
    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()

    if (!doctor) return res.status(403).json({ error: 'Unauthorized' })

    // 2. Verify report exists and belongs to this doctor's appointment
    const { data: report } = await supabase
      .from('Medical_Report')
      .select(`
        report_id,
        appointment_id,
        Appointment!Medical_Report_appointment_id_fkey (
          doctor_id
        )
      `)
      .eq('report_id', reportId)
      .single()

    if (!report) {
      return res.status(404).json({ error: 'Report not found' })
    }

    if (report.Appointment?.doctor_id !== doctor.doctor_id) {
      return res.status(403).json({ error: 'Not authorized to edit this report' })
    }

    // 3. Update report
    const updateData = {}
    if (diagnosis) updateData.diagnosis = diagnosis
    if (treatment_plan) updateData.treatment_plan = treatment_plan

    const { data: updatedReport, error: updateError } = await supabase
      .from('Medical_Report')
      .update(updateData)
      .eq('report_id', reportId)
      .select()
      .single()

    if (updateError) throw updateError

    return res.json({
      message: 'Report updated successfully',
      report: updatedReport
    })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// GET /api/reports/my/patient (patient views all their medical reports)
router.get('/my/patient', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    // 1. Get patient_id
    const { data: patient } = await supabase
      .from('Patients')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' })
    }

    // 2. Get all reports for this patient's appointments
    const { data: appointments, error: apptError } = await supabase
      .from('Appointment')
      .select(`
        appointment_id,
        duration,
        reason_for_visit,
        Slot!Appointment_slot_id_fkey (date, start_time, end_time),
        Doctor!Appointment_doctor_id_fkey (
          specialization,
          Users!Doctor_user_id_fkey (username)
        ),
        Medical_Report!Medical_Report_appointment_id_fkey (
          report_id,
          diagnosis,
          treatment_plan
        )
      `)
      .eq('patient_id', patient.id)
      .not('Medical_Report', 'is', null)

    if (apptError) throw apptError

    // Flatten the structure
    const reports = (appointments || []).map(a => ({
      report_id: a.Medical_Report?.report_id,
      appointment_id: a.appointment_id,
      diagnosis: a.Medical_Report?.diagnosis,
      treatment_plan: a.Medical_Report?.treatment_plan,
      appointment_date: a.Slot?.date,
      appointment_time: a.Slot?.start_time,
      doctor_name: a.Doctor?.Users?.username || 'Unknown',
      specialization: a.Doctor?.specialization,
      reason_for_visit: a.reason_for_visit,
      duration: a.duration
    }))

    const error = null

    if (error) throw error

    return res.json(reports)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// GET /api/reports/my/doctor (doctor views all their medical reports)
router.get('/my/doctor', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const userId = req.user.id

    // 1. Get doctor_id
    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', userId)
      .single()

    if (!doctor) {
      return res.status(403).json({ error: 'Doctor profile not found' })
    }

    // 2. Get all reports for this doctor's appointments
    const { data: appointments, error: apptError } = await supabase
      .from('Appointment')
      .select(`
        appointment_id,
        duration,
        reason_for_visit,
        Slot!Appointment_slot_id_fkey (date, start_time, end_time),
        Patients!Appointment_patient_id_fkey (
          insurance_number,
          Users!Patients_user_id_fkey (username, phone_number)
        ),
        Medical_Report!Medical_Report_appointment_id_fkey (
          report_id,
          diagnosis,
          treatment_plan
        )
      `)
      .eq('doctor_id', doctor.doctor_id)
      .not('Medical_Report', 'is', null)

    if (apptError) throw apptError

    // Flatten the structure
    const reports = (appointments || []).map(a => ({
      report_id: a.Medical_Report?.report_id,
      appointment_id: a.appointment_id,
      diagnosis: a.Medical_Report?.diagnosis,
      treatment_plan: a.Medical_Report?.treatment_plan,
      appointment_date: a.Slot?.date,
      appointment_time: a.Slot?.start_time,
      patient_name: a.Patients?.Users?.username || 'Unknown',
      patient_phone: a.Patients?.Users?.phone_number,
      reason_for_visit: a.reason_for_visit,
      duration: a.duration
    }))

    const error = null

    if (error) throw error

    return res.json(reports)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

module.exports = router