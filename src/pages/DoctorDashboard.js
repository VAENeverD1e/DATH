import React, { useMemo, useState } from "react";
import NavBar from "../components/NavBar";

const backgroundImage =
  process.env.PUBLIC_URL + "/assets/artistic-blurry-colorful-wallpaper-background.jpg";

const DoctorDashboard = () => {
  // ==== Dummy doctor profile ====
  const doctor = {
    doctor_id: "D001",
    name: "Dr. Quang Huy",
    license_number: "LIC-987654",
    specialization: "Cardiology",
    years_of_experience: 8,
    department: "Internal Medicine",
  };

  // ==== Working schedule / Availability ====
  const [isAway, setIsAway] = useState(false); // UC: Mark "Free" or "Away"
  const [availabilities, setAvailabilities] = useState([
    { id: 1, day_of_week: "Mon", start_time: "09:00", end_time: "11:30" },
    { id: 2, day_of_week: "Wed", start_time: "13:30", end_time: "16:30" },
    { id: 3, day_of_week: "Fri", start_time: "09:00", end_time: "12:00" },
  ]);
  const [newAvail, setNewAvail] = useState({
    day_of_week: "Mon",
    start_time: "09:00",
    end_time: "10:00",
  });

  const addInterval = () => {
    if (!newAvail.start_time || !newAvail.end_time) return;
    const next = {
      id: Date.now(),
      ...newAvail,
    };
    setAvailabilities((prev) => [...prev, next]);
    setNewAvail({ day_of_week: "Mon", start_time: "09:00", end_time: "10:00" });
  };
  const removeInterval = (id) =>
    setAvailabilities((prev) => prev.filter((a) => a.id !== id));

  // ==== Appointments ====
  const [appointments, setAppointments] = useState([
    {
      appointment_id: "A1001",
      appointment_date: "2025-10-19",
      appointment_time: "09:30",
      duration: "30 min",
      patient: "Nguyen Van A",
      reason_for_visit: "Chest pain",
      status: "Scheduled",
    },
    {
      appointment_id: "A1002",
      appointment_date: "2025-10-19",
      appointment_time: "10:30",
      duration: "30 min",
      patient: "Tran Thi B",
      reason_for_visit: "Follow-up",
      status: "Scheduled",
    },
    {
      appointment_id: "A1003",
      appointment_date: "2025-10-20",
      appointment_time: "14:00",
      duration: "45 min",
      patient: "Le Van C",
      reason_for_visit: "ECG review",
      status: "Completed",
    },
  ]);

  const updateApptStatus = (id, status) =>
    setAppointments((prev) =>
      prev.map((a) => (a.appointment_id === id ? { ...a, status } : a))
    );

  const notify = (appt) => {
    // Notify Patient and Admin
    alert(
      `Notification sent to Patient & Admin for appointment ${appt.appointment_id} (${appt.patient})`
    );
  };

  // ==== Patient Records ====
  const [records, setRecords] = useState([
    {
      report_id: "R-01",
      patient: "Nguyen Van A",
      diagnosis: "Stable angina",
      treatment_plan: "Medication + lifestyle changes",
      last_update: "2025-10-10",
      notes: [],
    },
    {
      report_id: "R-02",
      patient: "Tran Thi B",
      diagnosis: "Hypertension",
      treatment_plan: "ACE inhibitors",
      last_update: "2025-10-12",
      notes: [],
    },
  ]);
  const [noteModal, setNoteModal] = useState({ open: false, report_id: null, text: "" });
  const openNoteModal = (report_id) => setNoteModal({ open: true, report_id, text: "" });
  const saveNote = () => {
    if (!noteModal.text.trim()) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.report_id === noteModal.report_id
          ? {
              ...r,
              notes: [...r.notes, { ts: new Date().toISOString(), text: noteModal.text }],
              last_update: new Date().toISOString().slice(0, 10),
            }
          : r
      )
    );
    setNoteModal({ open: false, report_id: null, text: "" });
  };


  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <NavBar />

      {/* Background */}
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
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingLeft: "32px",
          paddingRight: "32px",
          paddingBottom: "32px",
          fontFamily:
            "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        }}
      >
        {/* Header */}
        <div className="flex items-center mb-8 w-full relative" style={{ minHeight: 56 }}>
          <span className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-indigo-700 text-center w-max">
            Doctor Dashboard
          </span>
        </div>

        {/* Doctor card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div>
              <div className="text-xl font-semibold">{doctor.name}</div>
              <div className="text-sm text-gray-600">
                ID: {doctor.doctor_id} • License: {doctor.license_number}
              </div>
              <div className="text-sm text-gray-600">
                Dept: {doctor.department} • Spec: {doctor.specialization} • YOE:{" "}
                {doctor.years_of_experience}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded text-white ${isAway ? "bg-rose-500" : "bg-emerald-500"}`}>
                {isAway ? "Away" : "Free"}
              </span>
              <button
                onClick={() => setIsAway((v) => !v)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Toggle Free/Away
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Working Schedule */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Set Working Schedule</h2>
            </div>

            {/* List intervals */}
            <table className="min-w-full table-auto mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Day</th>
                  <th className="px-4 py-2 text-left">Start</th>
                  <th className="px-4 py-2 text-left">End</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {availabilities.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="px-4 py-2">{a.day_of_week}</td>
                    <td className="px-4 py-2">{a.start_time}</td>
                    <td className="px-4 py-2">{a.end_time}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeInterval(a.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {availabilities.length === 0 && (
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-500" colSpan={4}>
                      No intervals yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Add interval */}
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-sm text-gray-600">Day</label>
                <select
                  value={newAvail.day_of_week}
                  onChange={(e) => setNewAvail((v) => ({ ...v, day_of_week: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Start</label>
                <input
                  type="time"
                  value={newAvail.start_time}
                  onChange={(e) => setNewAvail((v) => ({ ...v, start_time: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">End</label>
                <input
                  type="time"
                  value={newAvail.end_time}
                  onChange={(e) => setNewAvail((v) => ({ ...v, end_time: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
              </div>
              <button onClick={addInterval} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                + Add Interval
              </button>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Manage Appointments</h2>
            <span className="text-sm text-gray-500">
              Total: {appointments.length} • Scheduled:{" "}
              {appointments.filter((a) => a.status === "Scheduled").length}
            </span>
          </div>

          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.appointment_id} className="border-b">
                  <td className="px-4 py-2">{a.appointment_date}</td>
                  <td className="px-4 py-2">{a.appointment_time}</td>
                  <td className="px-4 py-2">{a.patient}</td>
                  <td className="px-4 py-2">{a.reason_for_visit}</td>
                  <td className="px-4 py-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={a.status}
                      onChange={(e) => updateApptStatus(a.appointment_id, e.target.value)}
                    >
                      {["Scheduled", "Completed", "Cancelled"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => notify(a)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                    >
                      Notify Patient & Admin
                    </button>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-500" colSpan={6}>
                    No appointments.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Patient Records */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Manage Patient Records</h2>
          </div>

          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Report ID</th>
                <th className="px-4 py-2 text-left">Patient</th>
                <th className="px-4 py-2 text-left">Diagnosis</th>
                <th className="px-4 py-2 text-left">Treatment Plan</th>
                <th className="px-4 py-2 text-left">Last Update</th>
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.report_id} className="border-b">
                  <td className="px-4 py-2">{r.report_id}</td>
                  <td className="px-4 py-2">{r.patient}</td>
                  <td className="px-4 py-2">{r.diagnosis}</td>
                  <td className="px-4 py-2">{r.treatment_plan}</td>
                  <td className="px-4 py-2">{r.last_update}</td>
                  <td className="px-4 py-2">{r.notes.length} log(s)</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openNoteModal(r.report_id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Log Change
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Simple notes viewer */}
          <div className="text-sm text-gray-600 mt-3">
            <span className="font-medium">Tip:</span> Use <em>Log Change</em> to append notes;
            latest log updates the record’s last_update.
          </div>
        </div>
      </div>

      {/* Log Change Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Log Change</h3>
            <textarea
              rows={4}
              value={noteModal.text}
              onChange={(e) => setNoteModal((v) => ({ ...v, text: e.target.value }))}
              className="w-full border rounded p-2"
              placeholder="Describe the change..."
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setNoteModal({ open: false, report_id: null, text: "" })}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button onClick={saveNote} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;