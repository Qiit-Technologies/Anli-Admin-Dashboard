'use client';
import { Calendar, UploadCloud } from 'lucide-react';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import SearchInput from '@/components/common/SearchInput';
import { stockAdditionsColumns } from '@/components/kitchen/tables/columns/stockAdditionsColumns';

const StockAdditions = () => {
    const dummyStockAdditions = [
        {
            itemName: 'Rice',
            openingQty: '20',
            qtyAdded: '40',
            date: '2025-07-07 12:45',
            addedBy: 'Grace o.',
        },
        {
            itemName: 'Rice',
            openingQty: '20',
            qtyAdded: '40',
            date: '2025-07-07 12:45',
            addedBy: 'Grace o.',
        },
        {
            itemName: 'Rice',
            openingQty: '20',
            qtyAdded: '40',
            date: '2025-07-07 12:45',
            addedBy: 'Grace o.',
        },
    ];
    return (
        <>
            <div className="flex items-center gap-4 mb-5">
                <div className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px w-fit">
                    <Calendar size={20} />
                    <p className="whitespace-nowrap text-base text-[#344054]">
                        Start date - End date
                    </p>
                </div>

                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>Items Category</option>
                        <option>Items Category</option>
                    </select>
                </div>
                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>Items Status</option>
                        <option>Items Status</option>
                    </select>
                </div>

                <SearchInput
                    className="w-full lg:w-[226px] h-[44px] rounded-lg"
                    placeholder="e.g., “Bottle Water”"
                    value={''}
                    onChange={() => {}}
                />
            </div>
            <div className="flex items-center gap-2 mb-8 justify-start w-fit">
                <p className="text-[#1F0702] text-sm font-medium leading-6">
                    Select Staff
                </p>
                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                        <option>Grace James</option>
                        <option>Grace James</option>
                    </select>
                </div>
            </div>

            <CustomTable
                isPaginated={false}
                hasHeader
                title="Stock Additions Report"
                rightHeader={
                    <div className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px">
                        <UploadCloud size={20} />
                        <p className="text-base text-[#344054]">
                            Export Report
                        </p>
                    </div>
                }
                columns={stockAdditionsColumns}
                data={dummyStockAdditions}
            />
        </>
    );
};

export default StockAdditions;
