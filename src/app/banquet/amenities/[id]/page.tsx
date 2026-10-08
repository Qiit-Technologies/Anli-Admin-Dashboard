'use client';

import { getBanquetInventoryItem } from '@/app/actions/banquet-inventory';
import AmenityDetailView from '@/components/banquest/amenities/AmenityDetailView';
import { mapApiInventoryToRow } from '@/components/banquest/amenities/utils/map-api-inventory';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import useSWR from 'swr';

export default function AmenityDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    const { data, error, isLoading } = useSWR(
        Number.isFinite(id) ? `/banquet/inventory/${id}` : null,
        () => getBanquetInventoryItem(id),
    );

    const amenity = useMemo(() => {
        if (!data?.data || 'error' in data) return undefined;
        return mapApiInventoryToRow(data.data);
    }, [data]);

    const stillLoading = isLoading && !amenity && !error;

    return (
        <PageWrapper className="lg:px-0 gap-0">
            <PageHeader>
                <div className="flex w-full flex-col gap-3 px-4 lg:px-8">
                    <Button
                        variant="ghost"
                        className="w-fit text-orion-blue hover:text-orion-blue"
                        asChild
                    >
                        <Link href="/banquet/amenities">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title={amenity?.name ?? 'Amenity'}
                        subtitle=""
                    />
                </div>
            </PageHeader>

            {stillLoading ? (
                <div className="flex justify-center py-16">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : !amenity ? (
                <p className="px-8 text-sm text-destructive">
                    Amenity not found.
                </p>
            ) : (
                <div className="mt-8">
                    <AmenityDetailView amenity={amenity} />
                </div>
            )}
        </PageWrapper>
    );
}
