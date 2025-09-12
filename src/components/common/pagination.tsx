"use client";

import { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationProps } from "./types";

export const Pagination: FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  console.log("Pagination props:", { page, totalPages });
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className="flex items-center justify-center space-x-2 mt-6 relative"
      style={{ zIndex: 9999 }}
    >
      {/* Prev Button */}
      <button
        className={`px-4 py-2 border-2 rounded-lg font-medium ${
          page <= 1
            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
            : "cursor-pointer hover:bg-blue-100 bg-blue-50 border-blue-300 text-blue-700"
        }`}
        onClick={() => {
          if (page > 1) {
            onPageChange(page - 1);
          }
        }}
        disabled={page <= 1}
        style={{ zIndex: 10000, position: "relative" }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {pages.map((p) => (
        <button
          key={p}
          className={`px-3 py-1 rounded border ${
            p === page
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200 text-gray-700"
          }`}
          onClick={() => {
            if (p !== page) onPageChange(p);
          }}
          style={{ zIndex: 10000, position: "relative" }}
        >
          {p}
        </button>
      ))}

      {/* Next Button */}
      <button
        className={`px-4 py-2 border-2 rounded-lg font-medium ${
          page >= totalPages
            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
            : "cursor-pointer hover:bg-blue-100 bg-blue-50 border-blue-300 text-blue-700"
        }`}
        onClick={() => {
          if (page < totalPages) {
            onPageChange(page + 1);
          }
        }}
        disabled={page >= totalPages}
        style={{ zIndex: 10000, position: "relative" }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
