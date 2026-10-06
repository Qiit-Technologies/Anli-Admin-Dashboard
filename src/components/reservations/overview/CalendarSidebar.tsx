'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { DAYS_OF_WEEK, MONTHS, Reservation } from './types';
import { getDaysInMonth, hasReservations, isSameDay } from './utils';

interface CalendarSidebarProps {
    currentDate: Date;
    selectedDate: Date;
    reservations: Reservation[];
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onDateSelect: (date: Date) => void;
    onMonthYearChange?: (date: Date) => void;
}

export default function CalendarSidebar({
    currentDate,
    selectedDate,
    reservations,
    onPreviousMonth,
    onNextMonth,
    onDateSelect,
    onMonthYearChange,
}: CalendarSidebarProps) {
    const [showSelector, setShowSelector] = useState(false);
    const monthDays = getDaysInMonth(currentDate);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
        onMonthYearChange?.(newDate);
        setShowSelector(false);
    };

    const handleYearSelect = (year: number) => {
        const newDate = new Date(year, currentDate.getMonth(), 1);
        onMonthYearChange?.(newDate);
        setShowSelector(false);
    };

    return (
        <div
            className="bg-white border border-gray-200 rounded-lg flex-shrink-0 shadow-md"
            style={{ width: '330px', height: '397px' }}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onPreviousMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={18} className="text-gray-700" />
                    </button>
                    <button
                        onClick={() => setShowSelector(!showSelector)}
                        className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
                    >
                        <h3 className="font-semibold text-gray-900 text-base">
                            {MONTHS[currentDate.getMonth()]}{' '}
                            {currentDate.getFullYear()}
                        </h3>
                        <ChevronDown
                            size={16}
                            className={`text-gray-500 transition-transform ${showSelector ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <button
                        onClick={onNextMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight size={18} className="text-gray-700" />
                    </button>
                </div>

                {showSelector && (
                    <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-1 w-[280px]">
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2 font-medium">
                                Month
                            </p>
                            <div className="grid grid-cols-3 gap-1">
                                {MONTHS.map((month, idx) => (
                                    <button
                                        key={month}
                                        onClick={() => handleMonthSelect(idx)}
                                        className={`px-2 py-1.5 text-xs rounded-md transition-colors font-medium ${
                                            idx === currentDate.getMonth()
                                                ? 'bg-blue text-white font-semibold'
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {month.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-2 font-medium">
                                Year
                            </p>
                            <div className="grid grid-cols-5 gap-1">
                                {years.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => handleYearSelect(year)}
                                        className={`px-2 py-1.5 text-xs rounded-md transition-colors font-medium ${
                                            year === currentDate.getFullYear()
                                                ? 'bg-blue text-white font-semibold'
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3">
                    {DAYS_OF_WEEK.map((day) => (
                        <div
                            key={day}
                            className="text-gray-600 font-medium py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {monthDays.map((dayObj, idx) => {
                        const isSelected = isSameDay(dayObj.date, selectedDate);
                        const isBooked = hasReservations(
                            dayObj.date,
                            reservations,
                        );
                        const isToday = isSameDay(dayObj.date, new Date());

                        return (
                            <button
                                key={idx}
                                onClick={() => onDateSelect(dayObj.date)}
                                className={`
                                    h-9 w-9 rounded-md text-sm font-normal transition-all relative flex items-center justify-center
                                    ${!dayObj.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                    ${isSelected ? 'bg-blue text-white font-medium shadow-sm' : 'hover:bg-gray-100'}
                                    ${isToday && !isSelected ? 'border border-blue text-blue font-medium' : ''}
                                    ${isBooked && !isSelected ? 'text-[#6941C6] font-medium' : ''}
                                `}
                                aria-label={`${dayObj.date.toDateString()}${isBooked ? ' - Has reservations' : ''}`}
                            >
                                {dayObj.day}
                                {isBooked && !isSelected && (
                                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#6941C6] rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
