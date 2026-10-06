import { formatCurrency } from '@/lib/utils';
import React from 'react';

const CashFlowTable: React.FC<{
    cashInflow: any;
    cashOutflow: any;
    fetchCashFlow: any;
    transactionType: string;
}> = ({ transactionType, cashInflow, cashOutflow, fetchCashFlow }) => {
    let tableTitle = '';
    let tableSubtitle = '';
    let tableHeaders: string[] = [];
    let tableRows: { label: string; value: string }[] = [];

    if (transactionType === 'Inflows') {
        tableTitle = 'Inflows Section';
        tableSubtitle = 'Shows total incoming funds grouped by source';
        tableHeaders = ['Inflows Source', 'Amount Paid (₦)'];
        tableRows = cashInflow || [];
    } else if (transactionType === 'Outflows') {
        tableTitle = 'Outflows Section';
        tableSubtitle = 'Breakdown of all money spent';
        tableHeaders = ['Outflows Type', 'Amount Paid (₦)'];
        tableRows = cashOutflow || [];
    } else {
        tableTitle = 'Net Cash Flow';
        tableSubtitle = 'Breakdown of all money spent';
        tableHeaders = ['Label', 'Value (₦)'];
        tableRows = fetchCashFlow || [];
    }

    return (
        <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-4 md:p-6 mt-2">
            <div className="flex items-center justify-between mb-3 md:mb-5">
                <div>
                    <span className="font-semibold text-[#23272E] text-base">
                        {tableTitle}
                    </span>
                    <div className="text-[#7C8493] text-[13px] font-normal mt-1">
                        {tableSubtitle}
                    </div>
                </div>
                {/* <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#23272E] text-[15px] font-medium border border-[#E5E7EB] shadow-sm hover:bg-[#f0f2f7]">
                    <Download size={18} className="text-[#23272E]" />
                    <span className="hidden sm:inline">Export Report</span>
                </button> */}
            </div>

            <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-[700px] w-full text-[15px]">
                    <thead>
                        <tr className="bg-[rgba(244,244,244,1)] text-[#7C8493] text-[12px]">
                            {tableHeaders.map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.map((row, idx) => (
                            <tr
                                key={idx}
                                className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FFF6F1] transition-colors text-sm"
                            >
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {row.label}
                                </td>
                                <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                    {formatCurrency(row.value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CashFlowTable;
