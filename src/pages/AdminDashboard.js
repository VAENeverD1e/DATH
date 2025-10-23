import React, { useState } from "react";
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
  const [doctors, setDoctors] = useState([
    { id: "D001", name: "Dr. Hưng", license: "LIC12345", specialization: "Cardiology" },
    { id: "D002", name: "Dr. Mai", license: "LIC23456", specialization: "Neurology" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    id: "",
    name: "",
    license: "",
    specialization: "",
  });

  const handleAddDoctor = () => {
    setDoctors([...doctors, newDoctor]);
    setNewDoctor({ id: "", name: "", license: "", specialization: "" });
    setShowModal(false);
  };

  const handleRemoveDoctor = (id) => {
    setDoctors(doctors.filter((doc) => doc.id !== id));
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

        {/* Stats */}
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

        {/* Charts */}
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
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Doctor Name</th>
                <th className="px-4 py-2 text-left">License Number</th>
                <th className="px-4 py-2 text-left">Specialization</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="px-4 py-2">{doc.id}</td>
                  <td className="px-4 py-2">{doc.name}</td>
                  <td className="px-4 py-2">{doc.license}</td>
                  <td className="px-4 py-2">{doc.specialization}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemoveDoctor(doc.id)}
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
                placeholder="Doctor ID"
                value={newDoctor.id}
                onChange={(e) => setNewDoctor({ ...newDoctor, id: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="text"
                placeholder="Doctor Name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="text"
                placeholder="License Number"
                value={newDoctor.license}
                onChange={(e) => setNewDoctor({ ...newDoctor, license: e.target.value })}
                className="w-full border p-2 mb-2 rounded"
              />
              <input
                type="text"
                placeholder="Specialization"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                className="w-full border p-2 mb-4 rounded"
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
      </div>
    </div>
  );
};

export default AdminDashboard;
