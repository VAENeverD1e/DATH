const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, phone_number, date_of_birth, address, gender } = req.body
  // #TODO: Validate required fields (username, password are required)
  // #TODO: Check if username or email already exists in Users table
  // #TODO: Hash the password using bcrypt
  // #TODO: Insert new user into Users table with role='patient'
  // #TODO: Get the new user's id from the insert result
  // #TODO: Insert into Patients table with user_id (optionally insurance_provider, insurance_number)
  // #TODO: Generate JWT token with userId and role using process.env.JWT_SECRET
  // #TODO: Return success response with token and user info (exclude password)
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  // #TODO: Get username (or email) and password from req.body
  // #TODO: Find user in Users table by username or email
  // #TODO: If user not found, return 401 error with message 'Invalid credentials'
  // #TODO: Compare password with stored hash using bcrypt.compare()
  // #TODO: If password wrong, return 401 error with message 'Invalid credentials'
  // #TODO: Generate JWT token with userId and role using jwt.sign() and process.env.JWT_SECRET
  // #TODO: Return success response with token and user info (id, username, email, role - exclude password)
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  // #TODO: Use authMiddleware to get req.user from JWT (add authMiddleware to this route)
  // #TODO: Query Users table by id from req.user.id
  // #TODO: Based on role, join with Patients/Doctor/Administrator table to get additional info
  // #TODO: Return user profile data (exclude password)
})

module.exports = router