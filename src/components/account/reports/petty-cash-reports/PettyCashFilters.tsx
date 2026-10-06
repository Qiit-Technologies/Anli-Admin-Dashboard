import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

const PettyCashFilters: React.FC = () => {
    return (
        <div className="flex flex-wrap items-center gap-3 w-full">
            {/* First row of filters */}
            <div className="flex flex-wrap items-center gap-3 w-full">
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
                <div className="relative">
                    <select className="appearance-none outline-none px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium pr-8 min-w-[170px]">
                        <option>Select Expense Category</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
                <div className="relative">
                    <select className="appearance-none outline-none px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium pr-8 min-w-[170px]">
                        <option>Petty Cash Account</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
            </div>
            {/* Second row of filters */}
            <div className="flex flex-wrap items-center gap-3 w-full mt-3">
                <div className="relative">
                    <select className="appearance-none outline-none px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium pr-8 min-w-[130px]">
                        <option>Staff Name</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
                <div className="relative">
                    <select className="appearance-none outline-none px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium pr-8 min-w-[130px]">
                        <option>Select Category</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
                <div className="relative">
                    <select className="appearance-none outline-none px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium pr-8 min-w-[160px]">
                        <option>select Purpose / Type</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <span className="text-[15px] text-[#23272E]">
                        Only show entries without receipts
                    </span>
                    <label className="inline-flex relative items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                        />
                        <div className="w-10 h-6 bg-[#FFF6F1] peer-focus:outline-none rounded-full peer peer-checked:bg-[#FF872A] transition-all"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-4 border border-[#E5E7EB]"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default PettyCashFilters;
