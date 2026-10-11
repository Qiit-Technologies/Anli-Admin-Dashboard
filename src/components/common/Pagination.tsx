import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    /**
     * M12 — while the list data is loading, the "Showing X to Y of Z entries"
     * text flashed stale counts in the search area. Pass loading so the range
     * renders a placeholder until the figures are real.
     */
    loading?: boolean;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    onItemsPerPageChange,
    loading = false,
}: PaginationProps) {
    const generatePaginationButtons = () => {
        const createPageButton = (pageNumber: number) => (
            <Button
                key={`page-${pageNumber}`}
                className={cn(
                    currentPage === pageNumber
                        ? 'bg-gray-100'
                        : 'bg-transparent',
                    'h-8 w-8 p-0 hover:bg-gray-100 border-none shadow-none text-black',
                )}
                onClick={() => onPageChange(pageNumber)}
                disabled={currentPage === pageNumber}
            >
                {pageNumber}
            </Button>
        );

        const createEllipsis = (key: number) => (
            <span key={`ellipsis-${key}`} className="mx-1">
                ...
            </span>
        );

        const getPageNumbers = () => {
            if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }

            const leftSibling = Math.max(currentPage - 1, 1);
            const rightSibling = Math.min(currentPage + 1, totalPages);

            const shouldShowLeftDots = leftSibling > 2;
            const shouldShowRightDots = rightSibling < totalPages - 1;

            if (!shouldShowLeftDots && shouldShowRightDots) {
                return [
                    ...Array.from({ length: 5 }, (_, i) => i + 1),
                    null,
                    totalPages,
                ];
            }

            if (shouldShowLeftDots && !shouldShowRightDots) {
                return [
                    1,
                    null,
                    ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i),
                ];
            }

            return [
                1,
                null,
                leftSibling,
                currentPage,
                rightSibling,
                null,
                totalPages,
            ];
        };

        return getPageNumbers().map((pageNumber, index) =>
            pageNumber === null
                ? createEllipsis(index)
                : createPageButton(pageNumber),
        );
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-2 py-4 w-full">
            <div className="text-sm text-gray-600" aria-live="polite">
                {loading ? (
                    <span className="inline-block h-4 w-40 animate-pulse rounded bg-gray-200 align-middle" />
                ) : (
                    <>
                        Showing {startItem} to {endItem} of {totalItems} entries
                    </>
                )}
            </div>
            
            <div className="flex items-center space-x-4">
                {onItemsPerPageChange && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">entries</span>
                    </div>
                )}

                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 px-3"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    {generatePaginationButtons()}

                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3"
                    >
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
