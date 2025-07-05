"use client";
import {
  Layers,
  CreditCard,
  Users,
  Menu,
  X,
  ChartNoAxesColumn,
  SquareCheckBig,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "General Info", icon: ChartNoAxesColumn, href: "/dashboard" },
    { name: "Issues", icon: Layers, href: "/dashboard/issues" },
    { name: "Current Plan", icon: SquareCheckBig, href: "/dashboard/plan" },
    { name: "Payment History", icon: CreditCard, href: "/dashboard/payments" },
    { name: "Users", icon: Users, href: "/dashboard/users" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white bg-black p-2 rounded-md focus:outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay when open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed sm:static top-0 left-0 h-screen sm:h-screen bg-black text-white z-50 sm:z-auto transition-transform transform sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-full sm:w-60 px-4 py-6`}
      >
        <div className="mb-12 flex items-center justify-center relative">
          <Image
            src="/logo-white.svg"
            alt="Anli Logo"
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
          {navItems.map(({ name, icon: Icon, href }) => (
            <Link
              href={href}
              key={name}
              className="flex items-center gap-3 text-sm transition-all duration-200 ease-in-out py-[13px] px-2 rounded-md hover:bg-[#FDEFE5] hover:text-[#FF6F00]"
              onClick={() => setIsOpen(false)} // close on click
            >
              <Icon size={24} /> {name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
