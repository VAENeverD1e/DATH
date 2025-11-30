const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const { authMiddleware, requireRole } = require('../../middlewares/authMiddleware')
const { generateSlotsFromAvailability } = require('../service/slots.routes') // Import from slots.routes.js if needed

// Helper: Create array of next dates for a given day of week
function getNextDatesForDay(dayName, weeks = 4) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const targetDayIndex = days.indexOf(dayName)
  if (targetDayIndex === -1) return []

  const dates = []
  const today = new Date()
  
  // start checking from tomorrow
  let currentDate = new Date(today)
  currentDate.setDate(today.getDate() + 1) 

  while (dates.length < weeks) {
    if (currentDate.getDay() === targetDayIndex) {
      dates.push(new Date(currentDate))
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return dates
}

// Helper: Create 30 minutes time slots
function generateTimeSlots(startTimeStr, endTimeStr) {
  const slots = []
  const slotDuration = 30
  
  const [startH, startM] = startTimeStr.split(':').map(Number)
  const [endH, endM] = endTimeStr.split(':').map(Number)
  
  let currentMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  
  while (currentMinutes + slotDuration <= endMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
    
    const endMins = currentMinutes + slotDuration
    const endH = Math.floor(endMins / 60)
    const endM_val = endMins % 60
    const endStr = `${String(endH).padStart(2, '0')}:${String(endM_val).padStart(2, '0')}:00`
    
    slots.push({ start_time: startStr, end_time: endStr })
    currentMinutes += slotDuration
  }
  return slots
}

// GET /api/doctors/availability
router.get('/', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    // Get doctor_id from user_id
    const { data: doctor, error: docError } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()
    
    if (docError || !doctor) return res.status(404).json({ error: 'Doctor profile not found' })

    // Query Availability
    const { data: availabilities, error } = await supabase
      .from('Availability')
      .select('*')
      .eq('doctor_id', doctor.doctor_id)

    if (error) throw error
    return res.json(availabilities)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// POST /api/doctors/availability
router.post('/', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const { day_of_week, start_time, end_time } = req.body
    
    // Validate time
    if (start_time >= end_time) {
      return res.status(400).json({ error: 'Start time must be before end time' })
    }

    // 1. Get doctor_id from user_id
    const { data: doctor, error: docError } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()
    
    if (docError || !doctor) return res.status(404).json({ error: 'Doctor profile not found' })

    // 2. Insert Availability
    const { data: newAvail, error: insertError } = await supabase
      .from('Availability')
      .insert([{
        doctor_id: doctor.doctor_id,
        day_of_week,
        start_time,
        end_time
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // 3. Generate Slots for the next 4 weeks
    const targetDates = getNextDatesForDay(day_of_week, 4) // get 4 corresponding days in the future
    const timeSlots = generateTimeSlots(start_time, end_time)
    
    const slotsToInsert = []
    
    targetDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0] // Format YYYY-MM-DD
      timeSlots.forEach(ts => {
        slotsToInsert.push({
          availability_id: newAvail.availability_id,
          date: dateStr,
          start_time: ts.start_time,
          end_time: ts.end_time,
          status: 'available'
        })
      })
    })

    // 4. Bulk Insert into Slot table
    if (slotsToInsert.length > 0) {
      const { error: slotError } = await supabase
        .from('Slot')
        .insert(slotsToInsert)
      
      if (slotError) {
        console.error('Error creating slots:', slotError)
      }
    }

    return res.status(201).json(newAvail)

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// PATCH /api/doctors/availability/:id
router.patch('/:id', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const availabilityId = req.params.id
    const updates = req.body // { day_of_week, start_time, end_time }

    // 1. Get doctor_id
    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()

    if (!doctor) return res.status(403).json({ error: 'Not authorized' })

    // 2. Verify ownership & Update Availability

    const { data, error } = await supabase
      .from('Availability')
      .update(updates)
      .eq('availability_id', availabilityId)
      .eq('doctor_id', doctor.doctor_id) // Security check
      .select()

    if (error) throw error
    if (!data || data.length === 0) return res.status(404).json({ error: 'Availability not found or permission denied' })

    return res.json(data[0])

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

// DELETE /api/doctors/availability/:id
router.delete('/:id', authMiddleware, requireRole('doctor'), async (req, res) => {
  try {
    const availabilityId = req.params.id
    
    // 1. Get doctor_id
    const { data: doctor } = await supabase
      .from('Doctor')
      .select('doctor_id')
      .eq('user_id', req.user.id)
      .single()

    // 2. Delete
    
    const { error } = await supabase
      .from('Availability')
      .delete()
      .eq('availability_id', availabilityId)
      .eq('doctor_id', doctor.doctor_id)

    if (error) throw error

    return res.json({ message: 'Availability deleted successfully' })

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

module.exports = router