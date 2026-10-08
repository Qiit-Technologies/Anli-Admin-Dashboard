'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { EmployeeType } from '@/types/employee';
import { formatDate } from '@/lib/helpers';
import { MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface StaffingTableV2Props {
    data: EmployeeType[];
    isLoading: boolean;
    searchQuery: string;
    onView: (staff: EmployeeType) => void;
    onEdit: (staff: EmployeeType) => void;
    onDelete: (staff: EmployeeType) => void;
}

export const StaffingTableV2 = ({
    data,
    isLoading,
    searchQuery,
    onView,
    onEdit,
    onDelete,
}: StaffingTableV2Props) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredData = data.filter(
        (item) =>
            item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.roles.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    if (isLoading) {
        return (
            <div className="p-8 text-center text-[#667085]">
                Loading staff members...
            </div>
        );
    }

    return (
        <div className="w-full">
            <Table>
                <TableHeader className="bg-[#F9FAFB]">
                    <TableRow className="hover:bg-transparent border-b border-[#EAECF0]">
                        <TableHead className="py-4 px-6 text-xs font-semibold text-[#475467] uppercase tracking-wider">
                            User Name
                        </TableHead>
                        <TableHead className="py-4 px-6 text-xs font-semibold text-[#475467] uppercase tracking-wider">
                            User Role
                        </TableHead>
                        <TableHead className="py-4 px-6 text-xs font-semibold text-[#475467] uppercase tracking-wider">
                            Created By
                        </TableHead>
                        <TableHead className="py-4 px-6 text-xs font-semibold text-[#475467] uppercase tracking-wider">
                            Date Created
                        </TableHead>
                        <TableHead className="py-4 px-6 text-xs font-semibold text-[#475467] uppercase tracking-wider">
                            Modified By
                        </TableHead>
                        <TableHead className="py-4 px-6 text-xs font-semibold text-[#475467] uppercase tracking-wider">
                            Date Modified
                        </TableHead>
                        <TableHead className="py-4 px-6 text-xs font-semibold text-[#475467] uppercase tracking-wider">
                            Status
                        </TableHead>
                        <TableHead className="py-4 px-6"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((staff) => (
                            <TableRow
                                key={staff.id}
                                className="hover:bg-[#F9FAFB] border-b border-[#EAECF0]"
                            >
                                <TableCell className="py-4 px-6 text-sm font-medium text-[#475467]">
                                    {staff.fullName}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-[#475467]">
                                    {staff.roles.name}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-[#475467]">
                                    Admin
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-[#475467]">
                                    {formatDate(staff.createdAt)}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-[#475467]">
                                    Admin
                                </TableCell>
                                <TableCell className="py-4 px-6 text-sm text-[#475467]">
                                    {formatDate(staff.createdAt)}
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            staff.isActive
                                                ? 'bg-[#ECFDF3] text-[#027A48]'
                                                : 'bg-[#FEF3F2] text-[#B42318]'
                                        }`}
                                    >
                                        {staff.isActive
                                            ? 'Active'
                                            : 'In-Active'}
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[#98A2B3]"
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-[180px] p-2 rounded-xl shadow-lg border border-[#EAECF0]"
                                        >
                                            <DropdownMenuItem
                                                className="py-3 px-4 text-[#452718] font-bold cursor-pointer hover:bg-[#F9FAFB] rounded-lg"
                                                onClick={() => onView(staff)}
                                            >
                                                View User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="py-3 px-4 text-[#94A3B8] font-semibold cursor-pointer hover:bg-[#F9FAFB] rounded-lg"
                                                onClick={() => onEdit(staff)}
                                            >
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="py-3 px-4 text-[#94A3B8] font-semibold cursor-pointer hover:bg-[#F9FAFB] border-t border-[#EAECF0] rounded-lg"
                                                onClick={() => onDelete(staff)}
                                            >
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="py-10 text-center text-[#667085]"
                            >
                                No staff members found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-[#EAECF0] bg-white">
                <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                        variant="outline"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="text-sm border-[#D0D5DD] rounded-lg"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                            )
                        }
                        disabled={
                            currentPage === totalPages || totalPages === 0
                        }
                        className="text-sm border-[#D0D5DD] rounded-lg"
                    >
                        Next
                    </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-[#344054]">
                            Page{' '}
                            <span className="font-medium">{currentPage}</span>{' '}
                            of{' '}
                            <span className="font-medium">
                                {totalPages || 1}
                            </span>
                        </p>
                    </div>
                    <div>
                        <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px gap-2"
                            aria-label="Pagination"
                        >
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                className="h-9 px-3 border-[#D0D5DD] rounded-lg text-[#344054] font-semibold gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    // Show first page, last page, and pages around current page
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 &&
                                            page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={
                                                    currentPage === page
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`h-9 w-9 p-0 rounded-lg ${
                                                    currentPage === page
                                                        ? 'bg-[#F9FAFB] text-[#1D2939]'
                                                        : 'text-[#667085]'
                                                }`}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return (
                                            <span
                                                key={page}
                                                className="px-2 text-[#667085]"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages),
                                    )
                                }
                                disabled={
                                    currentPage === totalPages ||
                                    totalPages === 0
                                }
                                className="h-9 px-3 border-[#D0D5DD] rounded-lg text-[#344054] font-semibold gap-2"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};
