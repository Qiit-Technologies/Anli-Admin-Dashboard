'use client';

import { getAllBanquetBookings } from '@/app/actions/banquet-booking';
import BookingsEmptyState from '@/components/banquest/booking-wizard/BookingsEmptyState';
import BookingStatsCards from '@/components/banquest/bookings/BookingStatsCards';
import {
    BookingColumns,
    BookingFilters,
} from '@/components/banquest/tables/columns/bookings';
import { BookingForm } from '@/components/banquest/types';
import { computeBookingListStats } from '@/components/banquest/utils/booking-display';
import { mapApiBookingToForm } from '@/components/banquest/utils/build-booking-payload';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import Link from 'next/link';
import { useMemo } from 'react';
import useSWR from 'swr';

const BookingPage = () => {
    const { data, error, isLoading } = useSWR(
        '/banquet/bookings',
        getAllBanquetBookings,
    );

    const bookings = useMemo(() => {
        if (error || !data || typeof data !== 'object') return [];
        if ('error' in data && data.error) return [];
        return Array.isArray(data)
            ? data.map(
                  (row) =>
                      mapApiBookingToForm(
                          row as Record<string, unknown>,
                      ) as BookingForm,
              )
            : [];
    }, [data, error]);

    const stats = useMemo(() => computeBookingListStats(bookings), [bookings]);

    const venueFilterOptions = useMemo(() => {
        const venues = new Set(
            bookings.map((b) => b.eventVenue).filter(Boolean),
        );
        return Array.from(venues).map((v) => ({ value: v, label: v }));
    }, [bookings]);

    const filters = useMemo(
        () =>
            BookingFilters.map((f) =>
                f.id === 'eventVenue'
                    ? { ...f, options: venueFilterOptions }
                    : f,
            ),
        [venueFilterOptions],
    );

    return (
        <PageWrapper className="lg:px-0 gap-0">
            <PageHeader>
                <PageHeadertitle title="Bookings" />
            </PageHeader>

            <div className="flex flex-col bg-white justify-between gap-10 mb-4 p-8 align-center justify-between">
                <div className="flex align-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Bookings
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Search, filter, and manage every event reservation.
                        </p>
                    </div>
                    <Link href="/banquet/bookings/new">
                        <BrandButton>+ Create Bookings</BrandButton>
                    </Link>
                </div>
                <BookingStatsCards stats={stats} loading={isLoading} />
            </div>

            <div className="px-4 lg:px-8">
                {error || (data && 'error' in data && data.error) ? (
                    <p className="text-sm text-destructive px-4 mb-4">
                        Failed to load bookings. Please refresh or try again.
                    </p>
                ) : isLoading ? (
                    <p className="px-4 text-sm text-muted-foreground">
                        Loading bookings…
                    </p>
                ) : bookings.length === 0 ? (
                    <BookingsEmptyState />
                ) : (
                    <CustomTable
                        columns={BookingColumns}
                        data={bookings}
                        filters={filters}
                        hasDateFilter
                        dateFilter={{
                            enabled: true,
                            column: 'eventDate',
                            label: 'Select dates range',
                        }}
                    />
                )}
            </div>
        </PageWrapper>
    );
};

export default BookingPage;
