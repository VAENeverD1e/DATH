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
router.get('/available', async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    if (!doctor_id || !date) {
      return res.status(400).json({
        message: 'doctor_id and date are required',
        example: '/api/slots/available?doctor_id=5&date=2025-11-25'
      });
    }

    const dayName = new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      timeZone: 'Asia/Ho_Chi_Minh'
    });

    const { data: availabilities, error: availError } = await supabase
      .from('Availability')
      .select('availability_id, start_time, end_time')
      .eq('doctor_id', doctor_id)
      .eq('day_of_week', dayName);

    if (availError) throw availError;
    if (!availabilities || availabilities.length === 0) {
      return res.json([]);
    }

    let allAvailableSlots = [];

    for (const avail of availabilities) {
      const theoreticalSlots = generateSlotsFromAvailability(avail.start_time, avail.end_time);

      const { data: existingSlots } = await supabase
        .from('Slot')
        .select('slot_id, start_time, end_time, status')
        .eq('availability_id', avail.availability_id)
        .eq('date', date);

      if (existingSlots && existingSlots.length > 0) {
        const available = existingSlots
          .filter(s => s.status === 'available')
          .map(s => ({
            slot_id: s.slot_id,
            time: `${s.start_time} - ${s.end_time}`
          }));
        allAvailableSlots.push(...available);
      } else {
        const generated = theoreticalSlots.map(slot => ({
          slot_id: null,
          time: `${slot.start_time} - ${slot.end_time}`
        }));
        allAvailableSlots.push(...generated);
      }
    }

    allAvailableSlots.sort((a, b) => a.time.localeCompare(b.time));

    res.json(allAvailableSlots);

  } catch (error) {
    console.error('Error in /slots/available:', error);
    res.status(500).json({ message: 'Failed to load available time slots' });
  }
});


module.exports = router