"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-[#FFE2CC] relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div
          className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] bg-[#E4DBD6] rotate-[-60.7deg] translate-x-[-40%] translate-y-[20%]"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] bg-[#F0D6C3] rotate-[38.67deg] translate-x-[30%] translate-y-[-30%]"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
      </div>

      {/* Centered login container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-20">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.svg"
            width={140}
            height={80}
            alt="Anli Logo"
            className="w-[120px] sm:w-[140px] h-auto mx-auto"
          />
        </div>

        <div className="bg-[#F9ECE1] p-6 sm:p-8 rounded-2xl shadow-md border border-app-secondary w-full max-w-md">
          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block mb-1 text-[14px] font-medium text-[#070707]"
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Frank@Hotellagrand.com"
              className="h-[50px] sm:h-[53px]"
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-1 text-[14px] font-medium text-[#070707]"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-[50px] sm:h-[53px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOffIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button className="w-full bg-app-primary hover:bg-app-primary text-white text-base font-medium rounded-md h-11">
            Continue
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 z-10">
        <p className="text-[14px] text-[#070707] font-normal">
          &copy; Anli {new Date().getFullYear()} All copyright reserved
        </p>
      </footer>
    </div>
  );
}
