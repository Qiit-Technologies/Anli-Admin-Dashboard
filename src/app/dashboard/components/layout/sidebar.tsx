"use client";
import {
  Layers,
  CreditCard,
  Users,
  X,
  ChartNoAxesColumn,
  SquareCheckBig,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const pathname = usePathname(); // make sure this is imported

  const navItems = [
    { name: "General Info", icon: ChartNoAxesColumn, href: "/dashboard" },
    { name: "Issues", icon: Layers, href: "/dashboard/issues" },
    { name: "Current Plan", icon: SquareCheckBig, href: "/dashboard/plan" },
    { name: "Payment History", icon: CreditCard, href: "/dashboard/payments" },
    { name: "Users", icon: Users, href: "/dashboard/users" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed sm:static inset-y-0 left-0 bg-black text-white z-50 sm:z-auto transition-transform transform sm:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"} w-full sm:w-60 px-4 py-6`}
      >
        <div className="mb-12 flex items-center justify-center relative">
          <Image
            src="/logo-white.svg"
            alt="Logo"
            width={100}
            height={24}
            className="h-6"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-white sm:hidden absolute right-0"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-4">
          {navItems.map(({ name, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 text-base font-medium transition-all duration-200 ease-in-out py-[13px] px-3 rounded-md ${
                  isActive
                    ? "bg-[#FDEFE5] text-[#FF6F00]"
                    : "hover:bg-[#FDEFE5] hover:text-[#FF6F00]"
                }`}
              >
                <Icon size={24} />
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
