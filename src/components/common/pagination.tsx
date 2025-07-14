"use client";

import { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationProps } from "./types";

export const Pagination: FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`px-3 py-1 rounded border ${
            p === page ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
