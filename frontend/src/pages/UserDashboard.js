import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ClockIcon, Grid3x3Icon, MailIcon } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage, } from "../components/ui/avatar.js";
import { Button } from "../components/ui/button.js";
import { Card, CardContent } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select.js";
const formFields = [
    {
        label: "Full Name",
        placeholder: "Your First Name",
        type: "input",
    },
    {
        label: "Gender",
        placeholder: "Your First Name",
        type: "select",
    },
    {
        label: "Language",
        placeholder: "Your First Name",
        type: "select",
    },
];
const formFieldsRight = [
    {
        label: "Insurance",
        placeholder: "Your Insurance Info",
        type: "input",
    },
    {
        label: "Country",
        placeholder: "Your First Name",
        type: "select",
    },
    {
        label: "Time Zone",
        placeholder: "Your First Name",
        type: "select",
    },
];
export const UserDashboard = () => {
    return (_jsxs("div", { className: "bg-[#f9f9f9] overflow-hidden border border-solid border-black w-full min-w-[1440px] min-h-screen flex pt-20", "data-model-id": "27:861", children: [_jsxs("aside", { className: "w-[65px] bg-white flex flex-col items-center py-8 gap-6", children: [_jsx("button", { className: "w-10 h-10 flex items-center justify-center text-[#4182f9] hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(Grid3x3Icon, { className: "w-6 h-6" }) }), _jsx("a", { href: "/appointment-dashboard", className: "w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(ClockIcon, { className: "w-6 h-6" }) })] }), _jsx("main", { className: "flex-1 p-8", children: _jsx(Card, { className: "w-full max-w-[1282px] mx-auto rounded-[10px] shadow-sm translate-y-[-1rem] animate-fade-in", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "relative h-[100px] bg-gradient-to-r from-[#4182f9] via-[#7ba3f7] to-[#f5e6d3] rounded-t-[10px] overflow-hidden", children: _jsx("div", { className: "absolute inset-0 bg-[url('https://c.animaapp.com/mguntwed6Xc4Yk/img/rectangle-6691.png')] bg-cover bg-center" }) }), _jsxs("div", { className: "px-8 py-8", children: [_jsxs("div", { className: "flex items-start justify-between mb-12", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "w-[60px] h-[60px] -mt-16 border-4 border-white shadow-md", children: [_jsx(AvatarImage, { src: "" }), _jsx(AvatarFallback, { className: "bg-[#e8e4f3] text-[#7c6ba6] text-xl font-medium", children: _jsx("svg", { className: "w-8 h-8", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) })] }), _jsxs("div", { className: "flex flex-col gap-1.5 mt-2", children: [_jsx("h1", { className: "[font-family:'Poppins',Helvetica] font-medium text-black text-xl tracking-[0] leading-[normal]", children: "Username" }), _jsx("p", { className: "[font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal] opacity-50", children: "@gmail.com" })] })] }), _jsx(Button, { className: "bg-[#4182f9] hover:bg-[#3671e8] text-white rounded-lg px-6 h-auto py-2.5 [font-family:'Poppins',Helvetica] font-normal text-base", children: "Edit" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-x-16 gap-y-8", children: [_jsx("div", { className: "space-y-8", children: formFields.map((field, index) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "opacity-80 [font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal]", children: field.label }), field.type === "input" ? (_jsx(Input, { placeholder: field.placeholder, className: "bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40" })) : (_jsxs(Select, { children: [_jsx(SelectTrigger, { className: "bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40", children: _jsx(SelectValue, { placeholder: field.placeholder }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "option1", children: "Option 1" }), _jsx(SelectItem, { value: "option2", children: "Option 2" })] })] }))] }, index))) }), _jsx("div", { className: "space-y-8", children: formFieldsRight.map((field, index) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "opacity-80 [font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal]", children: field.label }), field.type === "input" ? (_jsx(Input, { placeholder: field.placeholder, className: "bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40" })) : (_jsxs(Select, { children: [_jsx(SelectTrigger, { className: "bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40", children: _jsx(SelectValue, { placeholder: field.placeholder }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "option1", children: "Option 1" }), _jsx(SelectItem, { value: "option2", children: "Option 2" })] })] }))] }, index))) })] }), _jsxs("div", { className: "mt-12", children: [_jsx("h2", { className: "[font-family:'Poppins',Helvetica] font-medium text-black text-lg tracking-[0] leading-[normal] mb-4", children: "My email Address" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-[#4182f9] bg-opacity-10 rounded-3xl flex items-center justify-center", children: _jsx(MailIcon, { className: "w-6 h-6 text-[#4182f9]" }) }), _jsx("span", { className: "[font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal]", children: "@gmail.com" })] })] })] })] }) }) })] }));
};
//# sourceMappingURL=UserDashboard.js.map