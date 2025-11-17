import React, { useState, useEffect } from "react";

// Backend API base URL
const API_BASE_URL = 'http://localhost:4000';

// This PlayGround now talks to the backend proxy endpoints at /api/playground/*
const apiGet = async (module) => {
	const res = await fetch(`${API_BASE_URL}/api/playground/${module}`);
	const json = await res.json();
	if (!res.ok) throw new Error(json.error || json.message || res.statusText);
	return json.data;
};

const apiPost = async (module, payload) => {
	const res = await fetch(`${API_BASE_URL}/api/playground/${module}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error || json.message || res.statusText);
	return json.data;
};

const APIPlayGround = () => {
	const [activeTab, setActiveTab] = useState("users");
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [response, setResponse] = useState(null);

	// Form states for different modules
	const [formData, setFormData] = useState({
		// Users
		username: "",
		email: "",
		phone_number: "",
		date_of_birth: "",
		address: "",
		gender: "",
		role: "patient",
		password: "",
		// Patients
		patientUserId: "",
		insurance_provider: "",
		insurance_number: "",
		// Doctors
		doctorUserId: "",
		specialization: "",
		license_number: "",
		years_of_experience: "",
		department_id: "",
		// Appointments
		patient_id: "",
		doctor_id: "",
		slot_id: "",
		duration: "",
		reason_for_visit: "",
		appointment_status: "pending",
		// Availability
		availability_doctor_id: "",
		day_of_week: "Monday",
		start_time: "",
		end_time: "",
		// Slot
		availability_id: "",
		date: "",
		slot_start_time: "",
		slot_end_time: "",
		slot_status: "available",
		// Department
		department_name: "",
		// Medical Report
		appointment_id: "",
		diagnosis: "",
		treatment_plan: "",
	});

	const [discovered, setDiscovered] = useState(null);

	// Attempt to discover tables in public schema
	const discoverSchema = async () => {
		try {
			setLoading(true);
			setError(null);
			setResponse(null);
			// Call backend discovery endpoint
			const res = await fetch(`${API_BASE_URL}/api/playground/discover`);
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || json.message || JSON.stringify(json));
			const names = json.tables || [];
			setDiscovered(names);
			setResponse(`✅ Discovered ${names.length} tables: ${names.join(', ')}`);
			return;
		} catch (err) {
			setError(err?.message || String(err));
			setResponse(`❌ Discover failed: ${err?.message || String(err)}`);
		} finally {
			setLoading(false);
		}
	};

	// Test Supabase connection
	const testConnection = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await fetch(`${API_BASE_URL}/api/playground/test`);
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || JSON.stringify(json));
			setResponse('✅ Supabase connected successfully!');
		} catch (err) {
			setError(err.message);
			setResponse("❌ Connection failed: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	// USERS MODULE
	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('users');
			setData(data);
			setResponse(`✅ Fetched ${data.length} users`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createUser = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				username: formData.username,
				email: formData.email,
				phone_number: formData.phone_number || null,
				date_of_birth: formData.date_of_birth || null,
				address: formData.address || null,
				gender: formData.gender || null,
				role: formData.role || "patient",
				password: formData.password,
			};

			const data = await apiPost('users', payload);
			setData(data);
			setResponse(`✅ User created successfully`);
			setFormData({
				...formData,
				username: "",
				email: "",
				phone_number: "",
				date_of_birth: "",
				address: "",
				gender: "",
				role: "patient",
				password: "",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// DOCTORS MODULE
	const fetchDoctors = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('doctors');
			setData(data);
			setResponse(`✅ Fetched ${data.length} doctors`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createDoctor = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				user_id: formData.userId || null, // User ID
				specialization: formData.specialization || null, // Specialization
				license_number: formData.licenseNumber, // License Number
				years_of_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience, 10) : null, // Years of experience
				department_id: formData.departmentId || null, // Department ID
			};

			const data = await apiPost('doctors', payload);
			setData(data);
			setResponse(`✅ Doctor created successfully`);
			setFormData({
				...formData,
				userId: "",
				specialization: "",
				licenseNumber: "",
				yearsOfExperience: "",
				departmentId: "",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// APPOINTMENTS MODULE
	const fetchAppointments = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('appointments');
			setData(data);
			setResponse(`✅ Fetched ${data.length} appointments`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createAppointment = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				patient_id: formData.patientId,
				doctor_id: formData.doctorId,
				slot_id: formData.slotId,
				duration: formData.duration ? parseInt(formData.duration, 10) : null,
				reason_for_visit: formData.reason_for_visit || null,
				status: formData.status || "pending",
			};

			const data = await apiPost('appointments', payload);
			setData(data);
			setResponse(`✅ Appointment created successfully`);
			setFormData({
				...formData,
				patientId: "",
				doctorId: "",
				slotId: "",
				duration: "",
				reason_for_visit: "",
				status: "pending",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// TIME SLOTS MODULE
	const fetchTimeSlots = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('time_slots');
			setData(data);
			setResponse(`✅ Fetched ${data.length} time slots`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// PATIENTS MODULE
	const fetchPatients = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('patients');
			setData(data);
			setResponse(`✅ Fetched ${data.length} patients`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createPatient = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				user_id: formData.patientUserId,
				insurance_provider: formData.insurance_provider || null,
				insurance_number: formData.insurance_number || null,
			};

			const data = await apiPost('patients', payload);
			setData(data);
			setResponse(`✅ Patient created successfully`);
			setFormData({
				...formData,
				patientUserId: "",
				insurance_provider: "",
				insurance_number: "",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// DEPARTMENTS MODULE
	const fetchDepartments = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('departments');
			setData(data);
			setResponse(`✅ Fetched ${data.length} departments`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createDepartment = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				name: formData.department_name,
			};

			const data = await apiPost('departments', payload);
			setData(data);
			setResponse(`✅ Department created successfully`);
			setFormData({
				...formData,
				department_name: "",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// AVAILABILITY MODULE
	const fetchAvailability = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('availability');
			setData(data);
			setResponse(`✅ Fetched ${data.length} availability records`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createAvailability = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				doctor_id: formData.availability_doctor_id,
				day_of_week: formData.day_of_week,
				start_time: formData.start_time,
				end_time: formData.end_time,
			};

			const data = await apiPost('availability', payload);
			setData(data);
			setResponse(`✅ Availability created successfully`);
			setFormData({
				...formData,
				availability_doctor_id: "",
				day_of_week: "Monday",
				start_time: "",
				end_time: "",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// SLOTS MODULE
	const fetchSlots = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('slots');
			setData(data);
			setResponse(`✅ Fetched ${data.length} slots`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createSlot = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				availability_id: formData.availability_id,
				date: formData.date,
				start_time: formData.slot_start_time,
				end_time: formData.slot_end_time,
				status: formData.slot_status,
			};

			const data = await apiPost('slots', payload);
			setData(data);
			setResponse(`✅ Slot created successfully`);
			setFormData({
				...formData,
				availability_id: "",
				date: "",
				slot_start_time: "",
				slot_end_time: "",
				slot_status: "available",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	// MEDICAL REPORTS MODULE
	const fetchMedicalReports = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await apiGet('medical_reports');
			setData(data);
			setResponse(`✅ Fetched ${data.length} medical reports`);
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	const createMedicalReport = async () => {
		try {
			setLoading(true);
			setError(null);
			const payload = {
				appointment_id: formData.appointment_id,
				diagnosis: formData.diagnosis || null,
				treatment_plan: formData.treatment_plan || null,
			};

			const data = await apiPost('medical_reports', payload);
			setData(data);
			setResponse(`✅ Medical report created successfully`);
			setFormData({
				...formData,
				appointment_id: "",
				diagnosis: "",
				treatment_plan: "",
			});
		} catch (err) {
			setError(err.message);
			setResponse(`❌ Error: ${err.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 p-6">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl font-bold mb-2">🛠️ API PlayGround</h1>
				<p className="text-gray-600 mb-6">Test Supabase API endpoints and see results in real-time</p>
				{/* Tabs */}
				<div className="flex gap-2 mb-6 border-b overflow-x-auto">
					{["users", "patients", "doctors", "departments", "availability", "slots", "appointments", "medical_reports"].map((tab) => (
						<button
							key={tab}
							onClick={() => {
								setActiveTab(tab);
								setData(null);
								setResponse(null);
							}}
							className={`px-6 py-3 font-medium whitespace-nowrap ${
								activeTab === tab
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{tab.replace("_", " ").toUpperCase()}
						</button>
					))}
				</div>

				{/* Content */}
				<div className="grid grid-cols-2 gap-6">
					{/* Left: Forms & Controls */}
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-2xl font-bold mb-4">Actions</h2>

						{/* USERS */}
						{activeTab === "users" && (
							<div className="space-y-4">
								<button
									onClick={fetchUsers}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Users"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New User</h3>
								<input
									type="text"
									placeholder="Username"
									value={formData.username}
									onChange={(e) => setFormData({ ...formData, username: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="email"
									placeholder="Email"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Phone number"
									value={formData.phone_number}
									onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="date"
									placeholder="Date of birth"
									value={formData.date_of_birth}
									onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Address"
									value={formData.address}
									onChange={(e) => setFormData({ ...formData, address: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Gender"
									value={formData.gender}
									onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<select
									value={formData.role}
									onChange={(e) => setFormData({ ...formData, role: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								>
									<option value="patient">patient</option>
									<option value="doctor">doctor</option>
									<option value="admin">admin</option>
								</select>
								<input
									type="password"
									placeholder="Password"
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<button
									onClick={createUser}
									disabled={loading}
									className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create User"}
								</button>
							</div>
						)}

						{/* PATIENTS */}
						{activeTab === "patients" && (
							<div className="space-y-4">
								<button
									onClick={fetchPatients}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Patients"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New Patient</h3>
								<input
									type="text"
									placeholder="User ID (Users.id)"
									value={formData.patientUserId}
									onChange={(e) => setFormData({ ...formData, patientUserId: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Insurance Provider"
									value={formData.insurance_provider}
									onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Insurance Number"
									value={formData.insurance_number}
									onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<button
									onClick={createPatient}
									disabled={loading}
									className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create Patient"}
								</button>
							</div>
						)}

						{/* DEPARTMENTS */}
						{activeTab === "departments" && (
							<div className="space-y-4">
								<button
									onClick={fetchDepartments}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Departments"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New Department</h3>
								<input
									type="text"
									placeholder="Department Name"
									value={formData.department_name}
									onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<button
									onClick={createDepartment}
									disabled={loading}
									className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create Department"}
								</button>
							</div>
						)}

						{/* DOCTORS */}
						{activeTab === "doctors" && (
							<div className="space-y-4">
								<button
									onClick={fetchDoctors}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Doctors"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New Doctor</h3>
								<input
									type="text"
									placeholder="User ID (Users.id)"
									value={formData.doctorUserId}
									onChange={(e) => setFormData({ ...formData, doctorUserId: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Specialization"
									value={formData.specialization}
									onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="License Number"
									value={formData.license_number}
									onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="number"
									placeholder="Years of experience"
									value={formData.years_of_experience}
									onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="number"
									placeholder="Department ID"
									value={formData.department_id}
									onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<button
									onClick={createDoctor}
									disabled={loading}
									className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create Doctor"}
								</button>
							</div>
						)}

						{/* AVAILABILITY */}
						{activeTab === "availability" && (
							<div className="space-y-4">
								<button
									onClick={fetchAvailability}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Availability"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New Availability</h3>
								<input
									type="text"
									placeholder="Doctor ID"
									value={formData.availability_doctor_id}
									onChange={(e) => setFormData({ ...formData, availability_doctor_id: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<select
									value={formData.day_of_week}
									onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								>
									<option value="Monday">Monday</option>
									<option value="Tuesday">Tuesday</option>
									<option value="Wednesday">Wednesday</option>
									<option value="Thursday">Thursday</option>
									<option value="Friday">Friday</option>
									<option value="Saturday">Saturday</option>
									<option value="Sunday">Sunday</option>
								</select>
								<input
									type="time"
									placeholder="Start Time"
									value={formData.start_time}
									onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="time"
									placeholder="End Time"
									value={formData.end_time}
									onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<button
									onClick={createAvailability}
									disabled={loading}
									className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create Availability"}
								</button>
							</div>
						)}

						{/* SLOTS */}
						{activeTab === "slots" && (
							<div className="space-y-4">
								<button
									onClick={fetchSlots}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Slots"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New Slot</h3>
								<input
									type="text"
									placeholder="Availability ID"
									value={formData.availability_id}
									onChange={(e) => setFormData({ ...formData, availability_id: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="date"
									placeholder="Date"
									value={formData.date}
									onChange={(e) => setFormData({ ...formData, date: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="time"
									placeholder="Start Time"
									value={formData.slot_start_time}
									onChange={(e) => setFormData({ ...formData, slot_start_time: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="time"
									placeholder="End Time"
									value={formData.slot_end_time}
									onChange={(e) => setFormData({ ...formData, slot_end_time: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<select
									value={formData.slot_status}
									onChange={(e) => setFormData({ ...formData, slot_status: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								>
									<option value="available">available</option>
									<option value="booked">booked</option>
									<option value="blocked">blocked</option>
								</select>
								<button
									onClick={createSlot}
									disabled={loading}
									className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create Slot"}
								</button>
							</div>
						)}

						{/* APPOINTMENTS */}
						{activeTab === "appointments" && (
							<div className="space-y-4">
								<button
									onClick={fetchAppointments}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Appointments"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New Appointment</h3>
								<input
									type="text"
									placeholder="Patient ID (Patients.id)"
									value={formData.patient_id}
									onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Doctor ID (Doctor.doctor_id)"
									value={formData.doctor_id}
									onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Slot ID (Slot.slot_id)"
									value={formData.slot_id}
									onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="number"
									placeholder="Duration (minutes)"
									value={formData.duration}
									onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<input
									type="text"
									placeholder="Reason for visit"
									value={formData.reason_for_visit}
									onChange={(e) => setFormData({ ...formData, reason_for_visit: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<select
									value={formData.appointment_status}
									onChange={(e) => setFormData({ ...formData, appointment_status: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								>
									<option value="pending">pending</option>
									<option value="completed">completed</option>
									<option value="cancelled">cancelled</option>
								</select>
								<button
									onClick={createAppointment}
									disabled={loading}
									className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create Appointment"}
								</button>
							</div>
						)}

						{/* MEDICAL REPORTS */}
						{activeTab === "medical_reports" && (
							<div className="space-y-4">
								<button
									onClick={fetchMedicalReports}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Medical Reports"}
								</button>
								<hr />
								<h3 className="font-bold text-lg">Create New Medical Report</h3>
								<input
									type="text"
									placeholder="Appointment ID"
									value={formData.appointment_id}
									onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
									className="w-full px-3 py-2 border rounded"
								/>
								<textarea
									placeholder="Diagnosis"
									value={formData.diagnosis}
									onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
									className="w-full px-3 py-2 border rounded"
									rows="3"
								/>
								<textarea
									placeholder="Treatment Plan"
									value={formData.treatment_plan}
									onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
									className="w-full px-3 py-2 border rounded"
									rows="3"
								/>
								<button
									onClick={createMedicalReport}
									disabled={loading}
									className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
								>
									{loading ? "Creating..." : "✨ Create Medical Report"}
								</button>
							</div>
						)}

						{/* TIME SLOTS (deprecated but kept for reference) */}
						{activeTab === "time_slots" && (
							<div className="space-y-4">
								<button
									onClick={fetchTimeSlots}
									disabled={loading}
									className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
								>
									{loading ? "Loading..." : "📋 Fetch All Time Slots"}
								</button>
								<p className="text-sm text-gray-600 mt-4">ℹ️ This module is deprecated. Use "Availability" and "Slots" modules instead.</p>
							</div>
						)}
					</div>

					{/* Right: Response Data */}
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-2xl font-bold mb-4">Response Data</h2>
						<div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
							{data ? (
								<pre>{JSON.stringify(data, null, 2)}</pre>
							) : (
								<p className="text-gray-500">Click a button to see data...</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default APIPlayGround;
