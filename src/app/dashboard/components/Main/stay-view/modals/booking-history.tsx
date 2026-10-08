'use client';

import { useState } from 'react';
import { FaTimes, FaSearch, FaFilter, FaFileDownload } from 'react-icons/fa';
import { BookingStatus } from '../types';

interface BookingHistoryEntry {
    id: string;
    fullName: string;
    startDate: Date;
    endDate: Date;
    status: BookingStatus;
    amountPaid: number;
    outstanding: number;
    startTime: string;
    endTime: string;
    paymentStatus: 'paid' | 'pending' | 'refunded';
}

interface BookingHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomType: string;
    roomNumber: string;
    bookingHistory: BookingHistoryEntry[];
}

export function BookingHistoryModal({
    isOpen,
    onClose,
    roomType,
    roomNumber,
    bookingHistory,
}: BookingHistoryModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>(
        'all',
    );
    const [sortBy, setSortBy] = useState<'date' | 'guest' | 'amount'>('date');

    if (!isOpen) return null;

    const getStatusColor = (status: BookingStatus): string => {
        switch (status) {
            case 'BOOKED':
                return 'bg-green-100 text-green-800';
            case 'AVAIL':
                return 'bg-blue text-blue-800';
            case 'DIRTY':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string): string => {
        switch (status) {
            case 'paid':
                return 'text-green-600';
            case 'pending':
                return 'text-amber-600';
            case 'refunded':
                return 'text-blue';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // const formatCurrency = (amount: number) => {
    //     return new Intl.NumberFormat('en-US', {
    //         style: 'currency',
    //         currency: 'USD',
    //     }).format(amount);
    // };

    // const filteredBookings = bookingHistory
    //     .filter(
    //         (booking) =>
    //             (statusFilter === 'all' || booking.status === statusFilter) &&
    //             (booking.fullName
    //                 .toLowerCase()
    //                 .includes(searchTerm.toLowerCase()) ||
    //                 booking.id
    //                     .toLowerCase()
    //                     .includes(searchTerm.toLowerCase())),
    //     )
    //     .sort((a, b) => {
    //         switch (sortBy) {
    //             case 'guest':
    //                 return a.fullName.localeCompare(b.fullName);
    //             case 'amount':
    //                 return b.totalAmount - a.totalAmount;
    //             default:
    //                 return b.startDate?.getTime() - a.startDate?.getTime();
    //         }
    //     });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Booking History
                        </h2>
                        <p className="text-gray-500">
                            {roomType} - Room {roomNumber}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by guest or booking ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div className="relative">
                        <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as BookingStatus | 'all',
                                )
                            }
                            className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="all">All Statuses</option>
                            <option value="BOOKED">Booked</option>
                            <option value="OCCUPIED">Occupied</option>
                            <option value="CHECKOUT">Checkout</option>
                            <option value="AVAILABLE">Available</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                            onClick={() => console.log('Export history')}
                        >
                            <FaFileDownload />
                            Export
                        </button>
                    </div>
                </div>

                {/* Booking List */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                                    <button
                                        className="flex items-center gap-1 hover:text-gray-700"
                                        onClick={() => setSortBy('date')}
                                    >
                                        Date
                                        {sortBy === 'date' && <span>↓</span>}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                                    <button
                                        className="flex items-center gap-1 hover:text-gray-700"
                                        onClick={() => setSortBy('guest')}
                                    >
                                        Guest
                                        {sortBy === 'guest' && <span>↓</span>}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                                    Status
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                                    <button
                                        className="flex items-center gap-1 hover:text-gray-700"
                                        onClick={() => setSortBy('amount')}
                                    >
                                        Amount
                                        {sortBy === 'amount' && <span>↓</span>}
                                    </button>
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                                    Payment
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {bookingHistory.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium">
                                            {formatDate(booking.startDate)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(booking.endDate)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium">
                                            {booking.fullName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            #{booking.id}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        ₦{' '}
                                        {booking.amountPaid +
                                            booking.outstanding}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`capitalize ${getPaymentStatusColor(booking.paymentStatus)}`}
                                        >
                                            paid
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Showing {bookingHistory.length} of{' '}
                        {bookingHistory.length} bookings
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
