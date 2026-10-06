'use client';
import {
    getDailyTransaction,
    getTransactionStats,
} from '@/app/actions/account';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { DailyTnxColumns } from '@/components/kitchen/tables/columns/DailyTnxColumns';
import { Button } from '@heroui/react';
import { UploadCloud, ListFilter, Loader2 } from 'lucide-react';
import { LuBell } from 'react-icons/lu';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import useSWR from 'swr';
import { useState, useRef } from 'react';
import { format } from 'date-fns';
import React from 'react';
import { downloadData } from '@/lib/downloadData';
import CalenderPicker from '@/components/common/CalenderPicker';

const data = [
    { x: 0, y: 0 },
    { x: 10, y: 20 },
    { x: 20, y: 10 },
    { x: 30, y: 30 },
];

const declineData = [
    { x: 0, y: 30 },
    { x: 10, y: 10 },
    { x: 20, y: 20 },
    { x: 30, y: 0 },
];

const PettyCash = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        department: '',
        paymentType: '',
        status: '',
    });
    const datePickerRef = useRef<HTMLDivElement>(null);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Define available filters based on the table columns
    const tableFilters = [
        {
            id: 'department',
            label: 'Department',
            options: [
                { value: 'Restaurant', label: 'Restaurant' },
                { value: 'Front Office', label: 'Front Office' },
                { value: 'Account', label: 'Account' },
                { value: 'Store (Items)', label: 'Store (Items)' },
                { value: 'Store (Purchase)', label: 'Store (Purchase)' },
            ],
        },
        {
            id: 'paymentType',
            label: 'Payment Type',
            options: [
                { value: 'cash', label: 'Cash' },
                { value: 'debit', label: 'Card' },
                { value: 'TRANSFER', label: 'Transfer' },
                { value: 'bank', label: 'Bank' },
            ],
        },
        {
            id: 'status',
            label: 'Status',
            options: [
                { value: 'Completed', label: 'Completed' },
                { value: 'Pending', label: 'Pending' },
            ],
        },
    ];

    const { data: fetchedTransactions, isLoading: dataLoading } = useSWR(
        `/daily-transactions?date=${format(selectedDate, 'yyyy-MM-dd')}`,
        () => getDailyTransaction(format(selectedDate, 'yyyy-MM-dd')),
    );
    const { data: fetchedTransactionStats, isLoading: statsLoading } = useSWR(
        `/daily-transactions/stats?date=${format(selectedDate, 'yyyy-MM-dd')}`,
        () => getTransactionStats(format(selectedDate, 'yyyy-MM-dd')),
    );
    const transactionsArr = fetchedTransactions?.data;
    const transactionStats = fetchedTransactionStats?.data;

    const myData = transactionsArr?.data?.map((trnx: any) => ({
        'Order Id': trnx?.orderId,
        Department: trnx?.department,
        Description: trnx?.description,
        'Served By': trnx?.servedBy,
        'Table / Room': trnx?.tableRoom,
        'Payment Type': trnx?.paymentType,
        Account: trnx?.account,
        Status: trnx?.status,
    }));

    // Filter transactions based on selected filter values and search

    const filteredTransactions = React.useMemo(() => {
        if (!transactionsArr?.data) return [];

        let filtered = transactionsArr.data.filter((transaction: any) => {
            // Filter by department
            if (
                filterValues.department &&
                transaction.department !== filterValues.department
            ) {
                return false;
            }

            // Filter by payment type
            if (
                filterValues.paymentType &&
                transaction.paymentType !== filterValues.paymentType
            ) {
                return false;
            }

            // Filter by status
            if (
                filterValues.status &&
                transaction.status !== filterValues.status
            ) {
                return false;
            }

            return true;
        });

        // Apply search filter if search value exists
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter((transaction: any) => {
                // Search in relevant fields - adjust these based on your actual transaction structure
                return (
                    transaction.id
                        ?.toString()
                        .toLowerCase()
                        .includes(searchLower) ||
                    transaction.amount
                        ?.toString()
                        .toLowerCase()
                        .includes(searchLower) ||
                    transaction.department
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    transaction.paymentType
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    transaction.status?.toLowerCase().includes(searchLower) ||
                    transaction.description
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    transaction.customerName
                        ?.toLowerCase()
                        .includes(searchLower)
                );
            });
        }

        return filtered;
    }, [transactionsArr?.data, filterValues, searchValue]);

    // Determine if percentage change is positive or negative
    const isPositiveChange = (percentage: number) => percentage >= 0;

    // Handle search
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    return (
        <PageWrapper className="px-0">
            <div className="px-8">
                <PageHeader>
                    <PageHeadertitle title="Daily Transactions" />
                    <div className="ml-auto flex items-center">
                        <SearchInput
                            className="w-full lg:w-[320px]"
                            value={searchValue}
                            onChange={handleSearch}
                        />
                        <Button
                            variant="light"
                            isIconOnly
                            className="ml-4 bg-white rounded-full border text-gray-400"
                        >
                            <LuBell size={18} />
                        </Button>
                    </div>
                </PageHeader>
            </div>
            {dataLoading || statsLoading ? (
                <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                    <Loader2 className="text-brand animate-spin w-10 h-10" />
                </div>
            ) : (
                <div className="px-8 ">
                    <div className="flex gap-4 items-center mb-[31px]">
                        <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                            <div className="flex items-center w-full justify-between">
                                <p className="text-[#3E4450] text-sm font-medium leading-5">
                                    Total Amount Generated Today
                                </p>
                                <div className="relative" ref={datePickerRef}>
                                    <CalenderPicker
                                        currentDate={selectedDate}
                                        handleSelection={(selection: any) =>
                                            setSelectedDate(new Date(selection))
                                        }
                                    />
                                </div>
                            </div>
                            <p className="mt-6 text-[#101828] text-2xl font-semibold leading-[44px]">
                                {transactionStats?.todayTotalAmount.toLocaleString(
                                    'en-US',
                                    {
                                        style: 'currency',
                                        currency: 'NGN',
                                    },
                                ) || 0}
                            </p>
                            <div className="flex justify-between w-full items-baseline">
                                <p
                                    className={`font-inter text-sm font-medium leading-5 ${
                                        isPositiveChange(
                                            transactionStats?.percentageChange ||
                                                0,
                                        )
                                            ? 'text-[#336133]'
                                            : 'text-[#A91F0B]'
                                    }`}
                                >
                                    {isPositiveChange(
                                        transactionStats?.percentageChange || 0,
                                    )
                                        ? '▲'
                                        : '▼'}{' '}
                                    {Math.abs(
                                        transactionStats?.percentageChange || 0,
                                    )}
                                    %
                                    <span className="text-[#667085] p-2">
                                        vs yesterday
                                    </span>
                                </p>

                                <ResponsiveContainer width={63} height={50}>
                                    <AreaChart
                                        data={
                                            isPositiveChange(
                                                transactionStats?.percentageChange ||
                                                    0,
                                            )
                                                ? data
                                                : declineData
                                        }
                                    >
                                        <defs>
                                            <linearGradient
                                                id="colorGreen"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="60%"
                                                    stopColor={
                                                        isPositiveChange(
                                                            transactionStats?.percentageChange ||
                                                                0,
                                                        )
                                                            ? '#ECFDF3'
                                                            : '#FEF3F2'
                                                    }
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={
                                                        isPositiveChange(
                                                            transactionStats?.percentageChange ||
                                                                0,
                                                        )
                                                            ? '#ECFDF3'
                                                            : '#FEF3F2'
                                                    }
                                                    stopOpacity={1}
                                                />
                                            </linearGradient>
                                        </defs>

                                        <Area
                                            type="monotone"
                                            dataKey="y"
                                            stroke={
                                                isPositiveChange(
                                                    transactionStats?.percentageChange ||
                                                        0,
                                                )
                                                    ? '#12B76A'
                                                    : '#F04438'
                                            }
                                            strokeWidth={2}
                                            fill="url(#colorGreen)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="w-full bg-[#FAFAFA] shadow-md rounded-lg p-6 border gap-6">
                            <div className="flex items-center w-full justify-between">
                                <p className="text-[#3E4450] text-sm font-medium leading-5">
                                    Number of active departments
                                </p>
                            </div>
                            <p className="mt-6 text-[#101828] text-2xl font-semibold leading-[44px]">
                                {transactionStats?.activeDepartments || 0}
                            </p>
                            <div className="flex justify-between w-full items-baseline">
                                <p className="text-[#667085] font-inter text-sm font-medium leading-5">
                                    Active departments
                                    <span className="text-[#667085] p-2">
                                        in total
                                    </span>
                                </p>

                                <ResponsiveContainer width={63} height={50}>
                                    <AreaChart data={data}>
                                        <defs>
                                            <linearGradient
                                                id="pinkGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="60%"
                                                    stopColor="#FEF3F2"
                                                    stopOpacity="0"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#FEF3F2"
                                                    stopOpacity="1"
                                                />
                                            </linearGradient>
                                        </defs>

                                        <Area
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#F04438"
                                            strokeWidth={2}
                                            fill="url(#pinkGradient)"
                                            dot={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 relative">
                        {isFilterDropdownOpen && (
                            <div
                                ref={filterDropdownRef}
                                className="absolute top-[50px] right-[146px] mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-[1000] p-4"
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
                                                    paymentType: '',
                                                    status: '',
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
                            hasHeader
                            title="All Transactions"
                            rightHeader={
                                <div className="flex items-center gap-3">
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
                                    <div
                                        className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px"
                                        onClick={() =>
                                            downloadData(
                                                myData,
                                                'xlsx',
                                                'Daily Transaction Report',
                                            )
                                        }
                                    >
                                        <UploadCloud size={20} />
                                        <p className="text-base text-[#344054]">
                                            Export
                                        </p>
                                    </div>
                                </div>
                            }
                            columns={DailyTnxColumns}
                            data={filteredTransactions}
                        />
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default PettyCash;
