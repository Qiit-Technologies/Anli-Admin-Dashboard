'use client';
import ViewPettyCashDetails from '@/components/account/viewPettyCashDetails';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { useDisclosure } from '@heroui/react';
import { LuBell } from 'react-icons/lu';
import React, { useState } from 'react';
import useSWR from 'swr';
import { getPettyCashTransactions } from '@/app/actions/account';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const PettyCashPage = () => {
    const {
        isOpen: isViewModalOpen,
        onOpen: onViewModalOpen,
        onClose: onViewModalClose,
    } = useDisclosure();

    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: transactionsResponse,
        mutate: mutateTransactions,
        isLoading: isLoadingTransactions,
    } = useSWR(
        [
            '/accounts/petty-cash',
            {
                search: searchTerm,
            },
        ],
        () =>
            getPettyCashTransactions({
                search: searchTerm,
            }),
        {
            refreshInterval: 30000, // Auto-refresh every 30 seconds
            revalidateOnFocus: true,
        },
    );

    const transactions = (transactionsResponse?.data as any)?.data || [];
    const isLoading = isLoadingTransactions;

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
                <div className="text-center flex flex-col h-[80vh] items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-brand" />
                    Loading. Please wait...
                </div>
            </PageWrapper>
        );
    }

    return (
        <>
            <PageWrapper className="px-0">
                <div className="px-2">
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
                <div className="px-2 space-y-6">
                    {/* All Transactions Logged Section */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                All Petty Cash Trsansactions
                            </h3>
                            <CustomTable
                                rightHeader={<div />}
                                columns={columns}
                                data={transactions || []}
                            />
                        </div>
                    </div>
                </div>
            </PageWrapper>

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
