import {
    FaTimes,
    FaBed,
    FaCheckCircle,
    FaExclamationCircle,
    FaClock,
} from 'react-icons/fa';
import { BookingStatus } from '../types';

interface RoomStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomType: string;
    roomNumber: string;
    status: BookingStatus;
    currentBooking?: {
        guestName: string;
        checkIn: Date;
        checkOut: Date;
    };
    lastCleaned?: Date;
    maintenance?: {
        lastCheck: Date;
        nextCheck: Date;
        issues?: string[];
    };
}

export function RoomStatusModal({
    isOpen,
    onClose,
    roomType,
    roomNumber,
    status,
    currentBooking,
    lastCleaned,
    maintenance,
}: RoomStatusModalProps) {
    if (!isOpen) return null;

    const getStatusColor = (status: BookingStatus): string => {
        switch (status) {
            case 'BOOKED':
                return 'bg-green-100 text-green-800';
            case 'AVAIL':
                return 'bg-blue-100 text-blue-800';
            case 'DIRTY':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">Room Status</h2>
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

                <div className="space-y-6">
                    {/* Current Status */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            Current Status
                        </h3>
                        <div
                            className={`p-3 rounded-md ${getStatusColor(status)}`}
                        >
                            <div className="flex items-center gap-2">
                                <FaBed className="w-4 h-4" />
                                <span className="font-medium">{status}</span>
                            </div>
                            {currentBooking && (
                                <div className="mt-2 text-sm">
                                    <p>Guest: {currentBooking.guestName}</p>
                                    <p>
                                        Check-in:{' '}
                                        {formatDate(currentBooking.checkIn)}
                                    </p>
                                    <p>
                                        Check-out:{' '}
                                        {formatDate(currentBooking.checkOut)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Housekeeping Status */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            Housekeeping
                        </h3>
                        <div className="p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle
                                    className={
                                        lastCleaned
                                            ? 'text-green-500'
                                            : 'text-gray-400'
                                    }
                                />
                                <span>
                                    {lastCleaned
                                        ? `Last cleaned: ${formatDate(lastCleaned)}`
                                        : 'No cleaning record available'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Status */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">
                            Maintenance
                        </h3>
                        <div className="p-3 bg-gray-50 rounded-md space-y-3">
                            <div className="flex items-center gap-2">
                                <FaClock className="text-blue-500" />
                                <div className="text-sm">
                                    <p>
                                        Last check:{' '}
                                        {maintenance?.lastCheck
                                            ? formatDate(maintenance.lastCheck)
                                            : 'N/A'}
                                    </p>
                                    <p>
                                        Next check:{' '}
                                        {maintenance?.nextCheck
                                            ? formatDate(maintenance.nextCheck)
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            {maintenance?.issues &&
                                maintenance.issues.length > 0 && (
                                    <div className="border-t pt-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaExclamationCircle className="text-amber-500" />
                                            <span className="text-sm font-medium">
                                                Outstanding Issues
                                            </span>
                                        </div>
                                        <ul className="text-sm space-y-1">
                                            {maintenance.issues.map(
                                                (issue, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                        {issue}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t flex justify-end">
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
