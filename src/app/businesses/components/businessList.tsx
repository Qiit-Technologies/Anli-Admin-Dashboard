"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { BusinessListProps } from "./types";
import { SearchIcon } from "lucide-react";

export default function BusinessList({ data }: BusinessListProps) {
  const [query, setQuery] = useState("");

  const filtered = data.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden px-4 py-6">
      {/* Background triangles */}
      {/* <div className="absolute inset-0 overflow-hidden z-1">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#FFE2CC]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-[#CDE9F4]"
          style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
        />
      </div> */}

      {/* Header */}
      <div className="text-center mb-8">
        <Image
          src="/logo.svg"
          alt="Anli logo"
          width={140}
          height={80}
          className="mx-auto mb-5"
        />
        <h1 className="text-[32px] font-medium text-black">Welcome Back</h1>
        <p className="text-black text-md font-medium">
          All Businesses in our system
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-10">
        <div className="flex items-center gap-2 border border-gray-300 rounded-md py-[10px] px-[14px] h-12 shadow-sm">
          <SearchIcon className="text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus:ring-0 focus-visible:ring-0 px-0 font-normal"
          />
        </div>
      </div>

      {/* Business Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {filtered.map((b, idx) => (
          <div
            key={idx}
            className={
              "bg-white border rounded-2xl py-[14px] px-[21px] text-center transition-all border-gray-200 hover:border-[#F47411]"
            }
            style={{
              boxShadow: "0px 1px 3px 0px #F4E7DD0F, 0px 3px 2px 0px #0000001A",
            }}
          >
            <Image
              src={b.icon}
              alt={b.name}
              width={80}
              height={80}
              className="mx-auto mb-3 object-contain"
            />
            <h2
              className={"font-medium text-[20px] text-black hover-[#F47411]"}
            >
              {b.name}
            </h2>
            <p className="text-md text-gray-500 font-normal">{b.subtext}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
