'use client';

import { use, useMemo, useState } from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VendorDetailHeader } from '@/components/account/vendors-management/VendorDetailsHeader';
import { TransactionHistoryTable } from '@/components/account/vendors-management/TransactionHistoryTable';
import { getVendorDetail } from '@/app/actions/vendor';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';

interface VendorDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function VendorDetailPage({ params }: VendorDetailPageProps) {
    const { id } = use(params);
    const [searchValue, setSearchValue] = useState('');
    const [statusFilter] = useState('');
    const router = useRouter();
    // const {
    //     vendor,
    //     transactions,
    //     searchValue,
    //     setSearchValue,
    //     handleDownloadPayslips,
    //     handleFilters,
    // } = useVendorDetail(id);

    const { data } = useSWR(id ? `/accounts/vendor-detail/${id}` : null, () =>
        getVendorDetail(id),
    );
    const vendor = data?.data?.vendor;
    const transactions = data?.data?.transactions;

    const filteredTransactions = useMemo(() => {
        let txns = transactions || [];
        if (searchValue) {
            txns = txns.filter(
                (txn: any) =>
                    txn.refId
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    txn.accountName
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    txn.itemPurchased
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    txn.status
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()),
            );
        }
        if (statusFilter) {
            txns = txns.filter((txn: any) => txn.status === statusFilter);
        }
        return txns;
    }, [transactions, searchValue, statusFilter]);

    const handleDownloadPayslips = () => {
        const headers = [
            'Ref ID',
            'Account Name',
            'Payment Type',
            'Account',
            'Item Purchased',
            'Date Purchased',
            'Status',
        ];
        const rows = filteredTransactions.map((txn: any) => [
            txn.refId,
            txn.accountName,
            txn.paymentType,
            txn.account,
            txn.itemPurchased,
            txn.datePurchased,
            txn.status,
        ]);
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers, ...rows].map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'vendor_transactions.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-none px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1
                                className="text-xl font-medium text-[#71717A] cursor-pointer"
                                onClick={router.back}
                            >
                                Vendors management
                            </h1>
                            <ChevronRight className="ml-2 text-[#71717A]" />

                            <h1 className="text-2xl font-semibold text-gray-900">
                                Vendors details
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchValue}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <Button variant="ghost" size="icon">
                                <Bell className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <VendorDetailHeader
                        vendorName={vendor?.vendorName}
                        numberOfTransactions={vendor?.numberOfTransactions}
                        lastTransactionDate={vendor?.lastTransactionDate}
                        totalPurchaseValue={vendor?.totalPurchaseValue}
                        onDownloadPayslips={handleDownloadPayslips}
                    />

                    <TransactionHistoryTable
                        transactions={transactions ?? []}
                    />
                </div>
            </div>
        </div>
    );
}
