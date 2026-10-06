'use client';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { OutStandingPaymentsColumns } from '@/components/kitchen/tables/columns/OutStandingPaymentsColumns';

const OutstandingPayments = ({ transactionStats }: any) => {
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
            {/* <div className="flex items-center gap-9 mb-8 justify-start w-fit">
                <SearchInput
                    className="w-full lg:w-[314px]"
                    placeholder="Search by Reference No., Vendor, or Customer Name"
                    value={''}
                    onChange={() => {}}
                />
                <div className="flex gap-2 items-center w-full">
                    <p className="text-[#1F0702] text-sm font-medium leading-6">
                        Show Completed Only
                    </p>
                    <Switch size="md" />
                </div>
            </div> */}

            <CustomTable
                hasHeader
                rightHeader={<div />}
                title="Total Expenses backdown"
                columns={OutStandingPaymentsColumns}
                data={transactionStats?.allOutstandingTransactions || []}
                paginationSize={10}
            />
        </>
    );
};

export default OutstandingPayments;
