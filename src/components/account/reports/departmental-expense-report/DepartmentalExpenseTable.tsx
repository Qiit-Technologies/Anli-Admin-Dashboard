import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Download, ListFilter } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput';

const DepartmentalExpenseTable = ({ fetchExpenses }: any) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        department: '',
        expenseType: '',
        dateRange: '',
    });
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Define available filters based on the department expenses data structure
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
            id: 'expenseType',
            label: 'Expense Type',
            options: [
                { value: 'Purchase Order', label: 'Purchase Order' },
                { value: 'Petty Cash', label: 'Petty Cash' },
                { value: 'Utilities', label: 'Utilities' },
                { value: 'Equipment', label: 'Equipment' },
                { value: 'Supplies', label: 'Supplies' },
                { value: 'Services', label: 'Services' },
                { value: 'Maintenance', label: 'Maintenance' },
            ],
        },
        {
            id: 'dateRange',
            label: 'Date Range',
            options: [
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'this_week', label: 'This Week' },
                { value: 'last_week', label: 'Last Week' },
                { value: 'this_month', label: 'This Month' },
                { value: 'last_month', label: 'Last Month' },
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

    // Filter expenses data based on selected filter values and search
    const filteredExpenses = useMemo(() => {
        if (!fetchExpenses) return [];

        let filtered = fetchExpenses?.filter((expense: any) => {
            // Filter by department (you might need to add department field to your data)
            if (
                filterValues.department &&
                expense.department !== filterValues.department
            ) {
                return false;
            }

            // Filter by expense type (based on purpose field)
            if (
                filterValues.expenseType &&
                expense.purpose !== filterValues.expenseType
            ) {
                return false;
            }

            // Filter by date range
            if (filterValues.dateRange) {
                const expenseDate = new Date(expense.date);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                switch (filterValues.dateRange) {
                    case 'today':
                        if (expenseDate.toDateString() !== today.toDateString())
                            return false;
                        break;
                    case 'yesterday':
                        if (
                            expenseDate.toDateString() !==
                            yesterday.toDateString()
                        )
                            return false;
                        break;
                    case 'this_week': {
                        const thisWeekStart = new Date(today);
                        thisWeekStart.setDate(today.getDate() - today.getDay());
                        if (expenseDate < thisWeekStart) return false;
                        break;
                    }
                    case 'last_week': {
                        const lastWeekStart = new Date(today);
                        lastWeekStart.setDate(
                            today.getDate() - today.getDay() - 7,
                        );
                        const lastWeekEnd = new Date(lastWeekStart);
                        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                        if (
                            expenseDate < lastWeekStart ||
                            expenseDate > lastWeekEnd
                        )
                            return false;
                        break;
                    }
                    case 'this_month':
                        if (
                            expenseDate.getMonth() !== today.getMonth() ||
                            expenseDate.getFullYear() !== today.getFullYear()
                        )
                            return false;
                        break;
                    case 'last_month': {
                        const lastMonth = new Date(today);
                        lastMonth.setMonth(today.getMonth() - 1);
                        if (
                            expenseDate.getMonth() !== lastMonth.getMonth() ||
                            expenseDate.getFullYear() !==
                                lastMonth.getFullYear()
                        )
                            return false;
                        break;
                    }
                }
            }

            return true;
        });

        // Apply search filter if search value exists
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter((expense: any) => {
                return (
                    expense.date?.toLowerCase().includes(searchLower) ||
                    expense.purpose?.toLowerCase().includes(searchLower) ||
                    expense.amount
                        ?.toString()
                        .toLowerCase()
                        .includes(searchLower) ||
                    expense.paidBy?.toLowerCase().includes(searchLower) ||
                    expense.paidFrom?.toLowerCase().includes(searchLower) ||
                    expense.paymentMethod
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    expense.notes?.toLowerCase().includes(searchLower)
                );
            });
        }

        return filtered;
    }, [fetchExpenses, filterValues, searchValue]);

    return (
        <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-4 md:p-6 mt-2">
            <div className="flex items-center justify-between mb-3 md:mb-5">
                <span className="font-medium text-[#23272E] text-base">
                    Report Output Table
                </span>
                <div className="flex items-center gap-3">
                    <div className="relative" ref={filterDropdownRef}>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                Object.values(filterValues).some(
                                    (value) => value,
                                )
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300'
                            }`}
                            onClick={() =>
                                setIsFilterDropdownOpen(!isFilterDropdownOpen)
                            }
                        >
                            <ListFilter size={16} />
                            More filters
                            {Object.values(filterValues).some(
                                (value) => value,
                            ) && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                                    {
                                        Object.values(filterValues).filter(
                                            (value) => value,
                                        ).length
                                    }
                                </span>
                            )}
                        </button>
                        {isFilterDropdownOpen && (
                            <div
                                className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] p-4"
                                style={{ zIndex: 9999 }}
                            >
                                <div className="flex flex-col space-y-4">
                                    {tableFilters.map((filter) => (
                                        <div
                                            key={filter.id}
                                            className="space-y-2"
                                        >
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
                                                        [filter.id]:
                                                            e.target.value,
                                                    }));
                                                }}
                                            >
                                                <option value="">
                                                    All {filter.label}
                                                </option>
                                                {filter.options.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            className="px-3 py-2 text-sm bg-orion-blue hover:bg-orion-blue text-white rounded-md"
                                            onClick={() => {
                                                setFilterValues({
                                                    department: '',
                                                    expenseType: '',
                                                    dateRange: '',
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
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#23272E] text-[15px] font-medium border border-[#E5E7EB] shadow-sm hover:bg-[#f0f2f7]">
                        <Download size={18} className="text-[#23272E]" />
                        <span className="hidden sm:inline">Export Report</span>
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-5">
                <SearchInput
                    className="w-full lg:w-[314px]"
                    placeholder="Search by Purpose, Amount, or Staff"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                <p className="text-black text-base font-bold leading-6 whitespace-nowrap">
                    Total Expenses:{' '}
                    {filteredExpenses?.length || fetchExpenses?.length || 0}
                </p>
            </div>
            <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-[800px] w-full">
                    <thead>
                        <tr className="bg-[rgba(244,244,244,1)] text-[#7C8493] text-[12px]">
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Date
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Purpose
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Amount (₦)
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Paid By
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left truncate">
                                Paid From (Account)
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left">
                                Payment Method
                            </th>
                            <th className="px-4 py-3 md:py-[13px] md:pr-[55px] md:pl-6 font-medium text-left truncate">
                                Supporting Notes
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(filteredExpenses || []).map(
                            (row: any, idx: number) => (
                                <tr
                                    key={idx}
                                    className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#FFF6F1] transition-colors text-sm"
                                >
                                    <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                        {row.date}
                                    </td>
                                    <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] truncate max-w-[160px]">
                                        {row.purpose}
                                    </td>
                                    <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                        {row.amount}
                                    </td>
                                    <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                        {row.paidBy}
                                    </td>
                                    <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] truncate max-w-[160px]">
                                        {row.paidFrom}
                                    </td>
                                    <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] whitespace-nowrap">
                                        {row.paymentMethod}
                                    </td>
                                    <td className="px-4 py-3 md:py-[26px] md:pr-[55px] md:pl-6 text-[#7B7878] truncate max-w-[160px]">
                                        {row.notes}
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DepartmentalExpenseTable;
