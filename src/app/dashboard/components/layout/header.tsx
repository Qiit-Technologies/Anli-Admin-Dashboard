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
    <header className="flex sm:flex-row justify-between items-center p-4 sm:p-6 md:p-10 gap-4 sm:gap-0 border-b border-[#B5B5B5] bg-white top-0 z-10 relative">
      {/* Page title */}
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>

      {/* Right Section (icons + avatar) */}
      <div className="flex gap-4 items-center">
        {/* Menu Toggle (visible only on mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-700 bg-gray-100 rounded-md sm:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Icons (only on larger screens) */}
        <div className="hidden gap-4 sm:flex">
          <Search size={20} className="text-gray-500" />
          <Bell size={20} className="text-gray-500" />
        </div>

        {/* Profile Avatar (hide text on small screens) */}
        <div className="flex gap-2 items-center">
          <div className="relative">
            <div className="flex justify-center items-center w-10 h-10 font-bold text-orange-500 bg-orange-100 rounded-full">
              {getInitials(user?.fullName || "")}
            </div>
            <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#344054]">
              {user?.fullName}
            </p>
            <p className="text-xs text-[#667085] break-words">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
