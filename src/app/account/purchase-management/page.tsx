'use client';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { PurchaseMngtColumns } from '@/components/kitchen/tables/columns/PurchaseMngtColumns';
import { getPurchaseOrdersForAccount } from '@/app/actions/invoice';
// import { Button } from '@heroui/react';
// import { UploadCloud } from 'lucide-react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';
import { useUser } from '@/context/useUser';
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const PurchaseManagement = () => {
    const { user } = useUser();
    // Fetch only POs sent to account
    const { data: purchaseOrders, isLoading } = useSWR(
        '/accounts/purchase-orders/account',
        getPurchaseOrdersForAccount,
    );
    console.log(purchaseOrders);
    const [search, setSearch] = useState('');
    // const [importing, setImporting] = useState(false);

    type PurchaseOrder = {
        poNumber: string;
        vendor?: { vendorName: string; id: number; emailAddress: string };
        total: number;
        itemGrouping: string;
        dateSent: string | Date;
        status: string;
        items: {
            item: string;
            quantity: number;
            amount: number;
        }[];
        sentToAccount: boolean;
        sentToAccountAt: string | Date;
    };
    const tableData = (purchaseOrders?.data ?? []).map(
        (order: PurchaseOrder) => ({
            poNumber: order.poNumber,
            vendor: order.vendor,
            total: `₦${order.total?.toLocaleString?.() ?? order.total}`,
            itemGrouping: order.itemGrouping,
            dateSent: order.sentToAccountAt || order.dateSent, // Use sent to account date
            status: order.status,
            items: order.items,
            sentToAccount: order.sentToAccount,
        }),
    );

    const filteredData = tableData.filter((order: any) => {
        return (
            search === '' ||
            order.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
            order.vendor?.vendorName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            order.vendor?.emailAddress
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );
    });

    // const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;
    //     setImporting(true);
    //     // TODO: Upload file to backend
    //     console.log('Importing file:', file.name);
    //     setTimeout(() => setImporting(false), 1500); // Simulate upload
    // };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Purchase Management"
                    subtitle={`Welcome back, ${user?.fullName}`}
                />
                <div className="ml-auto flex items-center gap-4">
                    <SearchInput
                        placeholder="Search purchase orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <LuBell className="text-xl" />
                </div>
            </PageHeader>

            {isLoading ? (
                <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                    <Loader2 className="text-brand animate-spin w-10 h-10" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Purchase Orders Table */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Purchase Orders Sent to Account
                            </h3>
                            <CustomTable
                                rightHeader={<div />}
                                columns={PurchaseMngtColumns}
                                data={filteredData}
                                hasHeader={false}
                                isPaginated
                            />
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default PurchaseManagement;
