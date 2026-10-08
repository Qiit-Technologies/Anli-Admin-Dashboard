'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Reservation, statusStyles } from '@/components/reservations/types';

interface ReservationDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
    onExtendReservation?: (reservation: Reservation) => void;
    onCancelReservation?: (reservation: Reservation) => void;
    onEditReservation?: (reservation: Reservation) => void;
}

export default function ReservationDetailsModal({
    open,
    onOpenChange,
    reservation,
    onExtendReservation,
    onCancelReservation,
    onEditReservation,
}: ReservationDetailsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[665px] text-[#5B6469] rounded-2xl p-6 gap-[30px]">
                <DialogHeader className="flex flex-row items-start justify-between space-y-0 text-[#5B6469]">
                    <div>
                        <DialogTitle className="text-base font-bold">
                            {reservation?.customerName || 'Reservation'} Detail
                        </DialogTitle>
                        <p className="text-sm text-[#989C9D] mt-2">
                            {reservation?.rsvId || 'Loading...'}
                        </p>
                    </div>
                </DialogHeader>
                <hr />

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-3">
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Customer Full Name
                            </p>
                            <p className="font-bold">
                                {reservation?.customerName || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Scheduled Time/ Date
                            </p>
                            <p className="font-semibold">
                                {reservation?.reservationDate || 'N/A'}{' '}
                                {reservation?.rsvTime || ''}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3">
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Payment Type
                            </p>
                            <p className="font-bold">
                                {reservation?.paymentType || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Amount paid
                            </p>
                            <p className="font-semibold">
                                {reservation?.amountPaid || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Status
                            </p>
                            <span
                                className={`text-sm ${reservation ? statusStyles[reservation.status] : ''}`}
                            >
                                {reservation?.status || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3">
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Table Type
                            </p>
                            <p className="font-bold">
                                {reservation?.tableType || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Table Number
                            </p>
                            <p className="font-semibold">
                                {reservation?.tableNumber || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#5F738C] mb-1">
                                Space Type
                            </p>
                            <p className="font-semibold">
                                {reservation?.spaceType || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t-1 border-[#E8DDDD]">
                    <div className="flex items-center gap-8">
                        <Button
                            onClick={() =>
                                reservation &&
                                onExtendReservation?.(reservation)
                            }
                            disabled={!reservation}
                            className="bg-[#007BFF] hover:bg-[#007BFF]/80 text-white rounded-lg px-9 py-4 h-14"
                        >
                            Extend Reservation
                        </Button>
                        <Button
                            onClick={() =>
                                reservation &&
                                onCancelReservation?.(reservation)
                            }
                            disabled={!reservation}
                            variant="outline"
                            className="bg-[#e5ebee] hover:bg-[#e5ebee]/80 text-[#565454] rounded-lg px-9 py-4 h-14"
                        >
                            Cancel Reservation
                        </Button>
                    </div>

                    <button
                        onClick={() =>
                            reservation && onEditReservation?.(reservation)
                        }
                        disabled={!reservation}
                        className="text-[#007BFF] hover:text-[#007BFF]/80 font-medium mr-6 px-9 py-4 disabled:opacity-50"
                    >
                        Edit RSV
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
