import { Table } from '@tanstack/react-table';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
}

export function DataTablePagination<TData>({
    table,
}: Readonly<DataTablePaginationProps<TData>>) {
    const generatePaginationButtons = () => {
        const currentPage = table.getState().pagination.pageIndex + 1;
        const totalPages = table.getPageCount();
        const createPageButton = (pageNumber: number) => (
            <Button
                key={`page-${pageNumber}`}
                className={cn(
                    currentPage === pageNumber
                        ? 'bg-gray-100'
                        : 'bg-transparent',
                    'h-8 w-8 p-0 hover:bg-gray-100 border-none shadow-none text-black',
                )}
                onClick={() => table.setPageIndex(pageNumber - 1)}
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

    return (
        <div className="flex items-center justify-between px-2 w-full">
            <div className="flex items-center space-x-6 lg:space-x-8 w-full">
                <div className="flex items-center justify-between w-full">
                    <Button
                        variant="outline"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span>Previous</span>
                        <ArrowLeft />
                    </Button>

                    <div className="flex items-center space-x-1">
                        {generatePaginationButtons()}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span>Next</span>
                        <ArrowRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
