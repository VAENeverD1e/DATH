const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const authMiddleware = require('../../middlewares/authMiddleware')
const { generateSlotsFromAvailability } = require('../service/slots.routes') // Import from slots.routes.js if needed

// GET /api/doctors/availability
router.get('/', async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Query Availability table where doctor_id matches
  // #TODO: Return list of availability records: availability_id, day_of_week, start_time, end_time
})

// POST /api/doctors/availability
router.post('/', async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get day_of_week, start_time, end_time from req.body
  // #TODO: Validate time range is valid (start_time < end_time)
  // #TODO: Insert into Availability table
  // #TODO: Generate 30-minute slots using generateSlotsFromAvailability() from slots.routes.js
  // #TODO: Create slot records in Slot table for multiple dates (next 30 days, etc.)
  // #TODO: Return success with new availability record: availability_id, doctor_id, day_of_week, start_time, end_time
})

// PATCH /api/doctors/availability/:id
router.patch('/:id', async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get availability_id from req.params.id
  // #TODO: Get updated fields from req.body (day_of_week, start_time, end_time)
  // #TODO: Query Availability table to verify availability_id exists and belongs to this doctor_id
  // #TODO: If not found or wrong doctor, return 403 error 'Not authorized'
  // #TODO: Update Availability table
  // #TODO: Return success with updated availability
})

// DELETE /api/doctors/availability/:id
router.delete('/:id', async (req, res) => {
  // #TODO: Use authMiddleware, check role='doctor' (add authMiddleware and requireRole to this route)
  // #TODO: Query Doctor table to get doctor_id from user_id (req.user.id)
  // #TODO: Get availability_id from req.params.id
  // #TODO: Query Availability table to verify availability_id exists and belongs to this doctor_id
  // #TODO: If not found or wrong doctor, return 403 error 'Not authorized'
  // #TODO: Delete from Availability table (cascade will handle related Slots if configured)
  // #TODO: Return success message
})

module.exports = router