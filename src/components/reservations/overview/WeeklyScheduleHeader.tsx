'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS } from './types';

interface WeeklyScheduleHeaderProps {
    selectedDate: Date;
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
}

export default function WeeklyScheduleHeader({
    selectedDate,
    onPreviousWeek,
    onNextWeek,
    onToday,
}: WeeklyScheduleHeaderProps) {
    return (
        <div
            className="flex items-center justify-between bg-[#F9FAFB] rounded-md mb-3"
            style={{
                height: '54px',
                paddingTop: '12px',
                paddingRight: '24px',
                paddingBottom: '12px',
                paddingLeft: '24px',
                border: '1px solid #E5E7EB',
            }}
        >
            <h2 className="text-sm font-normal text-gray-500">
                {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>

            <div className="flex items-center gap-3">
                <button
                    onClick={onToday}
                    className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Today
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onPreviousWeek}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Previous week"
                    >
                        <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <button
                        onClick={onNextWeek}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Next week"
                    >
                        <ChevronRight size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    );
}
