"use client";

import {
  Briefcase,
  Building2,
  ChartNoAxesColumn,
  CreditCard,
  LogOut,
  FileBarChart,
  Handshake,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  SquareCheckBig,
  Utensils,
  Landmark,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBusiness } from "@/context/businessContext";
import { useUser } from "@/context/userContext";
import { clearAuthCookie } from "@/app/actions/auth";
import { toast } from "sonner";

const navItems = [
  { name: "Command Center", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Businesses", icon: Building2, href: "/business-list" },
  { name: "Support Tickets", icon: LifeBuoy, href: "/dashboard/support" },
  { name: "Billing", icon: Wallet, href: "/dashboard/billing" },
  { name: "Reports", icon: FileBarChart, href: "/dashboard/reports" },
  { name: "Users", icon: Users, href: "/dashboard/users" },
  { name: "CRM", icon: Handshake, href: "/dashboard/crm" },
  { name: "Career Applications", icon: Briefcase, href: "/dashboard/careers" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

const businessNavItems = [
  { name: "General Info", icon: ChartNoAxesColumn, href: "/dashboard/details" },
  {
    name: "Restaurant Details",
    icon: Utensils,
    href: "/dashboard/restaurant-details",
  },
  { name: "Issues", icon: Layers, href: "/dashboard/issues" },
  { name: "Current Plan", icon: SquareCheckBig, href: "/dashboard/plan" },
  { name: "Payment History", icon: CreditCard, href: "/dashboard/payments" },
  {
    name: "Booking Payment",
    icon: Landmark,
    href: "/dashboard/booking-payments",
  },
  { name: "Staffs", icon: Users, href: "/dashboard/staffs" },
];

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const pathname = usePathname();
  const { business, setBusiness } = useBusiness();
  const { setUser } = useUser();
  const router = useRouter();
  const hasSelectedBusiness = Boolean(business && Object.keys(business).length);
  const visibleNavItems = hasSelectedBusiness ? businessNavItems : navItems;

  const handleLogout = async () => {
    try {
      await clearAuthCookie();
    } catch (error: unknown) {
      console.error("Failed to clear authentication cookie:", error);
      toast.error("Could not complete logout. Please try again.");
      return;
    }

    localStorage.removeItem("access_token");
    setUser(null);
    setBusiness(null);
    router.replace("/signin");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 flex h-screen flex-col bg-black text-white z-50 transition-transform transform sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-full sm:w-60 px-4 py-6`}
      >
        <div className="flex relative justify-center items-center mb-8">
          <Image
            src="/superadmin/logo-white.svg"
            alt="Logo"
            width={100}
            height={24}
            className="h-6"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-0 text-white sm:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {hasSelectedBusiness && (
          <p className="mb-3 px-3 text-sm font-semibold text-gray-300 truncate" title={business?.name}>
            {business?.name}
          </p>
        )}
        <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto">
          {visibleNavItems.map(({ name, icon: Icon, href }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={name}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 text-sm font-medium transition-colors py-3 px-3 rounded-md ${
                  isActive
                    ? "bg-[#FDEFE5] text-[#FF6F00]"
                    : "text-gray-300 hover:bg-[#FDEFE5] hover:text-[#FF6F00]"
                }`}
              >
                <Icon size={20} />
                {name}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex shrink-0 items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-red-950 hover:text-white"
        >
          <LogOut size={20} />
          Log out
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
