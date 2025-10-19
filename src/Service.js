import React, { useState } from 'react';

const dummyDoctors = [
  { id: 1, name: 'Dr. John Doe', specialty: 'Cardiology', availableDates: ['2025-10-20', '2025-10-21', '2025-10-23'] },
  { id: 2, name: 'Dr. Jane Smith', specialty: 'Neurology', availableDates: ['2025-10-21', '2025-10-22', '2025-10-24'] },
  { id: 3, name: 'Dr. Michael Johnson', specialty: 'Pediatrics', availableDates: ['2025-10-20', '2025-10-22', '2025-10-25'] },
  { id: 4, name: 'Dr. Emily Davis', specialty: 'Dermatology', availableDates: ['2025-10-23', '2025-10-24', '2025-10-25'] },
  { id: 5, name: 'Dr. Robert Wilson', specialty: 'Orthopedics', availableDates: ['2025-10-20', '2025-10-21', '2025-10-22'] },
  { id: 6, name: 'Dr. Sarah Brown', specialty: 'Gastroenterology', availableDates: ['2025-10-21', '2025-10-23', '2025-10-24'] },
  { id: 7, name: 'Dr. David Lee', specialty: 'Oncology', availableDates: ['2025-10-20', '2025-10-22', '2025-10-25'] },
  { id: 8, name: 'Dr. Lisa Patel', specialty: 'Pulmonology', availableDates: ['2025-10-21', '2025-10-23', '2025-10-24'] },
  { id: 9, name: 'Dr. James Kim', specialty: 'Endocrinology', availableDates: ['2025-10-20', '2025-10-22', '2025-10-25'] },
  { id: 10, name: 'Dr. Anna White', specialty: 'Psychiatry', availableDates: ['2025-10-21', '2025-10-24', '2025-10-25'] },
];

const medicalFields = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Gastroenterology',
  'Oncology',
  'Pulmonology',
  'Endocrinology',
  'Psychiatry',
];

const ServicePage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [bookedDoctor, setBookedDoctor] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const avail = dummyDoctors.filter((doc) =>
      doc.availableDates.includes(selectedDate) &&
      (selectedSpecialty === '' || doc.specialty === selectedSpecialty)
    );
    setAvailableDoctors(avail);
  };

  const handleBook = (doctor) => {
    setBookedDoctor(doctor);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setBookedDoctor(null);
    }, 5000); // Hide after 5 seconds
  };

  return (
    <section className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Book an Appointment
        </h1>

        {/* Appointment Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-12 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Appointment Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
              min="2025-10-19" // Start from tomorrow relative to current date
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
            >
              <option value="">All Specialties</option>
              {medicalFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition font-semibold"
          >
            Find Available Doctors
          </button>
        </form>

        {/* Available Doctors List */}
        {availableDoctors.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Available Doctors on {selectedDate}
              {selectedSpecialty && ` for ${selectedSpecialty}`}
            </h2>
            <ul className="space-y-6">
              {availableDoctors.map((doc) => (
                <li
                  key={doc.id}
                  className="flex justify-between items-center border-b pb-4 last:border-b-0"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {doc.name}
                    </h3>
                    <p className="text-gray-600">{doc.specialty}</p>
                  </div>
                  <button
                    onClick={() => handleBook(doc)}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition font-medium"
                  >
                    Book
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : selectedDate ? (
          <p className="text-center text-gray-600 text-lg">
            No doctors available for the selected date
            {selectedSpecialty && ` and specialty (${selectedSpecialty})`}. Please try another combination.
          </p>
        ) : null}

        {/* Notification Box */}
        {showNotification && (
          <div className="fixed top-20 right-6 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg z-50">
            <p className="font-semibold">Appointment Booked!</p>
            <p>
              Your appointment with {bookedDoctor?.name} on {selectedDate} has
              been booked successfully.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicePage;
