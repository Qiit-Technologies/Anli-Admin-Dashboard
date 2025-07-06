"use client";

import { useState } from "react";
import Image from "next/image";
import { BusinessListProps } from "./types";
import SearchWithIcon from "@/components/common/searchWithIcon";

export default function BusinessList({ data }: BusinessListProps) {
  const [query, setQuery] = useState("");

  const filtered = data.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white relative overflow-hidden px-4 py-6">
      {/* Background triangles */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <div
          className="absolute top-0 left-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-[#FFE2CC]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] bg-[#CDE9F4]"
          style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
        />
      </div>

      {/* Header */}
      <div className="text-center mb-8 z-20 relative px-4">
        <Image
          src="/logo.svg"
          alt="Anli logo"
          width={120}
          height={70}
          className="mx-auto mb-5"
        />
        <h1 className="text-2xl sm:text-[32px] font-medium text-black">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-md text-black font-medium">
          All Businesses in our system
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-10 z-20 relative">
        <SearchWithIcon
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </div>

      {/* Business Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto z-20 relative px-4">
        {filtered.map((b, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-2xl py-4 px-5 text-center transition-all border-gray-200 hover:border-[#F47411]"
            style={{
              boxShadow: "0px 1px 3px 0px #F4E7DD0F, 0px 3px 2px 0px #0000001A",
            }}
          >
            <Image
              src={b.icon}
              alt={b.name}
              width={70}
              height={70}
              className="mx-auto mb-3 object-contain"
            />
            <h2 className="font-medium text-lg sm:text-xl text-black hover:text-[#F47411]">
              {b.name}
            </h2>
            <p className="text-sm sm:text-md text-gray-500 font-normal">
              {b.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
