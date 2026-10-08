import { formatCurrency } from '@/lib/utils';
import React from 'react';

export default function PayrollSummaryCards({ stats }: any) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full my-6">
            <div className="flex-1 bg-[rgba(252,244,244,1)] rounded-2xl px-7 py-4 flex items-center justify-center w-full">
                <span className="whitespace-nowrap text-[#23272E] text-[15px] font-semibold mr-2 max-md:text-[13px]">
                    Total Staff Paid:
                </span>
                <span className="whitespace-nowrap text-[#23272E] text-[1.5rem] font-extrabold max-md:text-[17px]">
                    {stats?.totalStaffsPaid}
                </span>
            </div>
            <div className="flex-1 bg-[rgba(252,244,244,1)] rounded-2xl px-7 py-4 flex items-center justify-center w-full">
                <span className="whitespace-nowrap text-[#23272E] text-[15px] font-semibold mr-2 max-md:text-[13px]">
                    Total Payroll Amount:
                </span>
                <span className="whitespace-nowrap text-[#23272E] text-[1.5rem] font-extrabold max-md:text-[17px]">
                    {formatCurrency(stats?.totalPayrollAmount)}
                </span>
            </div>
            {/* <div className="flex-1 bg-[rgba(252,244,244,1)] rounded-2xl px-7 py-4 flex items-center justify-center w-full">
                <span className="whitespace-nowrap text-[#23272E] text-[15px] font-semibold mr-2 max-md:text-[13px]">
                    Disbursed Via:
                </span>
                <span className="whitespace-nowrap text-[#23272E] text-[1.5rem] font-extrabold max-md:text-[17px]">
                    {stats?.disbursedVia}
                </span>
            </div> */}
        </div>
    );
}
