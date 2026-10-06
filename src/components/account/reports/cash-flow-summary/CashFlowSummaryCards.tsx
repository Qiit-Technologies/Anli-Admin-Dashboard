import { formatCurrency } from '@/lib/utils';
import React from 'react';

const CashFlowSummaryCards: React.FC<{
    transactionType: string;
    totalInflow?: number;
    totalOutflow?: number;
    totalNetflow?: number;
}> = ({ transactionType, totalInflow, totalOutflow, totalNetflow }) => {
    const summaryData = {
        Inflows: {
            label: 'Total Inflows',
            value: formatCurrency(totalInflow || 0),
            color: '#FF872A',
        },
        Outflows: {
            label: 'Total Outflows',
            value: formatCurrency(totalOutflow || 0),
            color: '#FF872A',
        },
        'Net Cash Flow': {
            label: 'Total Net Cash Flow',
            value: formatCurrency(totalNetflow || 0),
            color: '#FF872A',
            extra: 'Positive',
        },
    };

    const data = summaryData[transactionType as keyof typeof summaryData];
    return (
        <div className="flex flex-col gap-3 w-fit">
            <div className="inline-flex items-center bg-[#FCF4F4] rounded-2xl p-3 md:py-[18px] md:px-5">
                <span className="text-[#23272E] text-[15px] font-medium mr-2">
                    {data.label}:
                </span>
                <span className="text-[#FF872A] text-[1.1rem] font-extrabold mr-2">
                    {data.value}
                </span>
                {transactionType === 'Net Cash Flow' && (
                    <span className="text-[#FF872A] text-[15px] font-extrabold flex items-center ml-1">
                        ✅ Positive
                    </span>
                )}
            </div>
        </div>
    );
};

export default CashFlowSummaryCards;
