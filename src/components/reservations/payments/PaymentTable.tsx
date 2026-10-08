'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { HelpCircle } from 'lucide-react';
import Pagination from './Pagination';
import { getPaymentReservations } from '@/app/actions/reservation';

export type PaymentStatus =
    | 'Confirmed'
    | 'Pending'
    | 'Refunded'
    | 'Failed'
    | 'Completed';

export interface Payment {
    id: string;
    reservationId: string;
    customerName: string;
    amount: string;
    paymentMethod: string;
    spaceBooked: string;
    table: string;
    date: string;
    paymentStatus: PaymentStatus;
}

interface PaymentTableProps {
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: string;
}

const paymentStatusStyles: Record<string, string> = {
    CONFIRMED: 'text-[#02542D] bg-[#EBFFEE] px-2 py-1 rounded-full',
    COMPLETED: 'text-[#02542D] bg-[#EBFFEE] px-2 py-1 rounded-full',
    PENDING: 'text-[#B54708] bg-[#FFFAEB] px-2 py-1 rounded-full',
    REFUNDED: 'text-[#026AA2] bg-[#F0F9FF] px-2 py-1 rounded-full',
    FAILED: 'text-[#B42318] bg-[#FEF3F2] px-2 py-1 rounded-full',
    Booked: 'text-[#02542D] bg-[#EBFFEE] px-2 py-1 rounded-full',
};

export default function PaymentTable({
    startDate,
    endDate,
    search,
    status,
}: PaymentTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const { data: response, isLoading } = useSWR(
        [
            'payment-reservations',
            startDate,
            endDate,
            search,
            status,
            currentPage,
        ],
        () =>
            getPaymentReservations(
                startDate,
                endDate,
                search,
                status,
                currentPage,
                10,
            ),
    );

    const reservations = response?.data?.data || [];
    const totalPages = response?.data?.totalPages || 1;

    // Reset page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, search, status]);

    const payments: Payment[] = reservations.map((r: any) => ({
        id: String(r.id),
        reservationId: `RSV-${String(r.id).padStart(5, '0')}`,
        customerName: `${r.firstName} ${r.lastName}`,
        amount: r.totalCost ? `₦${r.totalCost}` : '----',
        paymentMethod: r.paymentOption || '----',
        spaceBooked: r.spaceType || '----',
        table: r.tableNumber || '----',
        date: r.date
            ? new Date(r.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
              })
            : '----',
        paymentStatus: r.status,
    }));

    return (
        <div className="bg-white rounded-lg border ">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#F9FAFB] border-y border-[#EAECF0]">
                            <TableHead className="text-[#667085] font-medium text-xs py-3 h-16 px-2 text-center">
                                Reservation ID
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-16">
                                <span className="flex items-center gap-1">
                                    Customer Name
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-16">
                                <span className="flex items-center gap-1">
                                    Amount
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-16">
                                Payment Method
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-16">
                                Space booked.
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-16">
                                <span className="flex items-center justify-center gap-1">
                                    Table
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-16">
                                <span className="flex items-center justify-center gap-1">
                                    Date
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                Payment status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-10"
                                >
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A84FF]" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-10 text-gray-500"
                                >
                                    No records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow
                                    key={payment.id}
                                    className="border-b border-gray-100"
                                >
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {payment.reservationId}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {payment.customerName}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {payment.amount}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {payment.paymentMethod}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {payment.spaceBooked}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6 text-center">
                                        {payment.table}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6 text-center">
                                        {payment.date}
                                    </TableCell>
                                    <TableCell className="h-16 py-4 px-6">
                                        <span
                                            className={`text-xs font-normal ${paymentStatusStyles[payment.paymentStatus] || 'text-gray-500 bg-gray-100 px-2 py-1 rounded-full'}`}
                                        >
                                            {payment.paymentStatus}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
