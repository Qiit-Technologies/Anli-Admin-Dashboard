'use client';

import Image from 'next/image';
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ReservationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationDate: string;
    customerName: string;
}

export function ReservationSuccessModal({
    isOpen,
    onClose,
    reservationDate,
    customerName,
}: ReservationSuccessModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-[665px] w-full rounded-2xl p-0 [&>button]:hidden"
                style={{ borderRadius: '16px' }}
            >
                <div className="flex flex-col items-center gap-6 py-10 px-10">
                    <div className="relative w-[80px] h-[80px]">
                        <Image
                            src="/reservation/reserveSuccess.svg"
                            alt="Success"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold text-[#432005]">
                            Reservation Booked
                        </h2>
                        <p className="text-[#9CA3AF] text-sm leading-relaxed">
                            Congratulations! Your reservation for{' '}
                            <span className="font-semibold text-[#432005]">
                                {customerName}
                            </span>{' '}
                            on{' '}
                            <span className="font-semibold text-[#432005]">
                                {reservationDate}
                            </span>
                            <br />
                            has been placed successfully.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full max-w-[250px] py-3 bg-[#007BFF] text-white rounded-lg font-semibold transition-colors hover:bg-[#0069d9]"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
