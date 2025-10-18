import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DoctorDashboard } from "./screens/DoctorDashboard";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <DoctorDashboard />
  </StrictMode>,
);
