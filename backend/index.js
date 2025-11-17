require('dotenv').config()
const express = require('express')
const cors = require('cors')
const supabase = require('./supabaseClient')

const app = express()

// Import all route files
const authRoutes = require('./API/auth/auth.routes')
const doctorRoutes = require('./API/doctors/doctor.routes')
const availabilityRoutes = require('./API/doctors/availability.routes')
const reportRoutes = require('./API/doctors/report.routes')
const slotsRoutes = require('./API/service/slots.routes')
const appointmentsRoutes = require('./API/service/appointments.routes')
const patientRoutes = require('./API/patients/patient.routes')
const adminDoctorsRoutes = require('./API/admin/admin.routes')
const departmentsRoutes = require('./API/admin/departments.routes')

app.use(cors({ origin: 'http://localhost:3000' })) // allow your frontend origin
app.use(express.json())

// Mount all routes
app.use('/api/auth', authRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/doctors/availability', availabilityRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/slots', slotsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/patient', patientRoutes)
app.use('/api/admin/doctors', adminDoctorsRoutes)
app.use('/api/departments', departmentsRoutes)

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend API listening on ${port}`))