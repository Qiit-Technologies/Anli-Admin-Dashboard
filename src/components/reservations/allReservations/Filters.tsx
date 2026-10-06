'use client';

import React from 'react';
import { Calendar as CalendarIcon, ListFilter, Check } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import { useReservationSearch } from '@/context/ReservationSearchContext';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReservationStatus } from '../types';
import { format } from 'date-fns';

const STATUS_OPTIONS: (ReservationStatus | 'all')[] = [
    'all',
    'Pending',
    'Booked',
    'In Progress',
    'Completed',
    'Cancelled',
];

export default function Filters() {
    const {
        searchTerm,
        setSearchTerm,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        statusFilter,
        setStatusFilter,
    } = useReservationSearch();

    return (
        <div className="flex items-center justify-between">
            <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex items-center gap-3">
                {/* Date Picker Button (Restored Design) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors">
                            <CalendarIcon
                                size={16}
                                className="text-[#344054]"
                            />
                            {startDate && endDate ? (
                                <span>
                                    {format(startDate, 'LLL dd')} -{' '}
                                    {format(endDate, 'LLL dd')}
                                </span>
                            ) : (
                                'Select Dates'
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={startDate}
                            selected={{ from: startDate, to: endDate }}
                            onSelect={(range) => {
                                setStartDate(range?.from);
                                setEndDate(range?.to);
                            }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                {/* Status Filter Button (Restored Design) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors">
                            <ListFilter size={16} className="text-[#344054]" />
                            {statusFilter === 'all' ? 'Filters' : statusFilter}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        {STATUS_OPTIONS.map((status) => (
                            <DropdownMenuItem
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                {status === 'all' ? 'All Statuses' : status}
                                {statusFilter === status && (
                                    <Check
                                        size={14}
                                        className="text-orion-blue"
                                    />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
