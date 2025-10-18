import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import NavBar from "../components/NavBar";
const backgroundImage = process.env.PUBLIC_URL + "/assets/artistic-blurry-colorful-wallpaper-background.jpg";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const stats = [
  { label: "Visits", value: 1200 },
  { label: "Registrations", value: 350 },
  { label: "Appointments", value: 75 },
];

const appointments = [
  { date: "2025-10-18", time: "09:00", durations: "60 mins", doctor: "Dr. Chấn Hưng", patient: "Thanh Huy" },
  { date: "2025-10-18", time: "10:30", durations: "45 mins", doctor: "Dr. Chấn Hưng", patient: "Quang Huy" },
  { date: "2025-10-18", time: "11:15", durations: "35 mins", doctor: "Dr. Chấn Hưng", patient: "Mạnh Hưng" },
];

const chartData = {
  labels: ["Visits", "Registrations", "Appointments"],
  datasets: [
    {
      label: "Count",
      data: stats.map((s) => s.value),
      backgroundColor: ["#60a5fa", "#34d399", "#fbbf24"],
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Statistics Overview" },
  },
  maintainAspectRatio: false,
};

const visitTypeData = {
  labels: ["Staff", "Patient", "Doctor"],
  datasets: [
    {
      label: "Visit Type",
      data: [300, 700, 200],
      backgroundColor: ["#6366f1", "#34d399", "#f59e42"],
      borderWidth: 1,
    },
  ],
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "Visit Type Percentage" },
  },
  maintainAspectRatio: false,
};

const AdminDashboard = () => {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* ✅ Navbar stays fixed on top */}
      <NavBar />

      {/* Background Layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${backgroundImage})`, 
          backgroundSize: 'cover',
          zIndex: 0,
        }}
      ></div>

      {/* Main Content */}
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
        {/* Header Section */}
        <div className="flex items-center mb-8 w-full relative" style={{ minHeight: "56px" }}>
          <span className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-blue-700 text-center w-max">
            Admin Dashboard
          </span>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const boxColors = [
              "bg-blue-500 text-white",
              "bg-green-500 text-white",
              "bg-yellow-400 text-gray-900",
            ];
            return (
              <div
                key={stat.label}
                className={`shadow rounded-lg p-6 flex flex-col items-center ${boxColors[idx]}`}
              >
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="mt-2 font-semibold">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Appointments Table */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">Today's Appointments</h2>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Patient</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">{appt.date}</td>
                  <td className="px-4 py-2">{appt.time}</td>
                  <td className="px-4 py-2">{appt.durations}</td>
                  <td className="px-4 py-2">{appt.doctor}</td>
                  <td className="px-4 py-2">{appt.patient}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center" style={{ height: 300 }}>
            <h2 className="text-lg font-semibold mb-4">Statistics Chart</h2>
            <div style={{ width: "100%", height: 200 }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center" style={{ height: 300 }}>
            <h2 className="text-lg font-semibold mb-4">Visit Percentage</h2>
            <div style={{ width: "100%", height: 200 }}>
              <Pie data={visitTypeData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
