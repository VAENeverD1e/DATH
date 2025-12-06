import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client";

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

  // Department management state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "" });
  const [editingDepartment, setEditingDepartment] = useState(null);

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
      
      // Validate required fields
      if (!newDoctor.email || !newDoctor.email.trim()) {
        setError("Email is required for doctor login");
        return;
      }
      if (!newDoctor.username || !newDoctor.username.trim()) {
        setError("Username is required");
        return;
      }
      if (!newDoctor.password) {
        setError("Password is required");
        return;
      }
      if (!newDoctor.license_number || !newDoctor.license_number.trim()) {
        setError("License number is required");
        return;
      }
      if (!newDoctor.department_id) {
        setError("Department is required");
        return;
      }
      
      const body = {
        username: newDoctor.username,
        email: newDoctor.email,
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

  // Department management handlers
  const handleAddDepartment = async () => {
    try {
      setError("");
      if (!newDepartment.name || !newDepartment.name.trim()) {
        setError("Department name is required");
        return;
      }
      const created = await apiPost('/api/departments', { name: newDepartment.name.trim() }, { auth: true });
      setDepartments(prev => [...prev, created]);
      setShowDeptModal(false);
      setNewDepartment({ name: "" });
    } catch (err) {
      setError(err.message || 'Failed to create department');
    }
  };

  const handleEditDepartment = async () => {
    try {
      setError("");
      if (!editingDepartment.name || !editingDepartment.name.trim()) {
        setError("Department name is required");
        return;
      }
      const updated = await apiPatch(
        `/api/departments/${editingDepartment.department_id}`,
        { name: editingDepartment.name.trim() },
        { auth: true }
      );
      setDepartments(prev => prev.map(d => d.department_id === updated.department_id ? updated : d));
      setShowEditDeptModal(false);
      setEditingDepartment(null);
    } catch (err) {
      setError(err.message || 'Failed to update department');
    }
  };

  const handleRemoveDepartment = async (department_id) => {
    try {
      setError("");
      await apiDelete(`/api/departments/${department_id}`, { auth: true });
      setDepartments(prev => prev.filter(d => d.department_id !== department_id));
    } catch (err) {
      setError(err.message || 'Failed to remove department');
    }
  };

  const openEditDepartment = (dept) => {
    setEditingDepartment({ ...dept });
    setShowEditDeptModal(true);
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

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading dashboard...</div>
          </div>
        )}

        {/* Removed appointments and charts sections */}

        {!loading && (
          <>
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

        {/* Department Management */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Departments</h2>
            <button
              onClick={() => setShowDeptModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              + Add Department
            </button>
          </div>

          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.department_id} className="border-b">
                  <td className="px-4 py-2">{dept.department_id}</td>
                  <td className="px-4 py-2">{dept.name}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openEditDepartment(dept)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveDepartment(dept.department_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                    No departments yet. Add one to get started.
                  </td>
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
                placeholder="Username *"
                value={newDoctor.username}
                onChange={(e) => setNewDoctor({ ...newDoctor, username: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email * (required for login)"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
                required
              />
              <input
                type="password"
                placeholder="Password *"
                value={newDoctor.password}
                onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
                required
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
                placeholder="License Number *"
                value={newDoctor.license_number}
                onChange={(e) => setNewDoctor({ ...newDoctor, license_number: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
                required
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
                onChange={(e) => {
                  const deptId = e.target.value;
                  const selectedDept = departments.find(d => d.department_id === parseInt(deptId));
                  setNewDoctor({ 
                    ...newDoctor, 
                    department_id: deptId,
                    specialization: selectedDept ? selectedDept.name : ''
                  });
                }}
                className="w-full border p-2 mb-2 rounded"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_id}>{d.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Specialization (auto-filled from department)"
                value={newDoctor.specialization}
                readOnly
                className="w-full border p-2 mb-4 rounded bg-gray-100 cursor-not-allowed"
                title="Specialization is automatically set based on the selected department"
              />

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
          </>
        )}

        {/* Add Department Modal */}
        {showDeptModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Add New Department</h2>
              <input
                type="text"
                placeholder="Department Name *"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ name: e.target.value })}
                className="w-full border p-2 mb-4 rounded"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowDeptModal(false);
                    setNewDepartment({ name: "" });
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {showEditDeptModal && editingDepartment && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-4">Edit Department</h2>
              <input
                type="text"
                placeholder="Department Name *"
                value={editingDepartment.name}
                onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                className="w-full border p-2 mb-4 rounded"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowEditDeptModal(false);
                    setEditingDepartment(null);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditDepartment}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
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
