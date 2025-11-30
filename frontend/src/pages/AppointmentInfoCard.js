import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { apiPatch } from "../api/client";

export const AppointmentInfoCard = ({ appointment, onRefresh }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  if (!appointment) {
    return null;
  }

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

        {/* Cancel Button (only if not already cancelled or completed) */}
        <div className="flex justify-end gap-2">
          {status?.toLowerCase() !== "cancelled" && status?.toLowerCase() !== "completed" && (
            <Button
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600 text-white h-auto px-4 py-2"
            >
              {isCancelling ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentInfoCard;