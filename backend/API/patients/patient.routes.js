const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
// const authMiddleware = require('../../middlewares/authMiddleware')

// GET /api/patient/me
router.get('/me', async (req, res) => {
  // #TODO: Use authMiddleware to get user_id from req.user (add authMiddleware to this route)
  // #TODO: Query Patients table where user_id matches
  // #TODO: Join with Users table to get user info
  // #TODO: Return patient profile: id, username, email, phone_number, date_of_birth, address, gender, insurance_provider, insurance_number
})

// PATCH /api/patient/me
router.patch('/me', async (req, res) => {
  // #TODO: Use authMiddleware to get user_id from req.user (add authMiddleware to this route)
  // #TODO: Get updated fields from req.body (email, phone_number, date_of_birth, address, gender, insurance_provider, insurance_number)
  // #TODO: Update Users table with user info fields (email, phone_number, date_of_birth, address, gender)
  // #TODO: Update Patients table with insurance info (insurance_provider, insurance_number)
  // #TODO: Return success with updated profile
})

module.exports = router