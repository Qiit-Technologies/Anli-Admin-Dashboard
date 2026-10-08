'use client';

import Image from 'next/image';
import React from 'react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservationDate?: string;
}

export default function SuccessModal({
    isOpen,
    onClose,
    reservationDate = '2th/ 09/2025',
}: SuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div
                className="relative bg-white rounded-lg flex flex-col items-center gap-6 py-[35px] px-8"
                style={{ width: 473, minHeight: 344 }}
            >
                <div className="relative w-[79px] h-[73px]">
                    <Image
                        src="/reservation/reserveSuccess.svg"
                        alt="Success"
                        fill
                        className="object-contain"
                    />
                </div>

                <h2 className="text-xl font-bold text-[#432005]">
                    Reservation Booked
                </h2>

                <p className="text-[#9CA3AF] text-center text-sm">
                    Congratulation your reservation for {reservationDate}
                    <br />
                    has been placed successfully.
                </p>

                <button
                    onClick={onClose}
                    className="w-full max-w-[201px] py-3 bg-[#007BFF] text-white rounded-[8px] font-semibold transition-colors"
                >
                    Back to home
                </button>
            </div>
        </div>
    );
}
