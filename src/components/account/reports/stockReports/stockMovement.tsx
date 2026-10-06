'use client';
import { UploadCloud, ListFilter } from 'lucide-react';
import { stockMovementColumns } from '@/components/kitchen/tables/columns/stockMovementColumns';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { format } from 'date-fns';
import { downloadData } from '@/lib/downloadData';
import { useState, useEffect, useRef, useMemo } from 'react';
import SearchInput from '@/components/common/SearchInput';

const StockMovement = ({ fetchedStock }: any) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        itemType: '',
        quantityRange: '',
        staffMember: '',
    });
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Get unique departments from stock requests for dynamic filtering
    const uniqueDepartments = useMemo(() => {
        if (!fetchedStock?.allStockRequest) return [];
        const departments = fetchedStock.allStockRequest.map(
            (stock: any) => stock.department,
        );
        return [...new Set(departments)].filter((dept): dept is string =>
            Boolean(dept),
        );
    }, [fetchedStock?.allStockRequest]);

    // Define available filters based on the stock movement data structure
    const tableFilters: Array<{
        id: keyof typeof filterValues;
        label: string;
        options: Array<{ value: string; label: string }>;
    }> = [
        {
            id: 'itemType',
            label: 'Department',
            options: [
                // { value: '', label: 'All Departments' },
                ...uniqueDepartments.map((dept) => ({
                    value: dept,
                    label: dept,
                })),
            ],
        },
        {
            id: 'quantityRange',
            label: 'Quantity Range',
            options: [
                { value: '', label: 'All Quantities' },
                { value: 'low', label: 'Low (1-10)' },
                { value: 'medium', label: 'Medium (11-50)' },
                { value: 'high', label: 'High (51+)' },
            ],
        },
        {
            id: 'staffMember',
            label: 'Staff Member',
            options: [
                { value: '', label: 'All Staff' },
                { value: 'Issuing Officer', label: 'Issuing Officer' },
                { value: 'Requested By', label: 'Requested By' },
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

    const dataToUse = fetchedStock?.allStockRequest?.map((stock: any) => ({
        itemName: stock?.item?.name,
        qtyIssued: stock?.quantity,
        date: format(new Date(stock?.createdAt), 'yyyy-MM-dd HH:mm'),
        receivedBy: stock?.issuingOfficer?.fullName || 'Not Issued',
        approvedBy: stock?.requestedBy?.fullName,
        status: stock?.status,
        department: stock?.department,
    }));

    // Filter stock movement data based on selected filter values and search
    const filteredStockMovement = useMemo(() => {
        if (!dataToUse) return [];

        let filtered = dataToUse.filter((item: any) => {
            // Filter by item type (using department as item type)
            if (
                filterValues.itemType &&
                item.department !== filterValues.itemType
            ) {
                return false;
            }

            // Filter by quantity range
            if (filterValues.quantityRange) {
                const quantity = Number(item.qtyIssued);
                switch (filterValues.quantityRange) {
                    case 'low':
                        if (quantity < 1 || quantity > 10) return false;
                        break;
                    case 'medium':
                        if (quantity < 11 || quantity > 50) return false;
                        break;
                    case 'high':
                        if (quantity < 51) return false;
                        break;
                }
            }

            // Filter by staff member
            if (filterValues.staffMember && filterValues.staffMember !== '') {
                if (filterValues.staffMember === 'Issuing Officer') {
                    if (!item.receivedBy || item.receivedBy === 'Not Issued')
                        return false;
                } else if (filterValues.staffMember === 'Requested By') {
                    if (!item.approvedBy) return false;
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
                    item.qtyIssued
                        ?.toString()
                        .toLowerCase()
                        .includes(searchLower) ||
                    item.date?.toLowerCase().includes(searchLower) ||
                    item.receivedBy?.toLowerCase().includes(searchLower) ||
                    item.approvedBy?.toLowerCase().includes(searchLower) ||
                    item.department?.toLowerCase().includes(searchLower)
                );
            });
        }

        return filtered;
    }, [dataToUse, filterValues, searchValue]);

    const myData = filteredStockMovement?.map((item: any) => ({
        'Item Name': item.itemName,
        'Qty Issued': item.qtyIssued,
        Date: item.date,
        'Received By': item.receivedBy,
        'Approved By': item.approvedBy,
        Status: item.status,
        Department: item.department,
    }));

    // Calculate total issued from stock requests (not from all items)
    const issuedStock =
        fetchedStock?.allStockRequest?.reduce(
            (sum: number, stock: any) => sum + Number(stock.quantity || 0),
            0,
        ) || 0;

    // Calculate total remaining from all items
    const remainingStock =
        fetchedStock?.allItems?.reduce(
            (sum: number, item: any) => sum + Number(item.quantity || 0),
            0,
        ) || 0;

    // Calculate low stock alerts
    const lowStockAlerts =
        fetchedStock?.allItems?.reduce((sum: number, item: any) => {
            if (item.quantity <= item.minStock) return sum + 1;
            else return sum;
        }, 0) || 0;

    return (
        <>
            <div className="flex items-center gap-4 my-4">
                <div
                    className={`px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]`}
                >
                    <p className="text-black text-[20px] font-medium leading-5">
                        Total Issued:{' '}
                        <span className="font-bold">{issuedStock}</span>
                    </p>
                </div>
                <div
                    className={`px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]`}
                >
                    <p className="text-black text-[20px] font-medium leading-5">
                        Total Remaining:{' '}
                        <span className="font-bold">{remainingStock}</span>
                    </p>
                </div>
                <div
                    className={`px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]`}
                >
                    <p className="text-black text-[20px] font-medium leading-5">
                        Low Stock Alerts:{' '}
                        <span className="font-bold">{lowStockAlerts}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-5 justify-between w-full">
                <div className="flex items-center gap-4">
                    <SearchInput
                        className="w-full lg:w-[314px]"
                        placeholder="Search by Item Name, Staff, or Date"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <p className="text-black text-base font-bold leading-6 whitespace-nowrap">
                        Stock Movements:{' '}
                        {filteredStockMovement?.length ||
                            dataToUse?.length ||
                            0}
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
                                            itemType: '',
                                            quantityRange: '',
                                            staffMember: '',
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
                    isPaginated={true}
                    paginationSize={15}
                    hasHeader
                    title="Report Output Table"
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
                                        'Stock Movement Report',
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
                    columns={stockMovementColumns}
                    data={filteredStockMovement || []}
                />
            </div>
        </>
    );
};

export default StockMovement;
