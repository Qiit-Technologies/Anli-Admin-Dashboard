'use client';

import {
    getBanquetInventory,
    getBanquetInventoryStats,
} from '@/app/actions/banquet-inventory';
import AmenityListSection from '@/components/banquest/amenities/AmenityListSection';
import AmenityStatsCards from '@/components/banquest/amenities/AmenityStatsCards';
import {
    mapApiInventoryStats,
    mapApiInventoryStatsFromRows,
    mapApiInventoryToRow,
} from '@/components/banquest/amenities/utils/map-api-inventory';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import useSWR from 'swr';

const AmenityPage = () => {
    const { data: inventoryResponse, isLoading } = useSWR(
        '/banquet/inventory',
        getBanquetInventory,
    );

    const { data: statsResponse } = useSWR(
        '/banquet/inventory/stats',
        getBanquetInventoryStats,
    );

    const amenities = useMemo(() => {
        if (!inventoryResponse?.data || 'error' in inventoryResponse) return [];
        return inventoryResponse.data.map(mapApiInventoryToRow);
    }, [inventoryResponse]);

    const stats = useMemo(() => {
        if (statsResponse?.data && !('error' in statsResponse)) {
            return mapApiInventoryStats(statsResponse.data);
        }
        return mapApiInventoryStatsFromRows(amenities);
    }, [statsResponse, amenities]);

    const loadError =
        inventoryResponse &&
        typeof inventoryResponse === 'object' &&
        'error' in inventoryResponse &&
        inventoryResponse.error;

    return (
        <PageWrapper className="lg:px-0 gap-0 bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle title="Amenities" />
            </PageHeader>

            <div className="flex flex-col gap-6 bg-white px-4 py-8 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Amenities
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage, add and track available rental amenities.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            className="border-orion-blue text-orion-blue"
                            asChild
                        >
                            <Link href="/banquet/amenities/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Amenities
                            </Link>
                        </Button>
                        <Link href="/banquet/rented-item/rent">
                            <BrandButton
                                type="button"
                                icon={<ShoppingCart className="h-4 w-4" />}
                            >
                                Rent Amenities
                            </BrandButton>
                        </Link>
                    </div>
                </div>
                <AmenityStatsCards stats={stats} loading={isLoading} />
            </div>

            <div className="mt-8 px-4 pb-10 lg:px-8">
                {loadError ? (
                    <p className="mb-4 text-sm text-destructive">
                        Failed to load amenities. Please refresh.
                    </p>
                ) : isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Loading amenities…
                    </p>
                ) : amenities.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No amenities yet. Add your first amenity to get
                            started.
                        </p>
                        <Link href="/banquet/amenities/create">
                            <BrandButton className="mt-4" type="button">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Amenities
                            </BrandButton>
                        </Link>
                    </div>
                ) : (
                    <AmenityListSection amenities={amenities} />
                )}
            </div>
        </PageWrapper>
    );
};

export default AmenityPage;
