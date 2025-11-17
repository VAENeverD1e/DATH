const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
// const authMiddleware = require('../../middlewares/authMiddleware')

// GET /api/admin/doctors
router.get('/doctors', async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table, join with Users (on user_id) and Department (on department_id)
  // #TODO: Return list of all doctors with: doctor_id, username, email, phone_number, specialization, license_number, years_of_experience, department name
})

// POST /api/admin/doctors
router.post('/doctors', async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin' (add authMiddleware and requireRole to this route)
  // #TODO: Get username, email, password, phone_number, date_of_birth, address, gender, department_id, specialization, license_number, years_of_experience from req.body
  // #TODO: Validate required fields (username, password, license_number, department_id are required)
  // #TODO: Check if username or license_number already exists
  // #TODO: Hash password using bcrypt
  // #TODO: Insert into Users table with role='doctor'
  // #TODO: Get new user_id from insert result
  // #TODO: Insert into Doctor table with user_id, specialization, license_number, years_of_experience, department_id
  // #TODO: Return success with new doctor info (exclude password)
})

// PATCH /api/admin/doctors/:id
router.patch('/doctors/:id', async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin' (add authMiddleware and requireRole to this route)
  // #TODO: Get doctor_id from req.params.id
  // #TODO: Get updated fields from req.body (username, email, phone_number, specialization, license_number, years_of_experience, department_id)
  // #TODO: Query Doctor table to get user_id for this doctor_id
  // #TODO: If username or license_number changed, check they don't conflict with existing records
  // #TODO: Update Users table with user info fields
  // #TODO: Update Doctor table with doctor-specific fields
  // #TODO: Return success with updated doctor info
})

// DELETE /api/admin/doctors/:id
router.delete('/doctors/:id', async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin' (add authMiddleware and requireRole to this route)
  // #TODO: Get doctor_id from req.params.id
  // #TODO: Query Doctor table to get user_id for this doctor_id
  // #TODO: Delete from Doctor table first (due to foreign key constraints)
  // #TODO: Delete from Users table
  // #TODO: Handle any foreign key constraint errors gracefully (e.g., if doctor has appointments)
  // #TODO: Return success message
})

module.exports = router