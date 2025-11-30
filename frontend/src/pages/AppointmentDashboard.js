import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClockIcon, Grid3x3Icon } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { AppointmentInfoCard } from "./AppointmentInfoCard";
import { apiGet, getAuth } from "../api/client";

export const AppointmentDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load appointments function
  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Verify user is logged in
      const { user } = getAuth();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      // Fetch patient appointments from backend
      const data = await apiGet("/api/appointments/my", { auth: true });
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(err.message || "Failed to load appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointments on mount
  useEffect(() => {
    loadAppointments();
  }, [navigate]);

  return (
    <div className="bg-[#f9f9f9] overflow-hidden min-h-screen flex pt-20">
      <aside className="w-[65px] bg-white flex flex-col items-center py-8 gap-6 border-r">
        <a
          href="/user-dashboard"
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Grid3x3Icon className="w-6 h-6" />
        </a>
        <button className="w-10 h-10 flex items-center justify-center text-[#4182f9] hover:bg-gray-100 rounded-lg transition-colors">
          <ClockIcon className="w-6 h-6" />
        </button>
      </aside>

      <main className="flex-1 p-8">
        <Card className="w-full max-w-[1282px] mx-auto rounded-[10px] shadow-sm">
          <CardContent className="p-0">
            {/* Header Background */}
            <div className="relative h-[100px] bg-gradient-to-r from-[#4182f9] via-[#7ba3f7] to-[#f5e6d3] rounded-t-[10px] overflow-hidden">
              <div className="absolute inset-0 opacity-20" />
            </div>

            {/* Content */}
            <div className="p-8 max-w-[1440px] mx-auto">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4182f9]"></div>
                    <p className="mt-4 text-gray-600">Loading appointments...</p>
                  </div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No appointments found</p>
                    <p className="text-gray-500 text-sm mt-2">Book your first appointment in the Service section</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {appointments.map((appointment) => (
                    <AppointmentInfoCard
                      key={appointment.appointment_id}
                      appointment={appointment}
                      onRefresh={loadAppointments}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AppointmentDashboard;