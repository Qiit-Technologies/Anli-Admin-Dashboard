'use client';

import { useState, useMemo } from 'react';
import { getVendorDetail } from '@/app/actions/vendor';
import useSWR from 'swr';

export function useVendorDetail(vendorId: string) {
    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { data } = useSWR(
        vendorId ? `/accounts/vendor-detail/${vendorId}` : null,
        () => getVendorDetail(vendorId),
    );
    const vendor = data && 'vendor' in data ? (data as any).vendor : undefined;
    const transactions =
        data && 'transactions' in data ? (data as any).transactions : [];

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

    const handleFilters = () => {
        // This can open a filter modal or UI in your component
        // For now, just a placeholder
        console.log('Open transaction filters');
    };

    return {
        vendor,
        transactions: filteredTransactions,
        searchValue,
        setSearchValue,
        statusFilter,
        setStatusFilter,
        handleDownloadPayslips,
        handleFilters,
    };
}
