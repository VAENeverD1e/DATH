import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { apiGet, apiPost, apiDelete } from "../api/client";

const backgroundImage = process.env.PUBLIC_URL + "/assets/artistic-blurry-colorful-wallpaper-background.jpg";
// Removed chart and appointments dummy data; focusing on doctor management only.

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  // Removed stats state (database has no stats aggregate table yet)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    specialization: "",
    license_number: "",
    years_of_experience: "",
    department_id: ""
  });

  // Fetch doctors & departments & stats
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [doctorData, deptData] = await Promise.all([
          apiGet('/api/admin/doctors', { auth: true }),
          apiGet('/api/departments')
        ]);
        setDoctors(doctorData);
        setDepartments(deptData);
      } catch (err) {
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddDoctor = async () => {
    try {
      setError("");
      const body = {
        username: newDoctor.username,
        email: newDoctor.email || null,
        password: newDoctor.password,
        phone_number: newDoctor.phone_number || null,
        specialization: newDoctor.specialization || null,
        license_number: newDoctor.license_number,
        years_of_experience: newDoctor.years_of_experience ? parseInt(newDoctor.years_of_experience, 10) : null,
        department_id: parseInt(newDoctor.department_id, 10)
      };
      const created = await apiPost('/api/admin/doctors', body, { auth: true });
      setDoctors(prev => [...prev, {
        doctor_id: created.doctor_id,
        username: created.username,
        email: created.email,
        phone_number: created.phone_number,
        specialization: created.specialization,
        license_number: created.license_number,
        years_of_experience: created.years_of_experience,
        department_id: created.department_id
      }]);
      setShowModal(false);
      setNewDoctor({
        username: "",
        email: "",
        password: "",
        phone_number: "",
        specialization: "",
        license_number: "",
        years_of_experience: "",
        department_id: ""
      });
    } catch (err) {
      setError(err.message || 'Failed to create doctor');
    }
  };

  const handleRemoveDoctor = async (doctor_id) => {
    try {
      setError("");
      await apiDelete(`/api/admin/doctors/${doctor_id}`, { auth: true });
      setDoctors(prev => prev.filter(d => d.doctor_id !== doctor_id));
    } catch (err) {
      setError(err.message || 'Failed to remove doctor');
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <NavBar />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          zIndex: 0,
        }}
      ></div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingLeft: "32px",
          paddingRight: "32px",
          fontFamily:
            "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        }}
      >
        {/* Header */}
        <div className="flex items-center mb-8 w-full relative" style={{ minHeight: "56px" }}>
          <span className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-blue-700 text-center w-max">
            Admin Dashboard
          </span>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Removed appointments and charts sections */}

        {/* Doctor Appointments (selected) */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Doctor Appointments</h2>
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={selectedDoctorId || ''}
                onChange={async (e) => {
                  const id = e.target.value || null;
                  setSelectedDoctorId(id);
                  setAppointments([]);
                  if (!id) return;
                  setLoadingAppointments(true);
                  try {
                    const appts = await apiGet(`/api/admin/doctors/${id}/appointments`, { auth: true });
                    setAppointments(appts);
                  } catch (err) {
                    setError(err.message || 'Failed to load doctor appointments');
                  } finally {
                    setLoadingAppointments(false);
                  }
                }}
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.doctor_id}>{d.username} (#{d.doctor_id})</option>
                ))}
              </select>
            </div>
          </div>
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Appt ID</th>
                <th className="px-3 py-2 text-left">Patient</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Start</th>
                <th className="px-3 py-2 text-left">End</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedDoctorId && appointments.map(a => (
                <tr key={a.appointment_id} className="border-b">
                  <td className="px-3 py-2">{a.appointment_id}</td>
                  <td className="px-3 py-2">{a.patient_name || '—'}</td>
                  <td className="px-3 py-2">{a.patient_phone || '—'}</td>
                  <td className="px-3 py-2">{a.date || '—'}</td>
                  <td className="px-3 py-2">{a.start_time || '—'}</td>
                  <td className="px-3 py-2">{a.end_time || '—'}</td>
                  <td className="px-3 py-2">{a.status}</td>
                </tr>
              ))}
              {selectedDoctorId && !loadingAppointments && !appointments.length && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-gray-500">No appointments for this doctor.</td>
                </tr>
              )}
              {!selectedDoctorId && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-gray-500">Select a doctor to view appointments.</td>
                </tr>
              )}
              {loadingAppointments && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Doctors Table */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Doctors in Hospital</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Add Doctor
            </button>
          </div>

          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Doctor ID</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">License</th>
                <th className="px-4 py-2 text-left">Specialization</th>
                <th className="px-4 py-2 text-left">Years</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.doctor_id} className="border-b">
                  <td className="px-4 py-2">{doc.doctor_id}</td>
                  <td className="px-4 py-2">{doc.username}</td>
                  <td className="px-4 py-2">{doc.email || '—'}</td>
                  <td className="px-4 py-2">{doc.license_number}</td>
                  <td className="px-4 py-2">{doc.specialization || '—'}</td>
                  <td className="px-4 py-2">{doc.years_of_experience ?? '—'}</td>
                  <td className="px-4 py-2">{doc.department_name || doc.department_id || '—'}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemoveDoctor(doc.doctor_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Doctor Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Add New Doctor</h2>
              <input
                type="text"
                placeholder="Username"
                value={newDoctor.username}
                onChange={(e) => setNewDoctor({ ...newDoctor, username: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="text"
                placeholder="Phone (optional)"
                value={newDoctor.phone_number}
                onChange={(e) => setNewDoctor({ ...newDoctor, phone_number: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="text"
                placeholder="Specialization (optional)"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="text"
                placeholder="License Number"
                value={newDoctor.license_number}
                onChange={(e) => setNewDoctor({ ...newDoctor, license_number: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="number"
                placeholder="Years of Experience (optional)"
                value={newDoctor.years_of_experience}
                onChange={(e) => setNewDoctor({ ...newDoctor, years_of_experience: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <select
                value={newDoctor.department_id}
                onChange={(e) => setNewDoctor({ ...newDoctor, department_id: e.target.value })}
                className="w-full border p-2 mb-4 rounded"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_id}>{d.name}</option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDoctor}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
