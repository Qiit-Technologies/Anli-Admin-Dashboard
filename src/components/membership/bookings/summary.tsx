import { Member } from '@/types/membership/membership';
import React from 'react';

interface Facility {
    id: number;
    name: string;
    description?: string;
}

interface BookingData {
    member: Member | null;
    facility: Facility | null;
    dateTime: { date: string; time: string; duration: number } | null;
}

interface SummaryProps {
    bookingData: BookingData;
    onConfirmBooking?: () => void;
    isLoading?: boolean;
}

const Summary: React.FC<SummaryProps> = ({
    bookingData,
    onConfirmBooking,
    isLoading,
}) => {
    const { member, facility, dateTime } = bookingData;

    const formatTime = (time: string) => {
        const hour = parseInt(time.split(':')[0]);
        return hour > 12
            ? `${hour - 12}:00 PM`
            : hour === 12
              ? '12:00 PM'
              : `${hour}:00 AM`;
    };

    const isComplete = member && facility && dateTime;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold mb-4">Booking Summary</h3>

            {/* Member Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-xs font-medium text-[#105F87] mb-2">
                    Member Details
                </h4>
                {member ? (
                    <div className="space-y-1 text-xs">
                        <p>
                            <strong>Name:</strong> {member.firstName}{' '}
                            {member.lastName}
                        </p>
                        <p>
                            <strong>Email:</strong> {member.email || '—'}
                        </p>
                        <p>
                            <strong>Phone:</strong> {member.phone || '—'}
                        </p>
                        <p>
                            <strong>Status:</strong>
                            <span
                                className={
                                    member.status === 'active'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {member.status}
                            </span>
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-gray-500">No member selected</p>
                )}
            </div>

            {/* Facility Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-xs font-medium text-[#105F87] mb-2">
                    Facility Details
                </h4>
                {facility ? (
                    <div className="space-y-1 text-xs">
                        <p>
                            <strong>Facility:</strong> {facility.name}
                        </p>
                        {facility.description && (
                            <p>
                                <strong>Description:</strong>{' '}
                                {facility.description}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500">
                        No facility selected
                    </p>
                )}
            </div>

            {/* Date & Time Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-xs font-medium text-[#105F87] mb-2">
                    Booking Details
                </h4>
                {dateTime ? (
                    <div className="space-y-1 text-xs">
                        <p>
                            <strong>Date:</strong>{' '}
                            {new Date(dateTime.date).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Time:</strong> {formatTime(dateTime.time)}
                        </p>
                        <p>
                            <strong>Duration:</strong> {dateTime.duration} hour
                            {dateTime.duration > 1 ? 's' : ''}
                        </p>
                    </div>
                ) : (
                    <p className="text-xs text-gray-500">
                        No date/time selected
                    </p>
                )}
            </div>

            {/* Confirmation Button */}
            {isComplete && (
                <div className="pt-4">
                    <button
                        onClick={onConfirmBooking}
                        disabled={isLoading}
                        className="w-full bg-[#007BFF] text-white py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                        {isLoading ? 'Creating Booking...' : 'Confirm Booking'}
                    </button>
                </div>
            )}

            {!isComplete && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                        Please complete all previous steps to confirm your
                        booking.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Summary;
