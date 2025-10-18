import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

const appointmentFields = [
  "Doctor's name & specialization",
  "Date & Time",
  "Location",
  "Status",
  "Link to Medical Report",
];

export const AppointmentDetailsSection = (): JSX.Element => {
  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        <h2 className="flex items-center justify-center [font-family:'Maven_Pro',Helvetica] font-black text-black text-5xl text-center tracking-[-1.92px] leading-normal whitespace-nowrap mb-6">
          Appointment Info
        </h2>

        <div className="space-y-4 mb-6">
          {appointmentFields.map((field, index) => (
            <div
              key={index}
              className="opacity-80 [font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-normal whitespace-nowrap"
            >
              {field}
            </div>
          ))}
        </div>

      <div className="flex justify-end">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white h-auto px-6 py-2">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
