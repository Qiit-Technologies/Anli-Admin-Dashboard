'use client';
import LogTransaction from '@/components/account/logTransaction';
import ViewPettyCashDetails from '@/components/account/viewPettyCashDetails';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { useDisclosure } from '@heroui/react';
import { ListFilter, Loader2 } from 'lucide-react';
import { LuBell } from 'react-icons/lu';
import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import {
    getPettyCashTransactions,
    getPettyCashStats,
} from '@/app/actions/account';
import { Button } from '@/components/ui/button';
import { getDepartments } from '@/app/actions/department';
import { formatCurrency } from '@/lib/utils';

const PettyCashPage = () => {
    const {
        isOpen: isCreateModalOpen,
        onOpen: onCreateModalOpen,
        onClose: onCreateModalClose,
    } = useDisclosure();
    const {
        isOpen: isViewModalOpen,
        onOpen: onViewModalOpen,
        onClose: onViewModalClose,
    } = useDisclosure();
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter] = useState({ status: '', paymentMethod: '', date: '' });
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        department: '',
        status: '',
        paymentMethod: '',
        dateRange: '',
    });
    const filterDropdownRef = useRef<HTMLDivElement>(null);

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

    // Use SWR for data fetching
    const {
        data: statsResponse,
        mutate: mutateStats,
        isLoading: isLoadingStats,
    } = useSWR('/accounts/petty-cash/stats', getPettyCashStats, {
        refreshInterval: 30000, // Auto-refresh every 30 seconds
        revalidateOnFocus: true,
    });

    const {
        data: transactionsResponse,
        mutate: mutateTransactions,
        isLoading: isLoadingTransactions,
    } = useSWR(
        [
            '/accounts/petty-cash',
            {
                status: filter.status,
                paymentMethod: filter.paymentMethod,
                date: filter.date,
                search: searchTerm,
            },
        ],
        () =>
            getPettyCashTransactions({
                status: filter.status,
                paymentMethod: filter.paymentMethod,
                date: filter.date,
                search: searchTerm,
            }),
        {
            refreshInterval: 30000, // Auto-refresh every 30 seconds
            revalidateOnFocus: true,
        },
    );

    const stats = statsResponse?.data;
    const transactions = (transactionsResponse?.data as any)?.data || [];
    const isLoading = isLoadingStats || isLoadingTransactions;

    const handleTransactionSuccess = () => {
        // Refresh data after successful transaction
        mutateStats();
        mutateTransactions();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-orange-100 text-orange-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Handle export functionality
    const handleExport = () => {
        // Create CSV content for export
        const csvContent = [
            [
                'Date',
                'Amount',
                'Department',
                'Recipient Name',
                'Approved By',
                'Payment Type',
                'Status',
            ],
            ...transactions.map((transaction: any) => [
                new Date(transaction.date).toLocaleDateString(),
                `₦${transaction.amount?.toLocaleString() || '0'}`,
                transaction.department?.name || 'N/A',
                transaction.recipientName || 'N/A',
                transaction.paymentMethod || 'N/A',
                transaction.status || 'N/A',
            ]),
        ]
            .map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
            .join('\n');

        // Create and download file
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `petty-cash-transactions-${new Date().toISOString().split('T')[0]}.csv`,
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Handle filter modal
    const handleFilterClick = () => {
        setIsFilterDropdownOpen(!isFilterDropdownOpen);
    };

    const filteredTransactions = React.useMemo(() => {
        if (!transactions) return [];

        const filtered = transactions.filter((transaction: any) => {
            // Filter by department
            if (
                filterValues.department &&
                transaction.department !== filterValues.department
            ) {
                return false;
            }

            // Filter by payment method
            if (
                filterValues.paymentMethod &&
                transaction.paymentMethod !== filterValues.paymentMethod
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

            // Filter by date
            if (
                filterValues.dateRange &&
                transaction.date !== filterValues.dateRange
            ) {
                return false;
            }

            return true;
        });

        return filtered;
    }, [transactions, filterValues]);

    const { data: departmentsResponse } = useSWR(
        '/departments',
        getDepartments,
        {
            revalidateOnFocus: false,
        },
    );

    const departments =
        departmentsResponse?.map((depData: any) => depData.name) || [];

    const columns = [
        {
            accessorKey: 'date',
            header: 'Date',
            cell: ({ row }: any) => (
                <span className="text-sm text-gray-900">
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Account',
            cell: ({ row }: any) => (
                <span className="text-sm text-gray-900">
                    {formatCurrency(row.original.amount)}
                </span>
            ),
        },
        {
            accessorKey: 'department',
            header: 'Department',
            cell: ({ row }: any) => (
                <span className="text-sm text-gray-600">
                    {row.original.module ||
                        row.original.department?.name ||
                        'N/A'}
                </span>
            ),
        },
        {
            accessorKey: 'recipientName',
            header: 'Recipient Name',
            cell: ({ row }: any) => (
                <span className="text-sm text-gray-600">
                    {row.original.recipientName}
                </span>
            ),
        },
        {
            accessorKey: 'paymentMethod',
            header: 'Payment Type',
            cell: ({ row }: any) => (
                <span className="text-sm text-gray-600 capitalize">
                    {row.original.paymentMethod}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: any) => (
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        row.original.status,
                    )}`}
                >
                    {row.original.status}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center gap-2">
                    <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => {
                            setSelectedTransaction(row.original);
                            onViewModalOpen();
                        }}
                    >
                        View
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <PageWrapper>
                <PageHeader>
                    <PageHeadertitle title="Petty Cash Management" />
                </PageHeader>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="text-brand animate-spin w-10 h-10" />
                </div>
            </PageWrapper>
        );
    }

    return (
        <>
            <PageWrapper className="px-0">
                <div className="px-8">
                    <PageHeader>
                        <PageHeadertitle title="Petty Cash Management" />
                        <div className="ml-auto flex items-center gap-4">
                            <SearchInput
                                className="w-full lg:w-[320px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search"
                            />
                            <Button className="bg-white rounded-full border text-gray-400">
                                <LuBell size={18} />
                            </Button>
                        </div>
                    </PageHeader>
                </div>
                <div className="px-8 space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Opening Balance
                                    </span>
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Today
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₦
                                        {(
                                            stats?.openingBalance || 0
                                        ).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span
                                            className={`text-xs ${(stats?.openingBalancePercentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {(stats?.openingBalancePercentageChange ||
                                                0) >= 0
                                                ? '↗'
                                                : '↘'}
                                        </span>
                                        <span
                                            className={`text-xs ${(stats?.openingBalancePercentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {Math.abs(
                                                stats?.openingBalancePercentageChange ||
                                                    0,
                                            )}
                                            %
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            vs yesterday
                                        </span>
                                    </div>
                                </div>
                                <div className="w-20">
                                    <svg
                                        className="w-full h-12"
                                        viewBox="0 0 100 50"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="grad1"
                                                x1="0%"
                                                y1="0%"
                                                x2="100%"
                                                y2="0%"
                                            >
                                                <stop
                                                    offset="0%"
                                                    style={{
                                                        stopColor: '#3B82F6',
                                                        stopOpacity: 1,
                                                    }}
                                                />
                                                <stop
                                                    offset="100%"
                                                    style={{
                                                        stopColor: '#1D4ED8',
                                                        stopOpacity: 1,
                                                    }}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,50 L20,30 L40,35 L60,20 L80,25 L100,10"
                                            stroke="url(#grad1)"
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Amount Spent Today
                                    </span>
                                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-black">
                                            T
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Today
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₦
                                        {(
                                            stats?.amountSpentToday || 0
                                        ).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span
                                            className={`text-xs ${(stats?.amountSpentPercentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {(stats?.amountSpentPercentageChange ||
                                                0) >= 0
                                                ? '↗'
                                                : '↘'}
                                        </span>
                                        <span
                                            className={`text-xs ${(stats?.amountSpentPercentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {Math.abs(
                                                stats?.amountSpentPercentageChange ||
                                                    0,
                                            )}
                                            %
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            vs yesterday
                                        </span>
                                    </div>
                                </div>
                                <div className="w-20">
                                    <svg
                                        className="w-full h-12"
                                        viewBox="0 0 100 50"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="grad2"
                                                x1="0%"
                                                y1="0%"
                                                x2="100%"
                                                y2="0%"
                                            >
                                                <stop
                                                    offset="0%"
                                                    style={{
                                                        stopColor: '#F59E0B',
                                                        stopOpacity: 1,
                                                    }}
                                                />
                                                <stop
                                                    offset="100%"
                                                    style={{
                                                        stopColor: '#D97706',
                                                        stopOpacity: 1,
                                                    }}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,40 L20,35 L40,25 L60,30 L80,20 L100,15"
                                            stroke="url(#grad2)"
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Closing Balance
                                    </span>
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Today
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₦
                                        {(
                                            stats?.closingBalance || 0
                                        ).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span
                                            className={`text-xs ${(stats?.closingBalancePercentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {(stats?.closingBalancePercentageChange ||
                                                0) >= 0
                                                ? '↗'
                                                : '↘'}
                                        </span>
                                        <span
                                            className={`text-xs ${(stats?.closingBalancePercentageChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {Math.abs(
                                                stats?.closingBalancePercentageChange ||
                                                    0,
                                            )}
                                            %
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            vs yesterday
                                        </span>
                                    </div>
                                </div>
                                <div className="w-20">
                                    <svg
                                        className="w-full h-12"
                                        viewBox="0 0 100 50"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="grad3"
                                                x1="0%"
                                                y1="0%"
                                                x2="100%"
                                                y2="0%"
                                            >
                                                <stop
                                                    offset="0%"
                                                    style={{
                                                        stopColor: '#10B981',
                                                        stopOpacity: 1,
                                                    }}
                                                />
                                                <stop
                                                    offset="100%"
                                                    style={{
                                                        stopColor: '#059669',
                                                        stopOpacity: 1,
                                                    }}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,45 L20,40 L40,35 L60,30 L80,25 L100,20"
                                            stroke="url(#grad3)"
                                            strokeWidth="2"
                                            fill="none"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real Time Snapshot Section */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Real Time snap shot
                            </h3>
                            <div className="flex items-center gap-4">
                                <Button
                                    className="bg-white hover:bg-white text-gray-600 border border-gray-300"
                                    onClick={handleExport}
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                        />
                                    </svg>
                                    Export Report
                                </Button>
                                <Button
                                    onClick={onCreateModalOpen}
                                    className="bg-orion-blue hover:bg-orion-blue text-white"
                                >
                                    Log Transaction
                                </Button>

                                <div
                                    className="relative"
                                    ref={filterDropdownRef}
                                >
                                    <Button
                                        className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            Object.values(filterValues).some(
                                                (value) => value,
                                            )
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300'
                                        }`}
                                        onClick={handleFilterClick}
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
                                    </Button>

                                    {/* Filter Dropdown */}
                                    {isFilterDropdownOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4">
                                            <div className="flex flex-col space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-muted-foreground text-sm">
                                                        Department
                                                    </label>
                                                    <select
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus-visible:ring-brand focus-within:ring-brand"
                                                        value={
                                                            filterValues.department
                                                        }
                                                        onChange={(e) => {
                                                            setFilterValues(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    department:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            );
                                                        }}
                                                    >
                                                        <option value="">
                                                            All Departments
                                                        </option>
                                                        {departments?.map(
                                                            (
                                                                department: any,
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        department
                                                                    }
                                                                    value={
                                                                        department
                                                                    }
                                                                >
                                                                    {department}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-muted-foreground text-sm">
                                                        Status
                                                    </label>
                                                    <select
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus-visible:ring-brand focus-within:ring-brand"
                                                        value={
                                                            filterValues.status
                                                        }
                                                        onChange={(e) => {
                                                            setFilterValues(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    status: e
                                                                        .target
                                                                        .value,
                                                                }),
                                                            );
                                                        }}
                                                    >
                                                        <option value="">
                                                            All Statuses
                                                        </option>
                                                        <option value="pending">
                                                            Pending
                                                        </option>
                                                        <option value="approved">
                                                            Approved
                                                        </option>
                                                        <option value="rejected">
                                                            Rejected
                                                        </option>
                                                        <option value="completed">
                                                            Completed
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-muted-foreground text-sm">
                                                        Payment Method
                                                    </label>
                                                    <select
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus-visible:ring-brand focus-within:ring-brand"
                                                        value={
                                                            filterValues.paymentMethod
                                                        }
                                                        onChange={(e) => {
                                                            setFilterValues(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    paymentMethod:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            );
                                                        }}
                                                    >
                                                        <option value="">
                                                            All Payment Methods
                                                        </option>
                                                        <option value="cash">
                                                            Cash
                                                        </option>
                                                        <option value="mobile_money">
                                                            Mobile money
                                                        </option>
                                                        <option value="card">
                                                            Card
                                                        </option>
                                                        <option value="bank_transfer">
                                                            Bank transfer
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-muted-foreground text-sm">
                                                        Date Range
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus-visible:ring-brand focus-within:ring-brand"
                                                        value={
                                                            filterValues.dateRange
                                                        }
                                                        onChange={(e) => {
                                                            setFilterValues(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    dateRange:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        className="px-3 py-2 text-sm bg-orion-blue text-white rounded-md"
                                                        onClick={() => {
                                                            setFilterValues({
                                                                department: '',
                                                                status: '',
                                                                paymentMethod:
                                                                    '',
                                                                dateRange: '',
                                                            });
                                                        }}
                                                    >
                                                        Clear
                                                    </button>
                                                    <button
                                                        className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md"
                                                        onClick={() =>
                                                            setIsFilterDropdownOpen(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Balances */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <p className="text-sm text-gray-600 mb-1">
                                    Opening balance:
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                    ₦
                                    {(
                                        stats?.openingBalance || 0
                                    ).toLocaleString()}
                                    .00
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <p className="text-sm text-gray-600 mb-1">
                                    Today&apos;s Spending:
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                    ₦
                                    {(
                                        stats?.amountSpentToday || 0
                                    ).toLocaleString()}
                                    .00
                                </p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <p className="text-xl font-bold text-gray-900">
                                    ₦
                                    {(
                                        stats?.closingBalance || 0
                                    ).toLocaleString()}
                                    .00
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* All Transactions Logged Section */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                All Transactions logged
                            </h3>
                            <CustomTable
                                rightHeader={<div />}
                                columns={columns}
                                data={filteredTransactions}
                            />
                        </div>
                    </div>
                </div>
            </PageWrapper>

            <LogTransaction
                isOpen={isCreateModalOpen}
                onOpenChange={onCreateModalClose}
                onSuccess={handleTransactionSuccess}
            />
            <ViewPettyCashDetails
                isOpen={isViewModalOpen}
                onOpenChange={onViewModalClose}
                transaction={selectedTransaction}
                mutateTransactions={mutateTransactions}
            />
        </>
    );
};

export default PettyCashPage;
