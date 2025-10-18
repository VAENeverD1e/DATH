import { ClockIcon, Grid3x3Icon } from "lucide-react";
import React from "react";
import { AppointmentInfoCard } from "./sections/AppointmentInfoCard";
import { Card, CardContent } from "../../../components/ui/card";

export const DoctorDashboard = (): JSX.Element => {
  return (
    <div
      className="bg-[#f9f9f9] overflow-hidden border border-solid border-black w-full min-w-[1440px] min-h-screen flex pt-20"
      data-model-id="27:861"
    >
      {/* Sidebar */}
      <aside className="w-[65px] bg-white flex flex-col items-center py-8 gap-6">
        <a 
          href="/"
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Grid3x3Icon className="w-6 h-6" />
        </a>
        <button className="w-10 h-10 flex items-center justify-center text-[#4182f9] hover:bg-gray-100 rounded-lg transition-colors">
          <ClockIcon className="w-6 h-6" />
        </button>
      </aside>

      {/* Main Content */}
<main className="flex-1 p-8">
  <Card className="w-full max-w-[1282px] mx-auto rounded-[10px] shadow-sm translate-y-[-1rem] animate-fade-in opacity-0">
    <CardContent className="p-0">
      <div className="relative h-[100px] bg-gradient-to-r from-[#4182f9] via-[#7ba3f7] to-[#f5e6d3] rounded-t-[10px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://c.animaapp.com/mguntwed6Xc4Yk/img/rectangle-6691.png')] bg-cover bg-center" />
      </div>
      <div className="p-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <AppointmentInfoCard />
          <AppointmentInfoCard />
          <AppointmentInfoCard />
          <AppointmentInfoCard />
        </div>
      </div>
    </CardContent>
  </Card>
	      </main>
    </div>
  );
};
