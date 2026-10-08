import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { RoomType } from './types';

interface CalendarNavigationProps {
    currentDate: Date;
    roomTypes: RoomType[];
    onDateChange: (days: number) => void;
}

export function CalendarNavigation({
    currentDate,
    roomTypes,
    onDateChange,
}: CalendarNavigationProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <select className="border rounded px-2 py-1">
                    <option value="all">All Rooms</option>
                    {roomTypes.map((type) => (
                        <option key={type.id} value={type.name.toLowerCase()}>
                            {type.name}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-2">
                    <button
                        className="border rounded p-1"
                        onClick={() => onDateChange(-18)}
                    >
                        <FaChevronLeft />
                    </button>
                    <span className="font-medium">
                        {currentDate.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                    <button
                        className="border rounded p-1"
                        onClick={() => onDateChange(18)}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}
