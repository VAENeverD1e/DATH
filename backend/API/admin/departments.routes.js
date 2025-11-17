const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
// const authMiddleware = require('../../middlewares/authMiddleware')

// GET /api/departments
router.get('/', async (req, res) => {
  // #TODO: Query Department table
  // #TODO: Return list of all departments (id, name, description)
})

// POST /api/departments
router.post('/', async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin'
  // #TODO: Get name, description from req.body
  // #TODO: Insert into Department table
  // #TODO: Return success with new department
})

// PATCH /api/departments/:id
router.patch('/:id', async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin'
  // #TODO: Get department id from req.params.id
  // #TODO: Get updated fields from req.body
  // #TODO: Update Department table
  // #TODO: Return success
})

// DELETE /api/departments/:id
router.delete('/:id', async (req, res) => {
  // #TODO: Use authMiddleware, check role='admin'
  // #TODO: Get department id from req.params.id
  // #TODO: Delete from Department table
  // #TODO: Return success
})

module.exports = router