const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// #TODO: Use authMiddleware to get req.user from JWT (add authMiddleware to /me route)
const { authMiddleware } = require('../../middlewares/authMiddleware')

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try { const { username, email, password, phone_number, date_of_birth, address, gender, insurance_provider, insurance_number } = req.body
    // #TODO: Validate required fields (username, password are required)
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' })
    }

    // #TODO: Check if username or email already exists in Users table
    const { data: userByUsername, error: errUsername } = await supabase
      .from('Users')
      .select('id')
      .eq('username', username)
      .limit(1)

    if (errUsername) {
      return res.status(500).json({ error: 'Database error checking username' })
    }

    if (userByUsername && userByUsername.length > 0) {
      return res.status(409).json({ error: 'Username already exists' })
    }

      if (email) {
      const { data: userByEmail, error: errEmail } = await supabase
        .from('Users')
        .select('id')
        .eq('email', email)
        .limit(1)

      if (errEmail) {
        return res.status(500).json({ error: 'Database error checking email' })
      }

      if (userByEmail && userByEmail.length > 0) {
        return res.status(409).json({ error: 'Email already exists' })
      }
    }

    // #TODO: Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // #TODO: Insert new user into Users table with role='patient'
    const newUserPayload = {
      username,
      email: email || null,
      password: hashedPassword,
      phone_number: phone_number || null,
      date_of_birth: date_of_birth || null,
      address: address || null,
      gender: gender || null,
      role: 'patient'
    }

    const { data: insertedUser, error: insertUserError } = await supabase
      .from('Users')
      .insert([newUserPayload])
      .select()
      .single()

    if (insertUserError || !insertedUser) {
      return res.status(500).json({ error: 'Failed to create user' })
    }

    // #TODO: Get the new user's id from the insert result
    const userId = insertedUser.id

    // #TODO: Insert into Patients table with user_id (optionally insurance_provider, insurance_number)
    const patientPayload = {
      user_id: userId,
      insurance_provider: insurance_provider || null,
      insurance_number: insurance_number || null
    }

    const { error: insertPatientError } = await supabase
      .from('Patients')
      .insert([patientPayload])

    if (insertPatientError) {
      // Log the error server-side and continue; user was created
      console.error('Failed to create patient record:', insertPatientError)
    }

    // #TODO: Generate JWT token with userId and role using process.env.JWT_SECRET
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error: missing JWT secret' })
    }

    const token = jwt.sign({ id: userId, role: 'patient' }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    // #TODO: Return success response with token and user info (exclude password)
    const safeUser = {
      id: userId,
      username: insertedUser.username,
      email: insertedUser.email,
      phone_number: insertedUser.phone_number,
      date_of_birth: insertedUser.date_of_birth,
      address: insertedUser.address,
      gender: insertedUser.gender,
      role: insertedUser.role
    }
    return res.status(201).json({ token, user: safeUser })
  } catch (error) {
    console.error('Error in /register:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try { const { username, email, password } = req.body
    // #TODO: Get username (or email) and password from req.body
    if ((!username && !email) || !password) {
      return res.status(400).json({ error: 'username/email and password are required' })
    }

    // #TODO: Find user in Users table by username or email
    let data, error
    if (username) {
      ;({ data, error } = await supabase.from('Users').select().eq('username', username).limit(1))
    } else {
      ;({ data, error } = await supabase.from('Users').select().eq('email', email).limit(1))
    }

    if (error) {
      return res.status(500).json({ error: 'Database error checking user' })
    }

    // #TODO: If user not found, return 401 error with message 'Invalid credentials'
    const user = Array.isArray(data) && data.length > 0 ? data[0] : null
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // #TODO: Compare password with stored hash using bcrypt.compare()
    const match = await bcrypt.compare(password, user.password || '')

    // #TODO: If password wrong, return 401 error with message 'Invalid credentials'
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // #TODO: Generate JWT token with userId and role using jwt.sign() and process.env.JWT_SECRET
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error: missing JWT secret' })
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    // #TODO: Return success response with token and user info (id, username, email, role - exclude password)
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
      address: user.address,
      gender: user.gender,
      role: user.role
    }

    return res.status(200).json({ token, user: safeUser })
  } catch (error) {
    console.error('Error in /login:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // #TODO: Query Users table by id from req.user.id
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('id, username, email, phone_number, date_of_birth, address, gender, role')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' })
    }

    const profile = { ...userData }
    // #TODO: Based on role, join with Patients/Doctor/Administrator table to get additional info
    const role = (userData.role || '').toLowerCase()
    if (role === 'patient') {
      const { data: patientData, error: patientError } = await supabase
        .from('Patients')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
      if (!patientError && Array.isArray(patientData) && patientData.length > 0) {
        profile.patient = patientData[0]
      }
    } else if (role === 'doctor' || role === 'physician') {
      const { data: doctorData, error: doctorError } = await supabase
        .from('Doctors')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
      if (!doctorError && Array.isArray(doctorData) && doctorData.length > 0) {
        profile.doctor = doctorData[0]
      }
    } else if (role === 'administrator' || role === 'admin') {
      const { data: adminData, error: adminError } = await supabase
        .from('Administrators')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
      if (!adminError && Array.isArray(adminData) && adminData.length > 0) {
        profile.administrator = adminData[0]
      }
    }
    
    // #TODO: Return user profile data (exclude password)
    return res.status(200).json({ user: profile })
  } catch (error) {
    console.error('Error in /me:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = router