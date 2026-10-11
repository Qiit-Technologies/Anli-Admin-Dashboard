"use client";

import {
  Building2,
  ChartNoAxesColumn,
  CreditCard,
  FileBarChart,
  Handshake,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  SquareCheckBig,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Command Center", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Businesses", icon: Building2, href: "/business-list" },
  { name: "Support Tickets", icon: LifeBuoy, href: "/dashboard/support" },
  { name: "Billing", icon: Wallet, href: "/dashboard/billing" },
  { name: "Reports", icon: FileBarChart, href: "/dashboard/reports" },
  { name: "Users", icon: Users, href: "/dashboard/users" },
  { name: "CRM", icon: Handshake, href: "/dashboard/crm" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  {
    name: "Business Overview",
    icon: ChartNoAxesColumn,
    href: "/dashboard/business-overview",
  },
  { name: "Issues", icon: Layers, href: "/dashboard/issues" },
  { name: "Current Plan", icon: SquareCheckBig, href: "/dashboard/plan" },
  { name: "Payment History", icon: CreditCard, href: "/dashboard/payments" },
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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed sm:static inset-y-0 left-0 bg-black text-white z-50 sm:z-auto transition-transform transform sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-full sm:w-60 px-4 py-6`}
      >
        <div className="flex relative justify-center items-center mb-8">
          <Image
            src="/logo-white.svg"
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

        <nav className="space-y-2 overflow-y-auto">
          {navItems.map(({ name, icon: Icon, href }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(`${href}/`)) ||
              (name === "Business Overview" &&
                pathname === "/dashboard/details");
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
      </aside>
    </>
  );
};

export default Sidebar;
