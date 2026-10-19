"use client";

import { useUser } from "@/context/userContext";
import { useBusiness } from "@/context/businessContext";
import { getInitials } from "@/utils/utils";
import { ArrowLeft, Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HqAlertsBell from "../hq/HqAlertsBell";

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
  const { business } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    // M4: only redirect when there is genuinely no session. On a fresh
    // direct navigation the user context hydrates from localStorage while
    // the server has already admitted us via the access_token cookie —
    // redirecting on `!user` alone used to drop valid sessions onto the
    // (empty) sign-in form. The cookie is readable client-side
    // (httpOnly: false, see src/app/actions/auth.ts setAuthCookie); if it
    // exists, the session is alive and we stay put.
    if (!loading && !user) {
      const hasSessionCookie =
        typeof document !== "undefined" &&
        document.cookie
          .split(";")
          .some((c) => c.trim().startsWith("access_token="));
      if (!hasSessionCookie) router.push("/signin");
    }
  }, [loading, user, router]);

  return (
    <header className="sticky top-0 z-30 flex sm:flex-row justify-between items-center p-4 gap-4 sm:gap-0 border-b border-[#B5B5B5] bg-white">
      {/* Page title */}
      <div className="flex min-w-0 items-center gap-3">
        {business && (
          <button
            type="button"
            onClick={() => router.push("/business-list")}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-[#F47411] hover:bg-orange-50"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Businesses</span>
          </button>
        )}
        <h2 className="truncate text-xl font-bold sm:text-2xl">{title}</h2>
      </div>

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
        <div className="hidden gap-3 sm:flex">
          <button
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Search"
          >
            <Search size={20} className="text-gray-500" />
          </button>
          <HqAlertsBell />
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
