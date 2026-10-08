import React from 'react';
import { Bell, Search } from 'lucide-react';

const ReportsTopBar: React.FC = () => {
    return (
        <div className="w-full bg-white flex max-md:flex-col max-md:gap-5 items-center justify-between max-md:items-start px-0 md:px-0 py-6">
            <h2 className="text-[2rem] font-semibold text-[#23272E] leading-tight max-md:text-2xl">
                Reports
            </h2>
            <div className="flex items-center gap-4 max-md:gap-0 max-md:justify-between max-md:max-w-none max-md:w-full">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search"
                        className="pl-10 pr-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[15px] text-[#23272E] focus:outline-none focus:ring-2 focus:ring-[#FF872A] min-w-[320px] max-md:min-w-[240px] w-full"
                        style={{ width: 220 }}
                    />
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C8493]"
                    />
                </div>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F4F6FB]">
                    <Bell size={20} className="text-[#7C8493]" />
                </button>
            </div>
        </div>
    );
};

export default ReportsTopBar;
