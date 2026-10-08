'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
}: PaginationProps) {
    const handlePageChange = (page: number) => {
        if (onPageChange && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const getDisplayPages = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show current page and neighbors
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const displayPages = getDisplayPages();

    return (
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
            <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-gray-200 rounded-lg h-10 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft size={16} />
                Previous
            </button>

            <div className="flex items-center gap-1">
                {displayPages.map((page, index) =>
                    page === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-sm text-[#667085]"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`min-w-[40px] h-10 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === page
                                    ? 'bg-[#F9FAFB] text-[#1D2939]'
                                    : 'text-[#667085] hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ),
                )}
            </div>

            <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#344054] bg-white border border-gray-200 rounded-lg h-10 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
                <ArrowRight size={16} />
            </button>
        </div>
    );
}
