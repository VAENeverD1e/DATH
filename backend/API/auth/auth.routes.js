const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// #TODO: Use authMiddleware to get req.user from JWT (add authMiddleware to /me route)
const { authMiddleware } = require('../../middlewares/authMiddleware')

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try { 
    const { username, email, password, phone_number, date_of_birth, address, gender, insurance_provider, insurance_number } = req.body
    
    // Comprehensive validation for all required fields
    const validationErrors = {}
    
    // Username: required, 3-30 chars, lowercase letters/numbers/underscores
    if (!username || !username.trim()) {
      validationErrors.username = 'Username is required'
    } else if (username.length < 3 || username.length > 30) {
      validationErrors.username = 'Username must be 3-30 characters'
    } else if (!/^[a-z0-9_]+$/.test(username)) {
      validationErrors.username = 'Username must contain only lowercase letters, numbers, and underscores'
    }
    
    // Email: required, valid format, normalized lowercase
    if (!email || !email.trim()) {
      validationErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      validationErrors.email = 'Invalid email format'
    }
    
    // Password: required, ≥8 chars, at least one letter and one number
    if (!password) {
      validationErrors.password = 'Password is required'
    } else if (password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Za-z]/.test(password)) {
      validationErrors.password = 'Password must contain at least one letter'
    } else if (!/[0-9]/.test(password)) {
      validationErrors.password = 'Password must contain at least one number'
    }
    
    // Phone: required, 7-20 chars, digits/+/-
    if (!phone_number || !phone_number.trim()) {
      validationErrors.phone_number = 'Phone number is required'
    } else if (!/^[\d+\-\s()]+$/.test(phone_number.trim())) {
      validationErrors.phone_number = 'Phone number must contain only digits, +, -, and spaces'
    } else if (phone_number.trim().replace(/[\s\-()]/g, '').length < 7 || phone_number.trim().replace(/[\s\-()]/g, '').length > 20) {
      validationErrors.phone_number = 'Phone number must be 7-20 digits'
    }
    
    // Date of birth: required, valid ISO date, age ≥ 13
    if (!date_of_birth || !date_of_birth.trim()) {
      validationErrors.date_of_birth = 'Date of birth is required'
    } else {
      const dob = new Date(date_of_birth)
      const today = new Date()
      if (isNaN(dob.getTime())) {
        validationErrors.date_of_birth = 'Invalid date format (use YYYY-MM-DD)'
      } else if (dob > today) {
        validationErrors.date_of_birth = 'Date of birth cannot be in the future'
      } else {
        const age = today.getFullYear() - dob.getFullYear()
        const monthDiff = today.getMonth() - dob.getMonth()
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age
        if (actualAge < 13) {
          validationErrors.date_of_birth = 'You must be at least 13 years old'
        }
      }
    }
    
    // Address: required, 5-200 chars
    if (!address || !address.trim()) {
      validationErrors.address = 'Address is required'
    } else if (address.trim().length < 5) {
      validationErrors.address = 'Address must be at least 5 characters'
    } else if (address.trim().length > 200) {
      validationErrors.address = 'Address must not exceed 200 characters'
    }
    
    // Gender: required, one of Male|Female|Other
    if (!gender || !gender.trim()) {
      validationErrors.gender = 'Gender is required'
    } else if (!['Male', 'Female', 'Other'].includes(gender)) {
      validationErrors.gender = 'Gender must be Male, Female, or Other'
    }
    
    // Insurance provider: required, 2-100 chars
    if (!insurance_provider || !insurance_provider.trim()) {
      validationErrors.insurance_provider = 'Insurance provider is required'
    } else if (insurance_provider.trim().length < 2) {
      validationErrors.insurance_provider = 'Insurance provider must be at least 2 characters'
    } else if (insurance_provider.trim().length > 100) {
      validationErrors.insurance_provider = 'Insurance provider must not exceed 100 characters'
    }
    
    // Insurance number: required, 4-50 chars, alphanumeric + hyphen
    if (!insurance_number || !insurance_number.trim()) {
      validationErrors.insurance_number = 'Insurance number is required'
    } else if (!/^[A-Za-z0-9-]{4,50}$/.test(insurance_number.trim())) {
      validationErrors.insurance_number = 'Insurance number must be 4-50 characters (letters, numbers, and hyphens only)'
    }
    
    // Return validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', fields: validationErrors })
    }
    
    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim().toLowerCase()

    // #TODO: Check if username or email already exists in Users table
    const { data: userByUsername, error: errUsername } = await supabase
      .from('Users')
      .select('id')
      .eq('username', normalizedUsername)
      .limit(1)

    if (errUsername) {
      return res.status(500).json({ error: 'Database error checking username' })
    }

    if (userByUsername && userByUsername.length > 0) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    const { data: userByEmail, error: errEmail } = await supabase
      .from('Users')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1)

    if (errEmail) {
      return res.status(500).json({ error: 'Database error checking email' })
    }

    if (userByEmail && userByEmail.length > 0) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    // #TODO: Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    // #TODO: Insert new user into Users table with role='patient'
    const newUserPayload = {
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      phone_number: phone_number.trim(),
      date_of_birth: date_of_birth.trim(),
      address: address.trim(),
      gender: gender.trim(),
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
    // NOTE: Patients.id is NOT identity, so we must provide id explicitly (same as user_id)
    const patientPayload = {
      id: userId,
      user_id: userId,
      insurance_provider: insurance_provider.trim(),
      insurance_number: insurance_number.trim()
    }

    const { error: insertPatientError } = await supabase
      .from('Patients')
      .insert([patientPayload])

    if (insertPatientError) {
      // Rollback: Delete the user record if patient creation fails
      console.error('Failed to create patient record. Error code:', insertPatientError.code)
      console.error('Error message:', insertPatientError.message)
      console.error('Error details:', insertPatientError.details)
      console.error('Full error:', JSON.stringify(insertPatientError, null, 2))
      await supabase
        .from('Users')
        .delete()
        .eq('id', userId)
      return res.status(500).json({ error: 'Failed to create patient profile' })
    }

    // #TODO: Generate JWT token with userId and role using process.env.JWT_SECRET
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error: missing JWT secret' })
    }

    const token = jwt.sign({ userId, role: 'patient' }, process.env.JWT_SECRET, {
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
      role: insertedUser.role,
      insurance_provider: patientPayload.insurance_provider,
      insurance_number: patientPayload.insurance_number
    }
    console.log('SafeUser object:', JSON.stringify(safeUser, null, 2))
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
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
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
        .from('Doctor')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
      if (!doctorError && Array.isArray(doctorData) && doctorData.length > 0) {
        profile.doctor = doctorData[0]
      }
    } else if (role === 'administrator' || role === 'admin') {
      const { data: adminData, error: adminError } = await supabase
        .from('Administrator')
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