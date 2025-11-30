const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const { authMiddleware } = require('../../middlewares/authMiddleware')


// GET /api/patient/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id // Use authMiddleware to get user_id

    // Query Patients table where user_id matches,
    // Join with Users table to get user info using FK relationship
    let { data, error } = await supabase
      .from('Patients')
      .select(`
        id,
        insurance_provider,
        insurance_number,
        Users!user_id (
          username,
          email,
          phone_number,
          date_of_birth,
          address,
          gender
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw error
    }

    // Return patient profile: id, username, email, phone_number, date_of_birth, address, gender, insurance_provider, insurance_number
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


// PATCH /api/patient/me
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id // Use authMiddleware to get user_id from req.user

    // Get updated fields from req.body
    const {
      email,
      phone_number,
      date_of_birth,
      address,
      gender,
      insurance_provider,
      insurance_number,
    } = req.body

    // Update Users table with user info fields
    const { error: userError } = await supabase
      .from('Users')
      .update({ email, phone_number, date_of_birth, address, gender })
      .eq('id', userId)

    if (userError) {
      throw userError
    }

    // Update Patients table with insurance info
    const { error: patientError } = await supabase
      .from('Patients')
      .update({ insurance_provider, insurance_number })
      .eq('user_id', userId)

    if (patientError) {
      throw patientError
    }

    // Return success with updated profile
    res.json({
      success: true,
      profile: {
        email,
        phone_number,
        date_of_birth,
        address,
        gender,
        insurance_provider,
        insurance_number,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router