"use client";

import { useUser } from "@/context/userContext";
import { getInitials } from "@/utils/utils";
import { Bell, Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Header = ({
  title,
  isOpen,
  setIsOpen,
}: {
  title: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
    }
  }, [loading, user, router]);

  return (
    <header className="flex-shrink-0 flex flex-row justify-between items-center px-3 sm:px-4 py-3 sm:py-4 gap-2 sm:gap-4 border-b border-[#B5B5B5] bg-white z-10">
      {/* Left Section - Menu + Title */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={18} className="sm:w-5 sm:h-5" />
          ) : (
            <Menu size={18} className="sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Page title */}
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">
          {title}
        </h2>
      </div>

      {/* Right Section (icons + avatar) */}
      <div className="flex gap-2 sm:gap-4 items-center flex-shrink-0">
        {/* Icons (only on larger screens) */}
        <div className="hidden gap-3 sm:flex">
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Search"
          >
            <Search size={20} className="text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="flex gap-2 items-center">
          <div className="relative">
            <div className="flex justify-center items-center w-9 h-9 sm:w-10 sm:h-10 font-bold text-orange-500 bg-orange-100 rounded-full cursor-pointer hover:bg-orange-200 transition-colors">
              {getInitials(user?.fullName || "")}
            </div>
            <span className="absolute right-0 bottom-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[#344054] truncate max-w-[150px]">
              {user?.fullName}
            </p>
            <p className="text-xs text-[#667085] truncate max-w-[150px]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
