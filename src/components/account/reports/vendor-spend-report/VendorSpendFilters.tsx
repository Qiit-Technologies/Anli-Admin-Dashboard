import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

const VendorSpendFilters: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full flex-wrap">
            <div className="relative">
                <select className="appearance-none outline-none px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium pr-8 min-w-[170px]">
                    <option>Select Department(s)</option>
                </select>
                <ChevronDown
                    size={18}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                />
            </div>
            <div className="relative">
                <select className="appearance-none outline-none px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium pr-8 min-w-[140px]">
                    <option>Select Vendor</option>
                </select>
                <ChevronDown
                    size={18}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                />
            </div>
            <button className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium flex items-center gap-2 min-w-[180px]">
                <Calendar size={18} className="text-[#7C8493]" />
                Start date - End date
            </button>
        </div>
    );
};

export default VendorSpendFilters;
