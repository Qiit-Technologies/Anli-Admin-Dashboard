'use client';
import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const roomTypes = [
    { label: 'Standard', value: 'standard' },
    { label: 'Deluxe', value: 'deluxe' },
];

export default function ReservationSummaryFilters() {
    const [roomType, setRoomType] = useState(roomTypes[0].value);
    const [guestName, setGuestName] = useState('');

    return (
        <div className="flex flex-col md:flex-row mb-5 md:mb-9 gap-4 md:gap-6 w-full">
            {/* Room Type */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-[#23272E] font-medium text-[15px] whitespace-nowrap">
                    Room Type
                </span>
                <div className="relative">
                    <select
                        className="appearance-none outline-none w-full sm:min-w-[120px] px-3 sm:px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[14px] sm:text-[15px] font-medium"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                    >
                        {roomTypes.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none sm:w-[18px] sm:h-[18px]"
                    />
                </div>
            </div>
            {/* Guest Name and Date Range */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                {/* Guest Name Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-[#23272E] font-medium text-[15px] whitespace-nowrap">
                        Guest Name
                    </span>
                    <div className="relative">
                        <select
                            className="appearance-none outline-none w-full sm:min-w-[120px] px-3 sm:px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[14px] sm:text-[15px] font-medium"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                        >
                            <option value="">Payables</option>
                            <option value="Emeka Chuka">Emeka Chuka</option>
                            <option value="Grace Okoro">Grace Okoro</option>
                            <option value="Frankly Juse">Frankly Juse</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none sm:w-[18px] sm:h-[18px]"
                        />
                    </div>
                </div>
                {/* Date Range Picker */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-[#23272E] font-medium text-[15px] whitespace-nowrap">
                        Payroll Period
                    </span>
                    <button className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[14px] sm:text-[15px] font-medium flex items-center justify-center sm:justify-start gap-2 min-w-[170px]">
                        <Calendar
                            size={16}
                            className="text-[#7C8493] sm:w-[18px] sm:h-[18px]"
                        />
                        <span className="truncate">Start date - End date</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
