'use client';
import { TotalExpensesColumns } from '@/components/kitchen/tables/columns/TotalExpensesColumns';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { formatCurrency } from '@/lib/utils';

const ExpensesBreakdown = ({ transactionStats }: any) => {
    const totalExpenses = transactionStats?.expenses?.reduce(
        (sum: number, item: any) => sum + parseFloat(item?.amount),
        0,
    );

    console.log('transactionStats', transactionStats);

    return (
        <>
            {/* <div className="flex items-center gap-4 mb-5">
                <div className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px w-fit">
                    <Calendar size={20} />
                    <p className="text-base text-[#344054]">
                        Start date - End date
                    </p>
                </div>

                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>All Department</option>
                        <option>All Department</option>
                    </select>
                </div>
                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>Payment method</option>
                        <option>Payment method</option>
                    </select>
                </div>
                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>Expense Type</option>
                        <option>Expense Type</option>
                    </select>
                </div>
            </div> */}
            {/* <div className="flex gap-2 items-center">
                <p className="text-[#1F0702] text-sm font-medium leading-6">
                    Show Only Approved Expenses
                </p>
                <Switch size="md" />
            </div> */}
            <p className="mt-6 text-black text-base font-bold leading-6 mb-5">
                Total Expenses: {formatCurrency(totalExpenses)}
            </p>

            <CustomTable
                isPaginated={false}
                hasHeader
                rightHeader={<div />}
                title="Total Expenses backdown"
                columns={TotalExpensesColumns}
                data={transactionStats?.expenses || []}
            />
        </>
    );
};

export default ExpensesBreakdown;
