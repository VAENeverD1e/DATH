import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { apiGet, apiPost, apiPatch, apiDelete, getAuth } from "../api/client";

const backgroundImage =
  process.env.PUBLIC_URL + "/assets/artistic-blurry-colorful-wallpaper-background.jpg";

const DoctorDashboard = () => {
  // ==== Doctor profile from JWT ====
  const { user } = getAuth();
  const doctorName = user?.username || "Doctor";

  // ==== Error handling ====
  const [error, setError] = useState(null);

  // ==== Working schedule / Availability ====
  const [availabilities, setAvailabilities] = useState([]);
  const [newAvail, setNewAvail] = useState({
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "10:00",
  });

  // ==== Appointments ====
  const [appointments, setAppointments] = useState([]);

  // ==== Medical Report Modal ====
  const [reportModal, setReportModal] = useState({
    open: false,
    appointment_id: null,
    diagnosis: "",
    treatment_plan: "",
  });

  // ==== Load data on mount ====
  useEffect(() => {
    loadAvailabilities();
    loadAppointments();
  }, []);

  const loadAvailabilities = async () => {
    try {
      const data = await apiGet("/api/doctors/availability", { auth: true });
      setAvailabilities(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load availabilities: " + err.message);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await apiGet("/api/appointments/doctor", { auth: true });
      setAppointments(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load appointments: " + err.message);
    }
  };

  const addInterval = async () => {
    if (!newAvail.start_time || !newAvail.end_time) return;
    try {
      await apiPost("/api/doctors/availability", newAvail, { auth: true });
      setNewAvail({ day_of_week: "Monday", start_time: "09:00", end_time: "10:00" });
      loadAvailabilities(); // Reload to get new availability with generated slots
      setError(null);
    } catch (err) {
      setError("Failed to add availability: " + err.message);
    }
  };

  const removeInterval = async (id) => {
    try {
      await apiDelete(`/api/doctors/availability/${id}`, { auth: true });
      loadAvailabilities();
      setError(null);
    } catch (err) {
      setError("Failed to remove availability: " + err.message);
    }
  };


  const updateApptStatus = async (id, status) => {
    if (status === "Completed") {
      // Open modal for medical report
      setReportModal({
        open: true,
        appointment_id: id,
        diagnosis: "",
        treatment_plan: "",
      });
    } else {
      // Direct status update (e.g., Cancelled)
      try {
        await apiPatch(`/api/appointments/${id}/status`, { status }, { auth: true });
        loadAppointments();
        setError(null);
      } catch (err) {
        setError("Failed to update appointment: " + err.message);
      }
    }
  };

  const saveReport = async () => {
    if (!reportModal.diagnosis.trim() || !reportModal.treatment_plan.trim()) {
      setError("Both diagnosis and treatment plan are required");
      return;
    }
    try {
      await apiPost(
        "/api/reports",
        {
          appointment_id: reportModal.appointment_id,
          diagnosis: reportModal.diagnosis,
          treatment_plan: reportModal.treatment_plan,
        },
        { auth: true }
      );
      setReportModal({ open: false, appointment_id: null, diagnosis: "", treatment_plan: "" });
      loadAppointments(); // Reload to see updated status
      setError(null);
    } catch (err) {
      setError("Failed to save report: " + err.message);
    }
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
        <h1 style={{ fontSize: "2.25rem", fontWeight: "700", color: "#1e293b", marginTop: "1.5rem", marginBottom: "1.5rem" }}>
          Doctor Dashboard
        </h1>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {/* Doctor Profile Card */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e293b", marginBottom: "0.75rem" }}>
            Welcome, Dr. {doctorName}
          </h2>
        </div>

        {/* Working Schedule / Availability */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>
            Working Schedule
          </h2>

          {/* List intervals */}
          <table style={{ width: "100%", marginBottom: "1.5rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Day</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Start</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>End</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {availabilities.map((a) => (
                <tr key={a.availability_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.75rem" }}>{a.day_of_week}</td>
                  <td style={{ padding: "0.75rem" }}>{a.start_time}</td>
                  <td style={{ padding: "0.75rem" }}>{a.end_time}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      onClick={() => removeInterval(a.availability_id)}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {availabilities.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "0.75rem", color: "#64748b", fontSize: "0.875rem" }}>
                    No availability intervals set yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Add interval */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#475569", marginBottom: "0.25rem" }}>
                Day
              </label>
              <select
                value={newAvail.day_of_week}
                onChange={(e) => setNewAvail((v) => ({ ...v, day_of_week: e.target.value }))}
                style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 0.75rem" }}
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#475569", marginBottom: "0.25rem" }}>
                Start Time
              </label>
              <input
                type="time"
                value={newAvail.start_time}
                onChange={(e) => setNewAvail((v) => ({ ...v, start_time: e.target.value }))}
                style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 0.75rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#475569", marginBottom: "0.25rem" }}>
                End Time
              </label>
              <input
                type="time"
                value={newAvail.end_time}
                onChange={(e) => setNewAvail((v) => ({ ...v, end_time: e.target.value }))}
                style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.5rem 0.75rem" }}
              />
            </div>
            <button
              onClick={addInterval}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              + Add Interval
            </button>
          </div>
        </div>

        {/* Appointments */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>
            Manage Appointments
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Date</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Time</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Patient</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Phone</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Reason</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "left", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.appointment_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.75rem" }}>{a.date}</td>
                  <td style={{ padding: "0.75rem" }}>{a.start_time} - {a.end_time}</td>
                  <td style={{ padding: "0.75rem" }}>{a.patient_name}</td>
                  <td style={{ padding: "0.75rem" }}>{a.phone_number}</td>
                  <td style={{ padding: "0.75rem" }}>{a.reason_for_visit}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      style={{
                        backgroundColor: a.status === "Completed" ? "#10b981" : a.status === "Cancelled" ? "#ef4444" : "#f59e0b",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.875rem",
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {a.status !== "Completed" && a.status !== "Cancelled" && (
                        <>
                          <button
                            onClick={() => updateApptStatus(a.appointment_id, "Completed")}
                            style={{
                              backgroundColor: "#10b981",
                              color: "white",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateApptStatus(a.appointment_id, "Cancelled")}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "white",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "0.75rem", color: "#64748b", fontSize: "0.875rem" }}>
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Medical Report Modal */}
        {reportModal.open && (
          <div
            style={{
              position: "fixed",
              inset: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 50,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                width: "90%",
                maxWidth: "600px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#1e293b" }}>
                Medical Report
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
                Complete the medical report to mark the appointment as completed.
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.5rem" }}>
                  Diagnosis *
                </label>
                <textarea
                  rows={4}
                  value={reportModal.diagnosis}
                  onChange={(e) => setReportModal((v) => ({ ...v, diagnosis: e.target.value }))}
                  style={{
                    width: "100%",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter diagnosis..."
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#475569", marginBottom: "0.5rem" }}>
                  Treatment Plan *
                </label>
                <textarea
                  rows={4}
                  value={reportModal.treatment_plan}
                  onChange={(e) => setReportModal((v) => ({ ...v, treatment_plan: e.target.value }))}
                  style={{
                    width: "100%",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter treatment plan..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  onClick={() =>
                    setReportModal({ open: false, appointment_id: null, diagnosis: "", treatment_plan: "" })
                  }
                  style={{
                    backgroundColor: "#94a3b8",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveReport}
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save & Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;