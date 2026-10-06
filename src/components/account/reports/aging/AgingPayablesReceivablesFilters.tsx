import React from 'react';
import { ChevronDown } from 'lucide-react';

const types = [
    { label: 'Payables', value: 'payables' },
    { label: 'Receivables', value: 'receivables' },
];

export default function AgingPayablesReceivablesFilters({
    type,
    setType,
}: {
    type: 'payables' | 'receivables';
    setType: (t: 'payables' | 'receivables') => void;
}) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-5 md:mb-9 md:gap-6 w-full">
            {/* Vendor/Customer */}
            {/* <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-[#23272E] font-medium text-[15px] whitespace-nowrap">
                    Vendor / Customer
                </span>
                <div className="relative">
                    <select className="appearance-none outline-none w-full sm:min-w-[120px] lg:min-w-[170px] px-3 sm:px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[14px] sm:text-[15px] font-medium">
                        {vendors.map((v) => (
                            <option key={v.value} value={v.value}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none sm:w-[18px] sm:h-[18px]"
                    />
                </div>
            </div> */}

            {/* Date Range Picker */}
            {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
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
            </div> */}

            {/* Type and Date Range */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                {/* Type Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-[#23272E] font-medium text-[15px] whitespace-nowrap">
                        Type
                    </span>
                    <div className="relative">
                        <select
                            className="appearance-none outline-none w-full sm:min-w-[120px] px-3 sm:px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[14px] sm:text-[15px] font-medium"
                            value={type}
                            onChange={(e) =>
                                setType(
                                    e.target.value as
                                        | 'payables'
                                        | 'receivables',
                                )
                            }
                        >
                            {types.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none sm:w-[18px] sm:h-[18px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
