'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, HelpCircle, ArrowDown, ChevronDown, Loader2 } from 'lucide-react';
import DateRangePicker from '@/components/common/table/DateRangePicker';
import { useReservationActions } from '@/components/reservations/common/useReservationActions';
import {
    Reservation,
    ReservationStatus,
    statusStyles,
    PaymentType,
} from '@/components/reservations/types';
import { getTableReservations, updateTableReservation, getTableReservationById } from '@/app/actions/reservation';
import useSWR from 'swr';
import { useReservationSearch } from '@/context/ReservationSearchContext';
import ReservationStatusFilter from './ReservationStatusFilter';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

const ALL_STATUSES: ReservationStatus[] = [
    'Pending',
    'Booked',
    'In Progress',
    'Completed',
    'Cancelled',
];

const fetcher = (
    startDate?: string,
    endDate?: string,
    search?: string,
    status?: string,
) => {
    return getTableReservations(startDate, endDate, search, status).then(
        (res) => res.data,
    );
};

interface ReservationsTableProps {
    reservations?: Reservation[];
    loading?: boolean;
    onDateRangeChange?: (
        startDate: Date | undefined,
        endDate: Date | undefined,
    ) => void;
    onFilterClick?: () => void;
    onView?: (reservation: Reservation) => void;
    onEdit?: (reservation: Reservation) => void;
    onUpdate?: (reservation: Reservation) => void;
}

const formatStatus = (status: string): any => {
    if (!status) return 'Pending';
    const s = status.toUpperCase();
    if (s === 'PENDING' || s === 'PENDING PAYMENT') return 'Pending';
    if (s === 'BOOKED') return 'Booked';
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'CANCELLED') return 'Cancelled';
    if (s === 'IN PROGRESS') return 'In Progress';
    return status;
};

