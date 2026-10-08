'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { HelpCircle, ArrowDown } from 'lucide-react';
import { useReservationActions } from '@/components/reservations/common/useReservationActions';
import {
    Reservation,
    statusStyles,
    paymentStyles,
} from '@/components/reservations/types';
import { getTableReservations } from '@/app/actions/reservation';
import { useState, useEffect } from 'react';

interface ReservationsTableProps {
    reservations?: Reservation[];
    loading?: boolean;
    onView?: (reservation: Reservation) => void;
    onEdit?: (reservation: Reservation) => void;
    onUpdate?: (reservation: Reservation) => void;
}

const mapToReservation = (item: any): Reservation => ({
    id: String(item.id || ''),
    rsvId: item.rsvId || `RSV-${item.id || '0000'}`,
    customerName:
        item.customerName ||
        `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
        'N/A',
    tableType: item.tableType || 'Single',
    tableNumber: item.tableNumber || 'N/A',
    spaceType: item.spaceType || 'N/A',
    rsvTime: item.time || item.rsvTime || 'N/A',
    reservationDate: item.date || item.reservationDate || 'N/A',
    status: item.status || 'Pending',
    paymentStatus: item.paymentStatus || 'Pending Payment',
    paymentType: item.paymentType || 'Cash',
    amountPaid: item.amountPaid || '$0.00',
});

export default function OtherReservations({
    reservations: initialReservations,
    loading: initialLoading = false,
    onView,
    onEdit,
    onUpdate,
}: ReservationsTableProps) {
    const [reservations, setReservations] = useState<Reservation[]>(
        initialReservations || [],
    );
    const [loading, setLoading] = useState(initialLoading);

    useEffect(() => {
        if (initialReservations) {
            setReservations(initialReservations);
            setLoading(initialLoading);
            return;
        }

        const fetchReservations = async () => {
            setLoading(true);
            try {
                const response = await getTableReservations();
                if (response.data && Array.isArray(response.data)) {
                    setReservations(response.data.map(mapToReservation));
                }
            } catch (error: any) {
                console.error('Failed to fetch reservations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [initialReservations, initialLoading]);
    const { handleView, handleEdit, reservationModals } = useReservationActions(
        {
            onView,
            onEdit,
        },
    );

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 px-3 gap-4 h-20">
                <h3 className="font-medium text-gray-900 text-lg">
                    Other Reservations
                </h3>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#F9FAFB] border-y border-[#EAECF0] py-3 px-6">
                            <TableHead className="text-[#667085] font-medium text-xs uppercase py-3 px-6 h-11">
                                RSV ID
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                Customer Name
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Table Type
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    RSV Time
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Payment
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Reservation Date
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Status
                                    <ArrowDown
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Actions
                                    <HelpCircle
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center py-10"
                                >
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : reservations.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center py-10 text-gray-500"
                                >
                                    No reservations found
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservations.map((reservation) => (
                                <TableRow
                                    key={reservation.id}
                                    className="border-b border-gray-10"
                                >
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.rsvId}
                                    </TableCell>
                                    <TableCell className="0 text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.customerName}
                                    </TableCell>
                                    <TableCell className="0 text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.tableType}
                                    </TableCell>
                                    <TableCell className="0 text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.rsvTime}
                                    </TableCell>
                                    <TableCell className="h-16 py-4 px-6">
                                        <span
                                            className={`text-xs font-medium ${paymentStyles[reservation.paymentStatus]}`}
                                        >
                                            {reservation.paymentStatus ===
                                            'Paid'
                                                ? 'Paid'
                                                : reservation.paymentStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell className="0 text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.reservationDate}
                                    </TableCell>
                                    <TableCell className="h-16 py-4 px-6">
                                        <span
                                            className={`text-xs font-medium ${statusStyles[reservation.status]}`}
                                        >
                                            {reservation.status === 'Completed'
                                                ? 'Complected'
                                                : reservation.status}
                                        </span>
                                    </TableCell>

                                    <TableCell className="h-16 py-4 px-6">
                                        {reservation.status === 'Pending' ? (
                                            <button
                                                onClick={() =>
                                                    onUpdate?.(reservation)
                                                }
                                                className="text-gray-600 hover:text-gray-900 text-sm"
                                            >
                                                Update
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() =>
                                                        handleView(reservation)
                                                    }
                                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleEdit(reservation)
                                                    }
                                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {reservationModals}
        </div>
    );
}
