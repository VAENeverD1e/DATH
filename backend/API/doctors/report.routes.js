const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
// const authMiddleware = require('../../middlewares/authMiddleware')

// POST /api/reports (create medical report for appointment)
router.post('/', async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get appointment_id, diagnosis, treatment_plan from req.body
  // #TODO: Query Appointment table to verify appointment_id exists and belongs to this doctor_id
  // #TODO: If not found or wrong doctor, return 403 error 'Not authorized'
  // #TODO: Check if Medical_Report already exists for this appointment_id (it's UNIQUE)
  // #TODO: Insert into Medical_Report table with appointment_id, diagnosis, treatment_plan
  // #TODO: Update Appointment status to 'Completed'
  // #TODO: Return success with report details: report_id, appointment_id, diagnosis, treatment_plan
})

// GET /api/reports/:appointmentId (get report for an appointment)
router.get('/:appointmentId', async (req, res) => {
  // #TODO: Use authMiddleware (add authMiddleware to this route)
  // #TODO: Get appointment_id from req.params.appointmentId
  // #TODO: Query Medical_Report table where appointment_id matches
  // #TODO: If not found, return 404 error 'Report not found'
  // #TODO: Query Appointment table to get doctor_id and patient_id
  // #TODO: Verify user has permission: either doctor who created it, or patient of that appointment (check req.user.id against user_id from Doctor/Patients table)
  // #TODO: If not authorized, return 403 error 'Not authorized'
  // #TODO: Return report details: report_id, appointment_id, diagnosis, treatment_plan
})

module.exports = router