'use client';
import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

const departments = [
    { label: 'Front Desk', value: 'front-desk' },
    { label: 'Housekeeping', value: 'housekeeping' },
    { label: 'Kitchen', value: 'kitchen' },
];

const DepartmentalExpenseFilters: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([
        'front-desk',
        'housekeeping',
    ]);

    const toggleDepartment = (value: string) => {
        setSelected((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value],
        );
    };

    return (
        <div className="flex flex-col gap-4 md:gap-6 w-full">
            {/* Pick Departments */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-[#23272E] font-medium text-[15px] whitespace-nowrap">
                    Pick Department(s)
                </span>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    {departments.map((dept) => (
                        <button
                            key={dept.value}
                            type="button"
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[#E5E7EB] bg-white text-[14px] sm:text-[15px] font-medium transition-colors whitespace-nowrap`}
                            onClick={() => toggleDepartment(dept.value)}
                        >
                            <span className="relative flex items-center">
                                {/* Hidden native checkbox for accessibility */}
                                <input
                                    type="checkbox"
                                    checked={selected.includes(dept.value)}
                                    readOnly
                                    className="absolute opacity-0 w-0 h-0"
                                    tabIndex={-1}
                                />
                                {/* Custom checkbox */}
                                <span
                                    className={`flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 rounded border border-[#E5E7EB] mr-2 transition-colors
                                        ${selected.includes(dept.value) ? 'bg-[#FF872A] border-[#FF872A]' : 'bg-white'}
                                    `}
                                >
                                    {selected.includes(dept.value) && (
                                        <svg
                                            width="8"
                                            height="8"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            className="sm:w-[10px] sm:h-[10px]"
                                        >
                                            <path
                                                d="M3 6.5L5.5 9L9 4.5"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </span>
                                {dept.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Expense Category and Date Range */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                {/* Expense Category Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-[#23272E] font-medium text-[15px] whitespace-nowrap">
                        Select Expense Category
                    </span>
                    <div className="relative">
                        <select className="appearance-none outline-none w-full sm:min-w-[120px] px-3 sm:px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[14px] sm:text-[15px] font-medium">
                            <option>Salaries</option>
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
                        Date Range
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
};

export default DepartmentalExpenseFilters;
