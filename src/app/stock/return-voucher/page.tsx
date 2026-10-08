'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { returnVoucherColumns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import useSWR from 'swr';
import { getReturnVouchers } from '@/app/actions/stock';
import Link from 'next/link';
import { useMemo } from 'react';
import { ReturnVoucher } from './types';

const ReturnVoucherPage = () => {
    const { data: rtvResponse } = useSWR(
        '/items/return-vouchers',
        getReturnVouchers,
    );

    const data: ReturnVoucher[] = useMemo(() => {
        if (!rtvResponse) return [];
        if (rtvResponse.error) return [];
        const d = rtvResponse.data;
        return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
    }, [rtvResponse]);

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Return Voucher"
                    subtitle="Stock returned from departments to the store — RTV documents with full audit trail."
                />
                <HeaderActions>
                    <Button asChild size="sm" className="gap-1.5">
                        <Link href="/stock/return-voucher/create">
                            <Plus className="h-3.5 w-3.5" />
                            New Return Voucher
                        </Link>
                    </Button>
                </HeaderActions>
            </PageHeader>
            <PageWrapper>
                {rtvResponse?.error ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
                        <p className="text-sm font-medium text-amber-800">
                            Return voucher service unavailable
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                            {rtvResponse.error} — the backend
                            endpoint <code>/items/return-vouchers</code>{' '}
                            is not ready yet. The page will populate once
                            it ships.
                        </p>
                    </div>
                ) : null}
                <CustomTable
                    data={data}
                    columns={returnVoucherColumns}
                    title="Return Vouchers"
                    isPaginated={true}
                    hasHeader={false}
                />
            </PageWrapper>
        </div>
    );
};

export default ReturnVoucherPage;
