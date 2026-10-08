import React from 'react';
import { Download } from 'lucide-react';
import DateRangeDropdown from '@/components/common/RangeDropdown';
import { DateSelection } from '../../types';
import { downloadData } from '@/lib/downloadData';

const CashFlowHeader = ({ setStartDate, setEndDate, cashFlowData }: any) => {
    console.log('cashFlowData', cashFlowData);
    const myData = cashFlowData;
    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full md:mt-[33px] mt-6">
            <div className="">
                <h1 className="text-2xl font-semibold text-[#354052] max-md:text-[17px]">
                    Cash Flow Summary
                </h1>
                <p className="text-[#7C8493] text-sm mt-1 max-w-xl max-md:text-[12px]">
                    Quick insight into how money moves in and out of the
                    business within a specific date range.
                </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <DateRangeDropdown
                    handleSelection={(selection: DateSelection) => {
                        setStartDate(selection?.startDate);
                        setEndDate(selection?.endDate);
                    }}
                />
                <button
                    onClick={() => downloadData(myData, 'xlsx', 'Cash flows')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#23272E] text-sm font-medium border border-[#E5E7EB] shadow-sm hover:bg-[#f0f2f7]"
                >
                    <Download size={18} className="text-[#23272E]" />
                    Download Report
                </button>
            </div>
        </div>
    );
};

export default CashFlowHeader;
