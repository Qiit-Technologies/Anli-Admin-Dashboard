"use client";

import { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationProps } from "./types";

export const Pagination: FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-6 relative">
      {/* Prev Button */}
      <button
        className="cursor-pointer px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
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
        >
          {p}
        </button>
      ))}

      {/* Next Button */}
      <button
        className="cursor-pointer px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
