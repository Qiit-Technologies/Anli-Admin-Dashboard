'use client';

import { getActivityLogsByHotelId } from '@/app/actions/hotel';
import { useEffect, useState, useRef } from 'react';
import { FaBed } from 'react-icons/fa';
import { FiRefreshCw, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { MdAddCircleOutline, MdUpdate } from 'react-icons/md';
import { LiaDoorClosedSolid, LiaDoorOpenSolid } from 'react-icons/lia';

export interface BookingEntry {
    id: string;
    roomType: string;
    roomNumber: number;
    reservationNumber: string;
    user: string;
    timestamp: string;
    createdAt: string;
    adminName: string;
    guestName: string;
    action: string;
}

export enum ActionTypeEnum {
    CHECK_IN = 'CHECK_IN',
    CHECK_OUT = 'CHECK_OUT',
    ROOMS_REQUESTED = 'ROOMS_REQUESTED',
    GUEST_UPDATED = 'GUEST_UPDATED',
    EXTEND_STAY = 'EXTEND_STAY',
    COMPLIMENTARY_RESERVATION_CREATED = 'COMPLIMENTARY_RESERVATION_CREATED',
    RESERVATION_VOIDED = 'RESERVATION_VOIDED',
    DISCOUNTED_RESERVATION_CREATED = 'DISCOUNTED_RESERVATION_CREATED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    VOID_REQUESTED = 'VOID_REQUESTED',
    RESERVATION_REJECTED = 'RESERVATION_REJECTED',
    COMPLIMENTARY_APPROVED = 'COMPLIMENTARY_APPROVED',
    DISCOUNT_APPROVED = 'DISCOUNT_APPROVED',
    RESERVATION_APPROVED = 'RESERVATION_APPROVED',
    DISCOUNT_REQUESTED = 'DISCOUNT_REQUESTED',
    ROOM_TRANSFER = 'ROOM_TRANSFER',
    AUTO_CHECKED_IN = 'AUTO_CHECKED_IN',
}

export default function ActivityStream() {
    const [, setDropdownOpen] = useState(false);
    const [activities, setActivities] = useState<BookingEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchTrigger, setFetchTrigger] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getActionMessage = (action: string) => {
        switch (action) {
            case ActionTypeEnum.CHECK_IN:
                return 'checked in';
            case ActionTypeEnum.CHECK_OUT:
                return 'checked out';
            case ActionTypeEnum.ROOMS_REQUESTED:
                return 'requested room';
            case ActionTypeEnum.AUTO_CHECKED_IN:
                return 'auto checked in';
            case ActionTypeEnum.GUEST_UPDATED:
                return 'updated guest details';
            case ActionTypeEnum.EXTEND_STAY:
                return 'extended stay';
            case ActionTypeEnum.COMPLIMENTARY_RESERVATION_CREATED:
                return 'created complimentary reservation';
            case ActionTypeEnum.RESERVATION_VOIDED:
                return 'voided reservation';
            case ActionTypeEnum.DISCOUNTED_RESERVATION_CREATED:
                return 'created discount reservation';
            case ActionTypeEnum.PENDING_APPROVAL:
                return 'requested approval';
            case ActionTypeEnum.VOID_REQUESTED:
                return 'requested void';
            case ActionTypeEnum.RESERVATION_REJECTED:
                return 'had reservation rejected';
            case ActionTypeEnum.COMPLIMENTARY_APPROVED:
                return 'had complimentary approved';
            case ActionTypeEnum.DISCOUNT_APPROVED:
                return 'had discount approved';
            case ActionTypeEnum.RESERVATION_APPROVED:
                return 'had reservation approved';
            case ActionTypeEnum.DISCOUNT_REQUESTED:
                return 'requested discount';
            case ActionTypeEnum.ROOM_TRANSFER:
                return 'transferred room';
            default:
                return 'performed an action';
        }
    };

    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            const result = await getActivityLogsByHotelId();
            if (result && result.data) {
                setActivities(result.data);
            }
            setLoading(false);
        };

        fetchReservations();
    }, [fetchTrigger]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDateTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    return (
        <div className="w-[700px] h-[350px] mx-auto bg-white shadow-md rounded-lg border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <FiActivity className="h-5 w-5 text-gray-500" />
                    <h1 className="text-lg font-semibold text-gray-900">
                        Activity Streams
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200"
                        >
                            New Booking
                            <FiChevronDown className="h-4 w-4" />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-md w-48 z-10 py-1">
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                    All
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                    New Bookings
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                    Modifications
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                    Cancellations
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                    User Actions
                                </button>
                            </div>
                        )}
                    </div> */}

                    <button
                        onClick={() => setFetchTrigger((prev) => !prev)}
                        disabled={loading}
                        className="p-2 bg-gray-100 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Refresh"
                    >
                        <FiRefreshCw
                            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>

            <div className="scroll-container flex-1 p-4 overflow-auto">
                {loading ? (
                    <ActivitySkeleton />
                ) : activities?.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <p className="text-gray-500 text-sm">
                            No activity available
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities?.map((booking) => (
                            <ActivityItem
                                key={booking.id}
                                booking={booking}
                                getActionMessage={getActionMessage}
                                formatDateTime={formatDateTime}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityItem({
    booking,
    getActionMessage,
    formatDateTime,
}: {
    booking: BookingEntry;
    getActionMessage: (action: string) => string;
    formatDateTime: (timestamp: string) => { date: string; time: string };
}) {
    const { date, time } = formatDateTime(booking.timestamp);

    return (
        <div className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    {booking.action === ActionTypeEnum.CHECK_IN ? (
                        <LiaDoorOpenSolid className="h-4 w-4 text-green-500" />
                    ) : booking.action === ActionTypeEnum.CHECK_OUT ? (
                        <LiaDoorClosedSolid className="h-4 w-4 text-red-500" />
                    ) : booking.action === ActionTypeEnum.AUTO_CHECKED_IN ? (
                        <LiaDoorOpenSolid className="h-4 w-4 text-blue-500" />
                    ) : booking.action === ActionTypeEnum.GUEST_UPDATED ? (
                        <MdUpdate className="h-4 w-4 text-yellow-500" />
                    ) : booking.action === ActionTypeEnum.EXTEND_STAY ? (
                        <MdAddCircleOutline className="h-4 w-4 text-blue-500" />
                    ) : booking.action === ActionTypeEnum.ROOMS_REQUESTED ? (
                        <FaBed className="h-4 w-4 text-purple-500" />
                    ) : (
                        <FiUser className="h-4 w-4 text-blue-500" />
                    )}
                </div>

                <div>
                    <p className="text-sm text-gray-900">
                        <span className="font-medium">
                            {booking?.guestName}
                        </span>{' '}
                        {getActionMessage(booking?.action)} from room{' '}
                        {booking?.roomNumber}
                        {booking?.action !== ActionTypeEnum.ROOMS_REQUESTED && 
                         booking?.action !== ActionTypeEnum.AUTO_CHECKED_IN && (
                            <span className="text-gray-600">
                                {' '}
                                by{' '}
                                <span className="font-medium">
                                    {booking?.adminName}
                                </span>
                            </span>
                        )}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                        <FiClock className="h-3 w-3 mr-1" />
                        <span>
                            {date} at {time}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivitySkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-start gap-3">
                        <div className="h-4 w-4 rounded-full bg-gray-200" />
                        <div>
                            <div className="h-4 w-64 mb-2 bg-gray-200 rounded" />
                            <div className="h-3 w-32 bg-gray-200 rounded" />
                        </div>
                    </div>
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    );
}
