import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

const appointmentFields = [
  { label: "Doctor's name & specialization" },
  { label: "Date & Time" },
  { label: "Location" },
  { label: "Status" },
  { label: "Link to Medical Report" },
];

export const DoctorInfoSection = (): JSX.Element => {
  return (
    <section className="w-full">
      <Card className="bg-white border-0 shadow-none">
        <CardContent className="p-6">
          <h2 className="flex items-center justify-center [font-family:'Maven_Pro',Helvetica] font-black text-black text-5xl text-center tracking-[-1.92px] leading-normal whitespace-nowrap mb-6">
            Appointment Info
          </h2>

          <div className="space-y-4 mb-6">
            {appointmentFields.map((field, index) => (
              <div
                key={index}
                className="opacity-80 [font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-normal"
              >
                {field.label}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button className="bg-[#1e293b] hover:bg-[#334155] text-white h-auto px-6 py-2 rounded-md">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
