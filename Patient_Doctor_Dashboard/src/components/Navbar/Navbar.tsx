import { BellIcon, SearchIcon } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Navbar = (): JSX.Element => {
  return (
    <nav className="w-full bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4182f9] to-[#7ba3f7] rounded-lg flex items-center justify-center">
              <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-lg">
                TP
              </span>
            </div>
            <h1 className="[font-family:'Poppins',Helvetica] font-semibold text-xl text-black">
              MediSafe
            </h1>
          </div>

          <div className="flex items-center gap-6 ml-8">
            <a
              href="#"
              className="[font-family:'Poppins',Helvetica] font-normal text-base text-[#4182f9] hover:text-[#3671e8] transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="[font-family:'Poppins',Helvetica] font-normal text-base text-gray-600 hover:text-[#4182f9] transition-colors"
            >
              Profile
            </a>
            <a
              href="#"
              className="[font-family:'Poppins',Helvetica] font-normal text-base text-gray-600 hover:text-[#4182f9] transition-colors"
            >
              Settings
            </a>
            <a
              href="#"
              className="[font-family:'Poppins',Helvetica] font-normal text-base text-gray-600 hover:text-[#4182f9] transition-colors"
            >
              Help
            </a>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-[280px] bg-[#f9f9f9] border-0 rounded-lg h-10 [font-family:'Poppins',Helvetica] font-normal text-sm"
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="relative w-10 h-10 hover:bg-gray-100 rounded-lg"
          >
            <BellIcon className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <Avatar className="w-10 h-10 cursor-pointer">
            <AvatarImage src="" />
            <AvatarFallback className="bg-[#4182f9] text-white text-sm">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};
