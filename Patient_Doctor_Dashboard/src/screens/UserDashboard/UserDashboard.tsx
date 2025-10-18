import { ClockIcon, Grid3x3Icon, MailIcon } from "lucide-react";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

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

export const UserDashboard = (): JSX.Element => {
  return (
<div
      className="bg-[#f9f9f9] overflow-hidden border border-solid border-black w-full min-w-[1440px] min-h-screen flex pt-20"
      data-model-id="27:861"
    >
      <aside className="w-[65px] bg-white flex flex-col items-center py-8 gap-6">
        <button className="w-10 h-10 flex items-center justify-center text-[#4182f9] hover:bg-gray-100 rounded-lg transition-colors">
          <Grid3x3Icon className="w-6 h-6" />
        </button>
        <a 
          href="/doctor-dashboard"
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ClockIcon className="w-6 h-6" />
        </a>
      </aside>

      <main className="flex-1 p-8">
        <Card className="w-full max-w-[1282px] mx-auto rounded-[10px] shadow-sm translate-y-[-1rem] animate-fade-in opacity-0">
          <CardContent className="p-0">
            <div className="relative h-[100px] bg-gradient-to-r from-[#4182f9] via-[#7ba3f7] to-[#f5e6d3] rounded-t-[10px] overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://c.animaapp.com/mguntwed6Xc4Yk/img/rectangle-6691.png')] bg-cover bg-center" />
            </div>

            <div className="px-8 py-8">
              <div className="flex items-start justify-between mb-12">
                <div className="flex items-center gap-4">
                  <Avatar className="w-[60px] h-[60px] -mt-16 border-4 border-white shadow-md">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#e8e4f3] text-[#7c6ba6] text-xl font-medium">
                      <svg 
                        className="w-8 h-8" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <h1 className="[font-family:'Poppins',Helvetica] font-medium text-black text-xl tracking-[0] leading-[normal]">
                      Username
                    </h1>
                    <p className="[font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal] opacity-50">
                      @gmail.com
                    </p>
                  </div>
                </div>
                <Button className="bg-[#4182f9] hover:bg-[#3671e8] text-white rounded-lg px-6 h-auto py-2.5 [font-family:'Poppins',Helvetica] font-normal text-base">
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                <div className="space-y-8">
                  {formFields.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="opacity-80 [font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal]">
                        {field.label}
                      </Label>
                      {field.type === "input" ? (
                        <Input
                          placeholder={field.placeholder}
                          className="bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40"
                        />
                      ) : (
                        <Select>
                          <SelectTrigger className="bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-8">
                  {formFieldsRight.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="opacity-80 [font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal]">
                        {field.label}
                      </Label>
                      {field.type === "input" ? (
                        <Input
                          placeholder={field.placeholder}
                          className="bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40"
                        />
                      ) : (
                        <Select>
                          <SelectTrigger className="bg-[#f9f9f9] border-0 rounded-lg h-[52px] [font-family:'Poppins',Helvetica] font-normal text-base opacity-40">
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12">
                <h2 className="[font-family:'Poppins',Helvetica] font-medium text-black text-lg tracking-[0] leading-[normal] mb-4">
                  My email Address
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4182f9] bg-opacity-10 rounded-3xl flex items-center justify-center">
                    <MailIcon className="w-6 h-6 text-[#4182f9]" />
                  </div>
                  <span className="[font-family:'Poppins',Helvetica] font-normal text-black text-base tracking-[0] leading-[normal]">
                    @gmail.com
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
