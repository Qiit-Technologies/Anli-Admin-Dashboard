'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { Loader2, Mail, Phone, User } from 'lucide-react';
import {
    cancelPublicBooking,
    getPublicBookingForCancellation,
    PublicBookingCancellationPreview,
    PublicBookingCancellationRoom,
} from '@/app/actions/booking';

function formatCurrency(amount: number) {
    return `₦${Number(amount || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function CancelBookingPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cancelledMessage, setCancelledMessage] = useState<string | null>(null);
    const [booking, setBooking] =
        useState<PublicBookingCancellationPreview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [selectedBookingCodes, setSelectedBookingCodes] = useState<string[]>(
        [],
    );

    const loadBooking = useCallback(async () => {
        if (!token) {
            setError(
                'Invalid cancellation link. Please use the link from your confirmation email.',
            );
            setLoading(false);
            return;
        }

        setLoading(true);
        const result = await getPublicBookingForCancellation(token);
        setLoading(false);

        if (!result.success || !result.data) {
            setError(result.message || 'Unable to load reservation.');
            return;
        }

        setBooking(result.data);
        setSelectedBookingCodes(
            result.data.rooms
                .filter((room) => room.canCancel)
                .map((room) => room.bookingCode),
        );
        if (result.data.isVoid) {
            setCancelledMessage('This reservation has already been cancelled.');
        }
    }, [token]);

    useEffect(() => {
        loadBooking();
    }, [loadBooking]);

    const cancelableRooms =
        booking?.rooms.filter((room) => room.canCancel && !room.isVoid) ?? [];
    const hasMultipleCancelable = cancelableRooms.length > 1;

    const toggleRoomSelection = (bookingCode: string) => {
        setSelectedBookingCodes((prev) =>
            prev.includes(bookingCode)
                ? prev.filter((code) => code !== bookingCode)
                : [...prev, bookingCode],
        );
    };

    const handleCancel = async () => {
        if (!token || !booking?.canCancel) return;

        if (hasMultipleCancelable && selectedBookingCodes.length === 0) {
            toast.error('Select at least one room to cancel.');
            return;
        }

        setSubmitting(true);
        const result = await cancelPublicBooking(
            token,
            reason,
            hasMultipleCancelable ? selectedBookingCodes : undefined,
        );
        setSubmitting(false);

        if (!result.success) {
            toast.error(result.message);
            return;
        }

        toast.success(result.data?.message || 'Reservation cancelled');

        if (result.data?.allCancelled) {
            setCancelledMessage(result.data.message);
            setBooking((prev) =>
                prev
                    ? {
                          ...prev,
                          isVoid: true,
                          canCancel: false,
                          activeRoomCount: 0,
                      }
                    : prev,
            );
        } else {
            setCancelledMessage(result.data?.message ?? null);
            await loadBooking();
        }
    };

    const getRoomConfirmationLabel = (room: PublicBookingCancellationRoom) => {
        if (room.roomNumber) {
            return `Room ${room.roomNumber}`;
        }
        const parts = room.bookingCode?.split('-') ?? [];
        if (parts.length >= 2) {
            return parts.slice(-2).join('-');
        }
        return room.bookingCode;
    };

    const renderRoomRow = (room: PublicBookingCancellationRoom) => {
        const isSelected = selectedBookingCodes.includes(room.bookingCode);
        const isDisabled = !room.canCancel || room.isVoid;
        const guestName = room.guestName || booking?.fullName || 'Guest';

        return (
            <li
                key={room.bookingCode}
                className={`rounded-md border p-3 ${
                    room.isVoid
                        ? 'border-gray-200 bg-gray-50 opacity-70'
                        : isSelected
                          ? 'border-orion-blue bg-orion-blue/5'
                          : 'border-gray-200 bg-white'
                }`}
            >
                <label
                    className={`flex items-start gap-3 ${
                        isDisabled ? 'cursor-default' : 'cursor-pointer'
                    }`}
                >
                    {hasMultipleCancelable && (
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-orion-blue focus:ring-orion-blue"
                            checked={isSelected}
                            disabled={isDisabled || submitting}
                            onChange={() => toggleRoomSelection(room.bookingCode)}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{guestName}</p>
                        <p className="text-sm text-gray-600 mt-0.5">
                            {room.roomTypeName ||
                                booking?.roomTypeName ||
                                'Room'}
                            {room.roomNumber ? ` · Room ${room.roomNumber}` : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Confirmation: {getRoomConfirmationLabel(room)}
                            {room.amount > 0 && (
                                <span className="ml-2">
                                    · {formatCurrency(room.amount)}
                                </span>
                            )}
                        </p>
                        {room.isVoid && (
                            <p className="text-xs text-red-600 mt-1 font-medium">
                                Cancelled
                            </p>
                        )}
                        {!room.isVoid && !room.canCancel && room.cancelBlockedReason && (
                            <p className="text-xs text-amber-700 mt-1">
                                {room.cancelBlockedReason}
                            </p>
                        )}
                    </div>
                </label>
            </li>
        );
    };

    return (
        <main className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
            <div className="w-full bg-white border-b border-gray-100 py-6">
                <div className="max-w-lg mx-auto px-4">
                    <h1 className="text-[#0B3B60] text-xl font-bold">
                        Cancel reservation
                    </h1>
                </div>
            </div>

            <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-orion-blue" />
                        <p className="text-sm">Loading your reservation…</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-white border border-red-200 rounded-md p-6 text-center">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {!loading && !error && booking && (
                    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                        {cancelledMessage && booking.isVoid ? (
                            <div className="p-6 md:p-8 text-center space-y-3">
                                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-2xl font-bold">
                                    ✓
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Reservation cancelled
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {cancelledMessage} A confirmation email has been
                                    sent to <strong>{booking.email}</strong>.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-gray-100 space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {booking.hotelName}
                                        </p>
                                        <h2 className="text-lg font-bold text-gray-800 mt-1">
                                            {booking.fullName}
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <Mail className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                                                    Email
                                                </p>
                                                <p className="break-all">{booking.email}</p>
                                            </div>
                                        </div>
                                        {booking.phoneNumber && (
                                            <div className="flex items-start gap-2 text-gray-600">
                                                <Phone className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                                <div>
                                                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                                                        Phone
                                                    </p>
                                                    <p>{booking.phoneNumber}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <User className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                            <div>
                                                <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                                                    Guests
                                                </p>
                                                <p>{booking.numberOfGuests}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600 space-y-2 pt-1">
                                        <p>
                                            Check-in:{' '}
                                            {dayjs(booking.startDate).format(
                                                'ddd, D MMM YYYY',
                                            )}
                                        </p>
                                        <p>
                                            Check-out:{' '}
                                            {dayjs(booking.endDate).format(
                                                'ddd, D MMM YYYY',
                                            )}
                                        </p>
                                        {booking.totalAmount > 0 && (
                                            <p>
                                                Total amount:{' '}
                                                <strong>
                                                    {formatCurrency(booking.totalAmount)}
                                                </strong>
                                            </p>
                                        )}
                                        {booking.specialRequests && (
                                            <p>
                                                Special requests:{' '}
                                                <span className="italic">
                                                    {booking.specialRequests}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {booking.rooms?.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                                {hasMultipleCancelable
                                                    ? 'Select rooms to cancel'
                                                    : 'Room reservations'}
                                            </p>
                                            <ul className="space-y-2">
                                                {booking.rooms.map(renderRoomRow)}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {cancelledMessage && !booking.isVoid && (
                                    <div className="px-6 py-3 bg-green-50 text-green-800 text-sm border-b border-green-100">
                                        {cancelledMessage}
                                    </div>
                                )}

                                {!booking.canCancel && cancelableRooms.length === 0 ? (
                                    <div className="p-6 bg-amber-50 text-amber-800 text-sm">
                                        {booking.cancelBlockedReason ||
                                            'This reservation cannot be cancelled online.'}
                                    </div>
                                ) : cancelableRooms.length > 0 ? (
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                Reason for cancellation (optional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={reason}
                                                onChange={(e) =>
                                                    setReason(e.target.value)
                                                }
                                                placeholder="Tell us why you are cancelling"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orion-blue/30 focus:border-orion-blue resize-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            disabled={
                                                submitting ||
                                                (hasMultipleCancelable &&
                                                    selectedBookingCodes.length === 0)
                                            }
                                            onClick={handleCancel}
                                            className="w-full h-11 bg-orion-blue hover:bg-orion-blue/90 text-white rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Cancelling…
                                                </>
                                            ) : hasMultipleCancelable ? (
                                                `Cancel selected (${selectedBookingCodes.length})`
                                            ) : (
                                                'Confirm cancellation'
                                            )}
                                        </button>
                                        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                                            This action cannot be undone. Selected
                                            rooms will be released back to availability.
                                        </p>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
