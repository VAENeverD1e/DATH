import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const AppointmentDetailsSection = () => {
    return (_jsx(Card, { className: "w-full bg-white", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("h2", { className: "flex items-center justify-center [font-family:'Maven_Pro',Helvetica] font-black text-black text-5xl text-center tracking-[-1.92px] leading-normal whitespace-nowrap mb-6", children: "Appointment Info" }), _jsx("div", { className: "space-y-4 mb-6", children: appointmentFields.map((field, index) => (_jsx("div", { className: "opacity-80 [font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-normal whitespace-nowrap", children: field }, index))) }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { className: "bg-blue-500 hover:bg-blue-600 text-white h-auto px-6 py-2", children: "Cancel" }) })] }) }));
};
//# sourceMappingURL=AppointmentDetailsSection.js.map