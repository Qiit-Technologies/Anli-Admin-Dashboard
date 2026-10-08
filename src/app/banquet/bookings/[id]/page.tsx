'use client';

import { getBanquetBooking } from '@/app/actions/banquet-booking';
import BookingDetailView, {
    BookingDetailLoading,
} from '@/components/banquest/booking-detail/BookingDetailView';
import { BookingForm } from '@/components/banquest/types';
import { mapApiBookingToForm } from '@/components/banquest/utils/build-booking-payload';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

export default function BanquetBookingDetailPage() {
    const params = useParams();
    const id = Number(params.id);

    const { data, error, isLoading } = useSWR(
        Number.isFinite(id) ? `/banquet/bookings/${id}` : null,
        () => getBanquetBooking(id),
    );

    if (!Number.isFinite(id)) {
        return (
            <PageWrapper>
                <p className="px-4 text-destructive">Invalid booking id.</p>
            </PageWrapper>
        );
    }

    const booking: BookingForm | undefined =
        data && !('error' in data)
            ? (mapApiBookingToForm(
                  data as Record<string, unknown>,
              ) as BookingForm)
            : undefined;

    const raw =
        data && !('error' in data)
            ? (data as Record<string, unknown>)
            : undefined;

    return (
        <PageWrapper className="lg:px-0 gap-0">
            <PageHeader>
                <PageHeadertitle
                    title={booking?.eventName || 'Booking Details'}
                    subtitle=""
                    extentContent={
                        <Breadcrumb
                            items={[
                                {
                                    label: 'Back to Bookings',
                                    href: '/banquet/bookings',
                                },
                                {
                                    label:
                                        booking?.eventName || 'Booking Details',
                                    href: `/banquet/bookings/${id}`,
                                },
                            ]}
                        >
                            <BreadcrumbItem>
                                <Link href="/banquet/bookings">Bookings</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link href={`/banquet/bookings/${id}`}>
                                    {booking?.eventName}
                                </Link>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
            </PageHeader>

            <div>
                {isLoading ? (
                    <BookingDetailLoading />
                ) : error || (data && 'error' in data) || !booking ? (
                    <p className="text-sm text-destructive">
                        Could not load this booking.
                    </p>
                ) : (
                    <BookingDetailView booking={booking} raw={raw} />
                )}
            </div>
        </PageWrapper>
    );
}
