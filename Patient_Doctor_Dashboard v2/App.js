import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserDashboard } from "./screens/UserDashboard/UserDashboard";
import { DoctorDashboard } from "./screens/DoctorDashboard/DoctorDashboard";
import NavBar from "./components/NavBar";
function App() {
    return (_jsx(Router, { children: _jsxs("div", { className: "min-h-screen bg-[#f9f9f9]", children: [_jsx(NavBar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(UserDashboard, {}) }), _jsx(Route, { path: "/doctor-dashboard", element: _jsx(DoctorDashboard, {}) })] })] }) }));
}
export default App;
//# sourceMappingURL=App.js.map