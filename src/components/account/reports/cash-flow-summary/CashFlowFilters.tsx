import React from 'react';
import { ChevronDown } from 'lucide-react';

const CashFlowFilters = ({
    transactionType,
    setTransactionType,
}: {
    transactionType: string;
    setTransactionType: (type: string) => void;
}) => {
    return (
        <div className="flex flex-wrap items-center gap-4 w-full">
            {/* Department */}
            {/* <div className="flex items-center gap-2">
                <span className="text-[#23272E] text-[15px] font-medium">
                    Select Department(s)
                </span>
                <div className="relative">
                    <select className="appearance-none outline-none px-4 py-[10px] rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium min-w-[140px]">
                        <option>Front Desk</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
            </div> */}
            {/* Category */}
            {/* <div className="flex items-center gap-2">
                <span className="text-[#23272E] text-[15px] font-medium">
                    Category
                </span>
                <div className="relative">
                    <select className="appearance-none outline-none px-4 py-[10px] rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium min-w-[190px]">
                        <option>Restaurant Sales</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
            </div> */}
            {/* Transaction Type */}
            <div className="flex items-center gap-2">
                <span className="text-[#23272E] text-[15px] font-medium">
                    Transaction Type
                </span>
                <div className="relative">
                    <select
                        className="appearance-none outline-none px-4 py-[10px] rounded-lg border border-[#E5E7EB] bg-white text-[#23272E] text-[15px] font-medium min-w-[190px]"
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                    >
                        <option value="Inflows">Inflows</option>
                        <option value="Outflows">Outflows</option>
                        <option value="Net Cash Flow">Net Cash Flow</option>
                    </select>
                    <ChevronDown
                        size={18}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7C8493] pointer-events-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default CashFlowFilters;
