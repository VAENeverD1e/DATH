import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { apiPatch, apiGet } from "../api/client";

export const AppointmentInfoCard = ({ appointment, onRefresh }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [medicalReport, setMedicalReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const {
    doctor_name,
    specialization,
    date,
    start_time,
    end_time,
    duration,
    reason_for_visit,
    status,
  } = appointment;

  // Format date
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Format time
  const formatTime = (timeStr) => {
    try {
      if (!timeStr) return "";
      // Handle HH:MM format
      return timeStr.substring(0, 5);
    } catch {
      return timeStr;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setIsCancelling(true);
    setError("");

    try {
      // Call API to cancel appointment
      await apiPatch(`/api/appointments/${appointment.appointment_id}/cancel`, {}, { auth: true });
      
      alert("Appointment cancelled successfully!");
      
      // Refresh the appointment list
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      setError(err.message || "Failed to cancel appointment");
    } finally {
      setIsCancelling(false);
    }
  };

  // Load medical report when appointment is completed and user toggles display
  const loadMedicalReport = async () => {
    if (!appointment?.appointment_id) return;
    setLoadingReport(true);
    setError("");
    try {
      const data = await apiGet(`/api/reports/${appointment.appointment_id}`, { auth: true });
      setMedicalReport(data || null);
    } catch (err) {
      setError(err.message || "Failed to load medical report");
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    // Reset report when appointment changes
    setMedicalReport(null);
    setShowReport(false);
  }, [appointment?.appointment_id]);

  // Safe early return AFTER hooks (to satisfy hooks rules)
  if (!appointment) {
    return null;
  }

  const toggleReport = () => {
    if (!showReport && !medicalReport) {
      loadMedicalReport();
    }
    setShowReport(!showReport);
  };

  return (
    <Card className="w-full bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        <h2 className="font-bold text-2xl text-black mb-6 text-center">
          Appointment Info
        </h2>

        <div className="space-y-4 mb-6">
          {/* Doctor Info */}
          <div className="pb-4 border-b">
            <p className="text-sm text-gray-600 font-medium">Doctor</p>
            <p className="text-base text-black font-semibold">{doctor_name}</p>
            <p className="text-sm text-gray-700">{specialization}</p>
          </div>

          {/* Date & Time */}
          <div className="pb-4 border-b">
            <p className="text-sm text-gray-600 font-medium">Date & Time</p>
            <p className="text-base text-black">
              {formatDate(date)}
              <br />
              {formatTime(start_time)} - {formatTime(end_time)}
            </p>
          </div>

          {/* Duration */}
          <div className="pb-4 border-b">
            <p className="text-sm text-gray-600 font-medium">Duration</p>
            <p className="text-base text-black">{duration} minutes</p>
          </div>

          {/* Reason for Visit */}
          <div className="pb-4 border-b">
            <p className="text-sm text-gray-600 font-medium">Reason for Visit</p>
            <p className="text-base text-black">{reason_for_visit || "N/A"}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 flex-wrap">
          {status?.toLowerCase() !== "cancelled" && status?.toLowerCase() !== "completed" && (
            <Button
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600 text-white h-auto px-4 py-2"
            >
              {isCancelling ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          )}
          {status?.toLowerCase() === "completed" && (
            <Button
              onClick={toggleReport}
              disabled={loadingReport}
              className="bg-blue-600 hover:bg-blue-700 text-white h-auto px-4 py-2"
            >
              {loadingReport ? "Loading..." : showReport ? "Hide Medical Report" : "View Medical Report"}
            </Button>
          )}
        </div>

        {/* Medical Report Section */}
        {showReport && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-semibold text-lg text-black mb-3">Medical Report</h3>
            {!medicalReport && !loadingReport && (
              <p className="text-sm text-gray-500">No medical report found for this appointment.</p>
            )}
            {medicalReport && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Diagnosis</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{medicalReport.diagnosis || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Treatment Plan</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{medicalReport.treatment_plan || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentInfoCard;