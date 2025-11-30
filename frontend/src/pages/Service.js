import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, getAuth } from '../api/client';

// Helper to get minimum date (today)
const getMinDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const ServicePage = () => {
  const navigate = useNavigate();

  // Form states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');

  // Data states
  const [allDoctors, setAllDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  // UI states
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Load all doctors on mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsLoadingDoctors(true);
        setError('');

        // Fetch all doctors from backend
        const doctors = await apiGet('/api/doctors');

        setAllDoctors(doctors);

        // Extract unique specialties
        const uniqueSpecialties = [...new Set(doctors.map((d) => d.specialization))];
        setSpecialties(uniqueSpecialties.sort());
      } catch (err) {
        console.error('Failed to load doctors:', err);
        setError(err.message || 'Failed to load doctors. Please try again.');
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);

  // Handle search button click
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFilteredDoctors([]);
    setAvailableSlots([]);
    setSelectedSlot('');
    setSelectedDoctor(null);

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    // Filter doctors by specialty if selected
    let filtered = allDoctors;
    if (selectedSpecialty) {
      filtered = filtered.filter((doc) => doc.specialization === selectedSpecialty);
    }

    setFilteredDoctors(filtered);

    if (filtered.length === 0) {
      setError(
        `No doctors available${selectedSpecialty ? ` for ${selectedSpecialty}` : ''} on ${selectedDate}. Please try another date or specialty.`
      );
    }
  };

  // Load available slots when doctor is selected
  const handleDoctorSelect = async (doctor) => {
    try {
      setIsLoadingSlots(true);
      setError('');
      setAvailableSlots([]);
      setSelectedSlot('');

      setSelectedDoctor(doctor);

      // Fetch available slots for this doctor and date
      const slots = await apiGet(
        `/api/slots/available?doctor_id=${doctor.doctor_id}&date=${selectedDate}`
      );

      setAvailableSlots(slots);

      if (slots.length === 0) {
        setError(`No available time slots for ${doctor.username} on ${selectedDate}`);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
      setError(err.message || 'Failed to load available slots. Please try again.');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Book appointment
  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot || !reasonForVisit) {
      setError('Please select a doctor, time slot, and provide a reason for visit');
      return;
    }

    // Find the slot_id from selected slot
    const slotData = availableSlots.find((s) => s.time === selectedSlot);
    if (!slotData) {
      setError('Invalid slot selected');
      return;
    }

    try {
      setIsBooking(true);
      setError('');

      // Call backend to book appointment
      const response = await apiPost(
        '/api/appointments',
        {
          doctor_id: selectedDoctor.doctor_id,
          slot_id: slotData.slot_id,
          reason_for_visit: reasonForVisit,
          duration: 30,
        },
        { auth: true }
      );

      setSuccessMsg(
        `Appointment booked successfully with ${selectedDoctor.username} on ${selectedDate} at ${selectedSlot}`
      );

      // Reset form
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedDate('');
        setSelectedSpecialty('');
        setReasonForVisit('');
        setFilteredDoctors([]);
        setAvailableSlots([]);
        setSelectedSlot('');
        setSelectedDoctor(null);

        // Navigate to appointments dashboard
        navigate('/appointment-dashboard', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Failed to book appointment:', err);
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Book an Appointment
        </h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✓ {successMsg}
          </div>
        )}

        {/* Step 1: Select Date and Specialty */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Appointment Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
                min={getMinDate()}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Medical Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoadingDoctors}
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoadingDoctors}
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingDoctors ? 'Loading doctors...' : 'Find Available Doctors'}
          </button>
        </form>

        {/* Step 2: Select Doctor */}
        {filteredDoctors.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Available Doctors on {selectedDate}
              {selectedSpecialty && ` - ${selectedSpecialty}`}
            </h2>
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.doctor_id}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedDoctor?.doctor_id === doctor.doctor_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Dr. {doctor.username}
                      </h3>
                      <p className="text-gray-600">{doctor.specialization}</p>
                      <p className="text-sm text-gray-500">
                        License: {doctor.license_number} | {doctor.years_of_experience} years experience
                      </p>
                      <p className="text-sm text-gray-500">{doctor.email}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          selectedDoctor?.doctor_id === doctor.doctor_id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {selectedDoctor?.doctor_id === doctor.doctor_id ? 'Selected' : 'Select'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Time Slot */}
        {selectedDoctor && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Select a Time Slot
            </h2>

            {isLoadingSlots ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading available slots...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-3 rounded-lg border-2 transition font-medium ${
                        selectedSlot === slot.time
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit *
                    </label>
                    <textarea
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder="Briefly describe your reason for visiting..."
                      className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                )}

                {selectedSlot && reasonForVisit && (
                  <button
                    onClick={handleBook}
                    disabled={isBooking}
                    className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-600">
                No available slots for the selected date. Please try another date or doctor.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicePage;
