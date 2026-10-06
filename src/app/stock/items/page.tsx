'use client';

import { type UploadItemsCsvSuccess } from '@/app/actions/items';
import { CustomSheet } from '@/components/common/CustomSheet';
import UploadForm from '@/components/common/Form/Upload';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/common/PageWrapper';
import { BulkUploadSummaryDialog } from '@/components/stock/BulkUploadSummaryDialog';
import {
    stockItemsColumn,
    stockItemsFilters,
} from '@/components/stock/tables/columns/items';
import StockItemTable from '@/components/stock/tables/StockItemTable';
import { Button } from '@/components/ui/button';
import { fetchStockItems } from '@/hooks/fetcher';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';

const StockItems = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');
    const { data: items } = useSWR('/items', fetchStockItems);
    const [error, setError] = useState<string>('');
    const [openBus, setOpenBus] = useState(false);
    const [uploadSummary, setUploadSummary] =
        useState<UploadItemsCsvSuccess | null>(null);
    const closeBus = () => {
        setOpenBus(false);
    };

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Inventory Items"
                    subtitle="Track stock levels, costs, and vendor details across locations."
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper className="gap-3 py-4">
                {statusFilter ? (
                    <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm">
                        <span>
                            Filtered by status: <strong>{statusFilter}</strong>
                        </span>
                        <Link
                            href="/stock/items"
                            className="text-orion-blue hover:underline"
                        >
                            Back to all items
                        </Link>
                    </div>
                ) : null}
                {uploadSummary ? (
                    <BulkUploadSummaryDialog
                        summary={uploadSummary}
                        onDismiss={() => setUploadSummary(null)}
                    />
                ) : null}

                {error && (
                    <div className="bg-red-100 text-red-600 w-full border-red-600 rounded-lg p-4">
                        Error: {error}
                    </div>
                )}
                <StockItemTable
                    data={items ?? []}
                    columns={stockItemsColumn}
                    filters={stockItemsFilters}
                    hasStickyAction
                    scrollHorizontal
                    extended={
                        <>
                            <CustomSheet
                                title="Bulk Upload Item"
                                open={openBus}
                                setOpen={setOpenBus}
                                trigger={
                                    <Button className="bg-orion-blue hover:bg-orion-blue text-white">
                                        Bulk Upload
                                    </Button>
                                }
                            >
                                <UploadForm
                                    onError={(err) => setError(err)}
                                    closeBus={closeBus}
                                    onUploadSuccess={setUploadSummary}
                                />
                            </CustomSheet>
                            <Button
                                onClick={() =>
                                    router.push('/stock/items/create')
                                }
                                variant="outline"
                                className="border-orion-blue text-orion-blue"
                            >
                                Add new item
                            </Button>
                        </>
                    }
                />
            </PageWrapper>
        </div>
    );
};

export default StockItems;
