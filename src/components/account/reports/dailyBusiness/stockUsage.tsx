'use client';
import { UploadCloud, ListFilter } from 'lucide-react';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { stockUsageColumns } from '@/components/kitchen/tables/columns/stockUsageColumns';
import { downloadData } from '@/lib/downloadData';
import { useState, useEffect, useRef, useMemo } from 'react';
import SearchInput from '@/components/common/SearchInput';

const StockUsage = ({ stockRequest, allItems }: any) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        department: '',
        itemType: '',
        costRange: '',
    });
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Define available filters based on the stock usage data structure
    const tableFilters = [
        {
            id: 'department',
            label: 'Department',
            options: [
                { value: 'Restaurant', label: 'Restaurant' },
                { value: 'Bar', label: 'Bar' },
                { value: 'Front Office', label: 'Front Office' },
                { value: 'Kitchen', label: 'Kitchen' },
                { value: 'Housekeeping', label: 'Housekeeping' },
            ],
        },
        {
            id: 'itemType',
            label: 'Item Type',
            options: [
                { value: 'Food', label: 'Food' },
                { value: 'Beverage', label: 'Beverage' },
                { value: 'Cleaning', label: 'Cleaning' },
                { value: 'Equipment', label: 'Equipment' },
                { value: 'Office', label: 'Office' },
            ],
        },
        {
            id: 'costRange',
            label: 'Cost Range',
            options: [
                { value: 'low', label: 'Low (₦0 - ₦1,000)' },
                { value: 'medium', label: 'Medium (₦1,001 - ₦5,000)' },
                { value: 'high', label: 'High (₦5,001+)' },
            ],
        },
    ];

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target as Node)
            ) {
                setIsFilterDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const dataToUse = stockRequest?.map((stock: any) => ({
        itemName: stock?.item?.name,
        departmentUsed: stock?.department,
        quantityIssued: stock?.quantity,
        unitCost: stock?.item?.price,
        totalCost: Number(stock?.item?.price) * Number(stock?.quantity),
    }));

    // Filter stock usage data based on selected filter values and search
    const filteredStockUsage = useMemo(() => {
        if (!dataToUse) return [];

        let filtered = dataToUse.filter((item: any) => {
            // Filter by department
            if (
                filterValues.department &&
                item.departmentUsed !== filterValues.department
            ) {
                return false;
            }

            // Filter by item type (you might need to add itemType field to your data)
            if (
                filterValues.itemType &&
                item.itemType !== filterValues.itemType
            ) {
                return false;
            }

            // Filter by cost range
            if (filterValues.costRange) {
                const totalCost = Number(item.totalCost);
                switch (filterValues.costRange) {
                    case 'low':
                        if (totalCost > 1000) return false;
                        break;
                    case 'medium':
                        if (totalCost <= 1000 || totalCost > 5000) return false;
                        break;
                    case 'high':
                        if (totalCost <= 5000) return false;
                        break;
                }
            }

            return true;
        });

        // Apply search filter if search value exists
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter((item: any) => {
                return (
                    item.itemName?.toLowerCase().includes(searchLower) ||
                    item.departmentUsed?.toLowerCase().includes(searchLower) ||
                    item.quantityIssued?.toString().includes(searchLower) ||
                    item.unitCost?.toString().includes(searchLower) ||
                    item.totalCost?.toString().includes(searchLower)
                );
            });
        }

        return filtered;
    }, [dataToUse, filterValues, searchValue]);

    const myData = filteredStockUsage?.map((item: any) => ({
        'Item Name': item.itemName,
        'Department Used': item.departmentUsed,
        'Quantity Issued': item.quantityIssued,
        'Unit Cost': item.unitCost,
        'Total Cost': item.totalCost,
    }));

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
                        <option>Stock Usage</option>
                        <option>Stock Usage</option>
                    </select>
                </div>
            </div> */}
            <div className="flex items-center gap-9 mb-8 justify-between w-full">
                <div className="flex items-center gap-4">
                    <SearchInput
                        className="w-full lg:w-[314px]"
                        placeholder="Search by Item Name, Department, or Cost"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <p className="text-black text-base font-bold leading-6 whitespace-nowrap">
                        Items Issued:{' '}
                        {filteredStockUsage?.length || stockRequest?.length}
                    </p>
                    <p className="text-black text-base font-bold leading-6 whitespace-nowrap">
                        Total Remaining Items: {allItems?.length}
                    </p>
                </div>
            </div>

            <div className="relative">
                {isFilterDropdownOpen && (
                    <div
                        ref={filterDropdownRef}
                        className="absolute top-[50px] right-[146px] mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-[1000] p-4"
                    >
                        <div className="flex flex-col space-y-4">
                            {tableFilters.map((filter) => (
                                <div key={filter.id} className="space-y-2">
                                    <label
                                        className="text-muted-foreground text-sm"
                                        htmlFor={filter.id}
                                    >
                                        {filter.label}
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus-visible:ring-brand focus-within:ring-brand"
                                        value={
                                            filterValues[
                                                filter.id as keyof typeof filterValues
                                            ] || ''
                                        }
                                        onChange={(e) => {
                                            setFilterValues((prev) => ({
                                                ...prev,
                                                [filter.id]: e.target.value,
                                            }));
                                        }}
                                    >
                                        <option value="">
                                            All {filter.label}
                                        </option>
                                        {filter.options.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                            <div className="flex gap-2 pt-2">
                                <button
                                    className="px-3 py-2 text-sm bg-orion-blue hover:bg-orion-blue text-white rounded-md"
                                    onClick={() => {
                                        setFilterValues({
                                            department: '',
                                            itemType: '',
                                            costRange: '',
                                        });
                                    }}
                                >
                                    Clear
                                </button>
                                <button
                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                    onClick={() =>
                                        setIsFilterDropdownOpen(false)
                                    }
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <CustomTable
                    hasHeader
                    rightHeader={
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        Object.values(filterValues).some(
                                            (value) => value,
                                        )
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300'
                                    }`}
                                    onClick={() =>
                                        setIsFilterDropdownOpen(
                                            !isFilterDropdownOpen,
                                        )
                                    }
                                >
                                    <ListFilter size={16} />
                                    More filters
                                    {Object.values(filterValues).some(
                                        (value) => value,
                                    ) && (
                                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                                            {
                                                Object.values(
                                                    filterValues,
                                                ).filter((value) => value)
                                                    .length
                                            }
                                        </span>
                                    )}
                                </button>
                            </div>
                            <div
                                onClick={() =>
                                    downloadData(
                                        myData,
                                        'xlsx',
                                        'Stock Usage Report',
                                    )
                                }
                                className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px"
                            >
                                <UploadCloud size={20} />
                                <p className="text-base text-[#344054]">
                                    Export Report
                                </p>
                            </div>
                        </div>
                    }
                    title="Stock Usage Report"
                    columns={stockUsageColumns}
                    data={filteredStockUsage || []}
                    paginationSize={10}
                />
            </div>
        </>
    );
};

export default StockUsage;
