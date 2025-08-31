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

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="General Info"
        />
        <main className="px-4 sm:px-10 py-10 space-y-6 bg-white">
          <div className="w-full p-10 shadow-lg text-start flex flex-col gap-6">
            <div className="flex items-center gap-8 ">
              <div className="border-4 border-white rounded-full ">
                <Image
                  src="/sample-company.png"
                  alt="Company Logo"
                  width={150}
                  height={150}
                />
              </div>
              <h2 className="text-4xl font-semibold text-[#0B0B0B]">
                {business?.name}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} color={"gray"} />
                <span className="text-md font-medium text-[#0B0B0B]">
                  {capitalize(business?.address!)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} color={"gray"} />
                <span className="text-sm text-[#0B0B0B]">
                  +234 8070 234 000
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} color={"gray"} />
                <span className="text-sm text-[#0B0B0B]">
                  Joined {formatDate(business?.createdAt!)}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xl font-bold text-[#0B0B0B]">
                Assigned Modules
              </span>
              <div className="flex flex-wrap gap-4">
                {generateModuleArr(business?.services!).map((module, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800"
                  >
                    {capitalize(removeUnderscore(module))}
                  </span>
                ))}
              </div>
            </div>
            <button className="rounded-[10px] bg-[#007BFF] hover:bg-blue-700 text-white w-fit py-2 px-4 font-semibold cursor-pointer flex gap-2">
              Manage Modules <Plus />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
