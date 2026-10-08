import type { BookingStatus } from './types';

interface BookingCellProps {
    status: BookingStatus;
    guestName?: string;
    guestDetails?: {
        email?: string;
        phone?: string;
        startDate: Date;
        endDate: Date;
        isCheckedIn: boolean;
        isCheckedOut: boolean;
        specialRequests?: string;
    };
    onClick: (newBookingDetails?: {
        startDate: Date;
        endDate: Date;
        isCheckedIn: boolean;
        isCheckedOut: boolean;
    }) => void;
    isStart?: boolean;
    isEnd?: boolean;
    isMiddle?: boolean;
    date: Date;
    roomId?: string;
}

export function BookingCell({
    guestName,
    guestDetails,
    onClick,
    isStart,
    isEnd,
    isMiddle,
    date,
}: BookingCellProps) {
    const getStatusColor = () => {
        if (!guestDetails) return 'bg-white text-gray-500';

        const { startDate, endDate, isCheckedIn, isCheckedOut } = guestDetails;
        const currentDate = new Date(date);
        const bookingStart = new Date(startDate);
        const bookingEnd = new Date(endDate);

        if (currentDate >= bookingStart && currentDate <= bookingEnd) {
            if (isCheckedOut) {
                return 'bg-red-500 text-white';
            }

            if (isCheckedIn) {
                return 'bg-blue text-white';
            }

            if (!isCheckedIn) {
                return 'bg-green-500 text-white';
            }
        }

        return 'bg-white text-gray-500';
    };

    const shouldShowName = isStart;

    const handleClick = () => {
        if (!guestDetails) {
            const newBookingDetails = {
                startDate: date,
                endDate: date,
                isCheckedIn: false,
                isCheckedOut: false,
            };
            onClick(newBookingDetails);
        } else {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`relative w-full h-[30px] transition-colors cursor-pointer flex items-center justify-center 
                ${getStatusColor()} 
                ${isStart ? 'rounded-l-sm' : ''}
                ${isEnd ? 'rounded-r-sm' : ''}
                ${!isMiddle && !isStart && !isEnd ? 'border border-gray-200' : ''}
                ${isMiddle || isStart || isEnd ? 'border-0' : ''}`}
            style={{
                padding: '7px',
            }}
        >
            {shouldShowName && guestName && (
                <div
                    className="p-2 absolute left-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap text-sm font-medium z-10"
                    style={{
                        pointerEvents: 'none',
                    }}
                >
                    {guestName}
                </div>
            )}
        </button>
    );
}
