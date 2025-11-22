const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')

// Helper function to generate 30-minute slots from availability
// e.g., 9:00 AM - 12:00 PM becomes [9:00-9:30, 9:30-10:00, 10:00-10:30, ...]
function generateSlotsFromAvailability(startTime, endTime) {
  const slots = []
  const slotDuration = 30 // minutes

  // Parse time strings (format: "HH:MM")
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  while (currentMinutes + slotDuration <= endMinutes) {
    const slotStart = new Date(0, 0, 0, 0, currentMinutes)
    const slotEnd = new Date(0, 0, 0, 0, currentMinutes + slotDuration)

    const startStr = String(slotStart.getHours()).padStart(2, '0') + ':' + String(slotStart.getMinutes()).padStart(2, '0')
    const endStr = String(slotEnd.getHours()).padStart(2, '0') + ':' + String(slotEnd.getMinutes()).padStart(2, '0')

    slots.push({
      start_time: startStr,
      end_time: endStr
    })

    currentMinutes += slotDuration
  }

  return slots
}

// Helper function to convert day name to day of week number (0-6, Sunday-Saturday)
function getDayOfWeekNumber(dayName) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days.indexOf(dayName)
}

// #TODO: GET /api/slots?doctor_id=...&date=...
// TODO: Query availability for the given doctor and date
// TODO: Filter available slots (status='available')
// TODO: Return list of available slots
// router.get('/', async (req, res) => {
//   try {
//     const { doctor_id, date } = req.query
//     // TODO: Implement slot retrieval and filtering logic
//   } catch (error) {
//     return res.status(500).json({ error: error.message })
//   }
// })

module.exports = router