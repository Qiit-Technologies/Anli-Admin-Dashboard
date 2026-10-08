'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { productionColumns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import useSWR from 'swr';
import { getProductionBatches } from '@/app/actions/stock';
import Link from 'next/link';
import { useMemo } from 'react';
import { ProductionBatch } from './types';
import { Suspense } from 'react';

function ProductionListPage() {
    const { data: batchesResponse, isLoading } = useSWR(
        '/items/production',
        () => getProductionBatches(),
    );

    const data: ProductionBatch[] = useMemo(() => {
        const raw = batchesResponse?.data;
        if (Array.isArray(raw)) return raw;
        if (raw && Array.isArray(raw.items)) return raw.items;
        return [];
    }, [batchesResponse]);

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Kitchen Production"
                    subtitle="Production batches — ingredients in, prepared items out"
                />
                <HeaderActions>
                    <Button asChild>
                        <Link href="/stock/production/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Production
                        </Link>
                    </Button>
                </HeaderActions>
            </PageHeader>

            {batchesResponse?.error && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Could not load production batches from the server ({batchesResponse.error}).
                    The list will populate once the backend ships{' '}
                    <span className="font-mono">/items/production</span>.
                </div>
            )}

            <CustomTable
                data={data}
                columns={productionColumns}
                isPaginated={true}
                hasHeader={false}
                title="Production Batches"
            />
            {data.length === 0 && !isLoading && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    No production batches yet. Start a batch from a recipe.
                </p>
            )}
        </PageWrapper>
    );
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading production…
                </div>
            }
        >
            <ProductionListPage />
        </Suspense>
    );
}
