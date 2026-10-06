'use client';

import {
    getBanquetRentalStats,
    getBanquetRentals,
} from '@/app/actions/banquet-rental';
import RentalStatsCards from '@/components/banquest/rented-items/RentalStatsCards';
import RentedItemListSection from '@/components/banquest/rented-items/RentedItemListSection';
import {
    mapApiRentalStats,
    mapApiRentalStatsFromRows,
    mapApiRentalToRow,
} from '@/components/banquest/rented-items/utils/map-api-rental';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import useSWR from 'swr';

const RentedItemPage = () => {
    const { data: rentalsResponse, isLoading } = useSWR(
        '/banquet/rentals',
        getBanquetRentals,
    );

    const { data: statsResponse } = useSWR(
        '/banquet/rentals/stats',
        getBanquetRentalStats,
    );

    const items = useMemo(() => {
        if (!rentalsResponse?.data || 'error' in rentalsResponse) return [];
        return rentalsResponse.data.map(mapApiRentalToRow);
    }, [rentalsResponse]);

    const stats = useMemo(() => {
        if (statsResponse?.data && !('error' in statsResponse)) {
            return mapApiRentalStats(statsResponse.data);
        }
        return mapApiRentalStatsFromRows(items);
    }, [statsResponse, items]);

    const loadError =
        rentalsResponse &&
        typeof rentalsResponse === 'object' &&
        'error' in rentalsResponse &&
        rentalsResponse.error;

    return (
        <PageWrapper className="lg:px-0 gap-0 bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle title="Rentals" />
            </PageHeader>

            <div className="flex flex-col gap-6 bg-white px-4 py-8 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Rented Amenities
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage, add and track available rental amenities.
                        </p>
                    </div>
                    <Link href="/banquet/rented-item/rent">
                        <BrandButton
                            type="button"
                            icon={<ShoppingCart className="h-4 w-4" />}
                        >
                            Rent Amenities
                        </BrandButton>
                    </Link>
                </div>
                <RentalStatsCards stats={stats} loading={isLoading} />
            </div>

            <div className="mt-8 px-4 pb-10 lg:px-8">
                {loadError ? (
                    <p className="mb-4 text-sm text-destructive">
                        Failed to load rentals. Please refresh.
                    </p>
                ) : isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Loading rentals…
                    </p>
                ) : items.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No rentals yet. Rent amenities to get started.
                        </p>
                        <Link href="/banquet/rented-item/rent">
                            <BrandButton className="mt-4" type="button">
                                Rent Amenities
                            </BrandButton>
                        </Link>
                    </div>
                ) : (
                    <RentedItemListSection items={items} />
                )}
            </div>
        </PageWrapper>
    );
};

export default RentedItemPage;
