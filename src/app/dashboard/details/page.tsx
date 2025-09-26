"use client";
import Image from "next/image";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useBusiness } from "@/context/businessContext";
import { useState } from "react";
import { Calendar, LayoutGrid, MapPin, Phone, Plus } from "lucide-react";
import {
  capitalize,
  formatDate,
  generateModuleArr,
  removeUnderscore,
} from "@/utils/utils";

export default function BusinessDetailsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { business, loading } = useBusiness();
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="General Info"
        />
        <main className="px-4 sm:px-10 py-4 sm:py-10 space-y-6 bg-white">
          <div className="w-full p-4 sm:p-10 shadow-lg text-start flex flex-col gap-4 sm:gap-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8">
              <div className="border-4 border-white rounded-full flex-shrink-0">
                <Image
                  src="/sample-company.png"
                  alt="Company Logo"
                  width={120}
                  height={120}
                  className="sm:w-[150px] sm:h-[150px]"
                />
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <h2 className="text-2xl sm:text-4xl font-semibold text-[#0B0B0B] break-words">
                  {business?.name}
                </h2>

                <span
                  className={`w-fit mx-auto sm:mx-0 rounded-full text-sm font-semibold text-white px-4 py-1 ${
                    business?.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {business?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm text-[#0B0B0B]">
              <div className="flex items-center gap-2">
                <MapPin size={18} color={"gray"} className="flex-shrink-0" />
                <span className="break-words">
                  {business?.address ? capitalize(business.address) : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} color={"gray"} className="flex-shrink-0" />
                <span>{business?.owner?.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <LayoutGrid
                  size={18}
                  color={"gray"}
                  className="flex-shrink-0"
                />
                <span className="break-words">{business?.businessType}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                <Calendar size={18} color={"gray"} className="flex-shrink-0" />
                <span>
                  Joined{" "}
                  {business?.createdAt ? formatDate(business.createdAt) : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
              <span className="text-lg sm:text-xl font-bold text-[#0B0B0B]">
                Assigned Modules
              </span>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {business?.services
                  ? generateModuleArr(business.services).map(
                      (module, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-gray-800"
                        >
                          {capitalize(removeUnderscore(module))}
                        </span>
                      )
                    )
                  : null}
              </div>
            </div>
            <button className="rounded-[10px] bg-[#FF6F00] hover:bg-blue-700 text-white w-full sm:w-fit py-3 sm:py-2 px-4 font-semibold cursor-pointer flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform">
              Manage Modules <Plus size={18} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
