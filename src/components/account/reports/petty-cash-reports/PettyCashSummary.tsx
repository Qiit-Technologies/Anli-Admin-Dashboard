import React from 'react';

const PettyCashSummary: React.FC = () => {
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="flex-1 bg-[#FCF4F4] rounded-2xl px-3 py-3 md:px-5 md:py-[18px] flex items-center justify-center min-w-[200px]">
                <span className="text-[#000000] text-sm font-medium mr-2">
                    Opening Balance:
                </span>
                <span className="text-[#FF872A] text-sm md:text-base font-extrabold">
                    ₦100,000
                </span>
            </div>
            <div className="flex-1 bg-[#FCF4F4] rounded-2xl px-3 py-3 md:px-5 md:py-[18px] flex items-center justify-center min-w-[200px]">
                <span className="text-[#000000] text-sm font-medium mr-2">
                    Total Disbursed Today:
                </span>
                <span className="text-[#FF872A] text-sm md:text-base font-extrabold">
                    ₦11,500
                </span>
            </div>
            <div className="flex-1 bg-[#FCF4F4] rounded-2xl px-3 py-3 md:px-5 md:py-[18px] flex items-center justify-center min-w-[200px]">
                <span className="text-[#000000] text-sm font-medium mr-2">
                    Total Reimbursed Today:
                </span>
                <span className="text-[#FF872A] text-sm md:text-base font-extrabold">
                    ₦0
                </span>
            </div>
            <div className="flex-1 bg-[#FCF4F4] rounded-2xl px-3 py-3 md:px-5 md:py-[18px] flex items-center justify-center min-w-[200px]">
                <span className="text-[#000000] text-sm font-medium mr-2">
                    Closing Balance:
                </span>
                <span className="text-[#FF872A] text-sm md:text-base font-extrabold">
                    ₦88,500
                </span>
            </div>
        </div>
    );
};

export default PettyCashSummary;