const mapToReservation = (item: any): Reservation => ({
    id: String(item.id || ''),
    rsvId: item.rsvId || `RSV-${item.id || '0000'}`,
    customerName:
        item.customerName ||
        `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
        'N/A',
    tableType: item.tableType || '',
    tableNumber: item.tableNumber || '',
    spaceType: item.spaceType || '',
    tableId: item.tableId,
    rsvTime: item.time || item.rsvTime || '',
    reservationDate: item.date || item.reservationDate || '',
    status: formatStatus(item.status) as ReservationStatus,
    paymentStatus: item.paymentStatus || 'Pending Payment',
    paymentType: (item.paymentType || 'Cash') as PaymentType,
    amountPaid: item.totalCost ? `₦${item.totalCost}` : item.amountPaid || '₦0.00',
});

// ── Inline Status Cell ─────────────────────────────────────────────────────
function StatusCell({
    reservation,
    onStatusChanged,
}: {
    reservation: Reservation;
    onStatusChanged: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<ReservationStatus | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSelect = (status: ReservationStatus) => {
        if (status === reservation.status) { setOpen(false); return; }
        setPendingStatus(status);
        setOpen(false);
        setConfirming(true);
    };

    const handleConfirm = async () => {
        if (!pendingStatus) return;
        setSaving(true);
        const { error } = await updateTableReservation(reservation.id, {
            status: pendingStatus.toUpperCase(),
        });
        setSaving(false);
        setConfirming(false);
        if (error) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={error}
                    type="error"
                />
            ));
        } else {
            toast.custom(() => (
                <Toast
                    title="Success"
                    description={`Status updated to "${pendingStatus}"`}
                    type="success"
                />
            ));
            onStatusChanged();
        }
        setPendingStatus(null);
    };

    return (
        <>
            {/* Clickable badge that opens dropdown */}
            <div className="relative inline-block">
                <button
                    type="button"
                    onClick={() => setOpen((p) => !p)}
                    className={`flex items-center gap-1 text-xs font-medium ${statusStyles[reservation.status as ReservationStatus]} cursor-pointer hover:opacity-80 transition-opacity`}
                >
                    {reservation.status === 'Completed' ? 'Completed' : reservation.status}
                    <ChevronDown size={11} />
                </button>

                {open && (
                    <>
                        {/* Backdrop to close */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpen(false)}
                        />
                        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                            {ALL_STATUSES.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleSelect(s)}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                                        s === reservation.status
                                            ? 'font-semibold text-blue-600'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirming} onOpenChange={(v) => { if (!saving) setConfirming(v); }}>
                <DialogContent className="max-w-[420px] rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-[#101828]">
                            Change Reservation Status
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#667085] mt-1">
                            Are you sure you want to change{' '}
                            <span className="font-medium text-[#101828]">
                                {reservation.customerName}
                            </span>
                            &apos;s reservation status from{' '}
                            <span className="font-medium">{reservation.status}</span> to{' '}
                            <span className="font-medium text-blue-600">{pendingStatus}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-5">
                        <Button
                            onClick={handleConfirm}
                            disabled={saving}
                            className="flex-1 h-10 bg-[#007BFF] hover:bg-[#0069d9] text-white text-sm font-semibold rounded-lg"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Yes, Update Status'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => { setConfirming(false); setPendingStatus(null); }}
                            disabled={saving}
                            className="flex-1 h-10 rounded-lg text-sm border-gray-300 text-gray-700"
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ── Main Table ─────────────────────────────────────────────────────────────
export default function ReservationsTable({
    reservations: initialReservations,
    loading: initialLoading = false,
    onDateRangeChange,
    onFilterClick,
    onView,
    onEdit,
    onUpdate,
}: ReservationsTableProps) {
    const {
        searchTerm,
        statusFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
    } = useReservationSearch();
    const debouncedSearch = useDebounce(searchTerm, 500);

    const startStr = startDate?.toISOString().split('T')[0];
    const endStr = endDate?.toISOString().split('T')[0];

    const {
        data: fetchedReservations,
        isLoading: swrLoading,
        mutate,
    } = useSWR(
        [
            '/table-reservations',
            startStr,
            endStr,
            debouncedSearch,
            statusFilter,
        ],
        () => fetcher(startStr, endStr, debouncedSearch, statusFilter),
    );

    const reservations =
        initialReservations ||
        (fetchedReservations ? fetchedReservations.map(mapToReservation) : []);

    const loading = initialLoading || swrLoading;

    const { handleView, handleEdit, reservationModals } = useReservationActions(
        {
            onView,
            onEdit,
            onEditSuccess: () => mutate(),
            onCancelSuccess: () => mutate(),
        },
    );

    const handleEditClick = async (reservationId: string) => {
        try {
            toast.loading('Loading reservation details...', { id: 'fetch-res-table' });
            const response = await getTableReservationById(reservationId);
            toast.dismiss('fetch-res-table');
            if (response.data) {
                const item = response.data;
                const mappedReservation: Reservation = {
                    id: String(item.id),
                    rsvId: `#RSV${item.id}`,
                    customerName: `${item.firstName} ${item.lastName}`,
                    tableType: item.tableType || '',
                    tableNumber: item.tableNumber || '',
                    spaceType: item.spaceType || '',
                    tableId: item.tableId,
                    rsvTime: item.time || item.rsvTime || '',
                    reservationDate: item.date || item.reservationDate || '',
                    status: item.status || 'Pending',
                    paymentStatus: item.paymentStatus || 'Pending Payment',
                    paymentType: item.paymentType || 'Cash',
                    amountPaid: item.totalCost ? `₦${item.totalCost}` : '₦0.00',
                };
                handleEdit(mappedReservation);
            } else {
                toast.custom(() => (
                    <Toast title="Error" description={response.error || 'Failed to fetch reservation'} type="error" />
                ));
            }
        } catch (error: any) {
            toast.dismiss('fetch-res-table');
            toast.custom(() => <Toast title="Error" description="An unexpected error occurred" type="error" />);
        }
    };

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-100">
            {reservationModals}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 px-3 gap-4 h-20">
                <h3 className="font-medium text-gray-900 text-lg">
                    Recently Reservation
                </h3>

                <div className="flex items-center gap-3">
                    <ReservationStatusFilter />
                    <DateRangePicker
                        dateRange={{ from: startDate, to: endDate }}
                        onDateRangeChange={(range) => {
                            if (range.from) setStartDate(range.from);
                            if (range.to) setEndDate(range.to);
                            if (range.from && range.to) {
                                onDateRangeChange?.(range.from, range.to);
                            }
                        }}
                    />
                    <button
                        onClick={onFilterClick}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
                    >
                        <SlidersHorizontal
                            size={16}
                            className="text-gray-500"
                        />
                        Filters
                    </button>
                </div>
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
                                    <HelpCircle size={14} className="text-gray-400" />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    RSV Time
                                    <HelpCircle size={14} className="text-gray-400" />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Reservation Date
                                    <HelpCircle size={14} className="text-gray-400" />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Status
                                    <ArrowDown size={14} className="text-gray-400" />
                                </span>
                            </TableHead>
                            <TableHead className="text-[#667085] font-medium text-xs py-3 px-6 h-11">
                                <span className="flex items-center gap-1">
                                    Actions
                                    <HelpCircle size={14} className="text-gray-400" />
                                </span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
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
                            reservations.map((reservation: Reservation) => (
                                <TableRow
                                    key={reservation.id}
                                    className="border-b border-gray-100"
                                >
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.rsvId}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.customerName}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.tableType || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.rsvTime}
                                    </TableCell>
                                    <TableCell className="text-[#667085] text-sm h-16 py-4 px-6">
                                        {reservation.reservationDate}
                                    </TableCell>
                                    <TableCell className="h-16 py-4 px-6">
                                        <StatusCell
                                            reservation={reservation}
                                            onStatusChanged={() => mutate()}
                                        />
                                    </TableCell>
                                    <TableCell className="h-16 py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleView(reservation)}
                                                className="text-gray-600 hover:text-gray-900 text-sm"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(reservation.id)}
                                                className="text-gray-600 hover:text-gray-900 text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

