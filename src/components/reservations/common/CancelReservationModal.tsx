'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Reservation } from '@/components/reservations/types';
import Image from 'next/image';

interface CancelReservationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: Reservation | null;
    onConfirmCancel?: (reservation: Reservation, reason: string) => void;
}

export default function CancelReservationModal({
    open,
    onOpenChange,
    reservation,
    onConfirmCancel,
}: CancelReservationModalProps) {
    const [reason, setReason] = useState('');

    if (!reservation) return null;

    const handleDone = () => {
        onConfirmCancel?.(reservation, reason);
        setReason('');
        onOpenChange(false);
    };

    const handleCancel = () => {
        setReason('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[473px] rounded-lg py-[20px] px-[35px] gap-6 [&>button]:hidden">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-[#FEE4E2] flex items-center justify-center">
                        <Image
                            src="/reservation/cancle.svg"
                            alt="cancel"
                            width={79}
                            height={74}
                        />
                    </div>

                    <div className="text-center">
                        <DialogTitle className="text-xl font-bold text-[#432005] mb-2">
                            You Cancelled this Reservation
                        </DialogTitle>
                        <p className="text-sm text-[#9CA3AF]">
                            Please give reason for rejections
                        </p>
                    </div>

                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="reason for rejection"
                        className="w-[357px] h-14 border border-[#D1D5DB] rounded-lg px-4 py-3 text-sm placeholder:text-[#D1D5DB] focus:outline-none"
                    />

                    <div className="flex items-center gap-4 w-full">
                        <Button
                            onClick={handleDone}
                            className="flex-1 bg-[#007BFF] hover:bg-[#007BFF]/90 text-white rounded-lg py-5 h-[53px]"
                        >
                            Done
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="flex-1 border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10 rounded-lg py-5 h-[53px]"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
