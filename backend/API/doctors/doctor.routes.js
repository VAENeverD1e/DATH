const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')

// GET /api/doctors
router.get('/', async (req, res) => {
  // #TODO: Get optional query param: department_id from req.query
  // #TODO: Query Doctor table, join with Users (on user_id) and Department (on department_id)
  // #TODO: If department_id provided, filter by it
  // #TODO: Return list of doctors with: doctor_id, username, email, specialization, license_number, years_of_experience, department name
})

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  // #TODO: Get doctor_id from req.params.id
  // #TODO: Query Doctor table by doctor_id, join with Users (on user_id) and Department (on department_id)
  // #TODO: If not found, return 404 with message 'Doctor not found'
  // #TODO: Return doctor details: doctor_id, username, email, phone_number, specialization, license_number, years_of_experience, department name
})

module.exports = router