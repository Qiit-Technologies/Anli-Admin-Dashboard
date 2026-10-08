'use client';

import {
    getBanquetBooking,
    updateBanquetBooking,
} from '@/app/actions/banquet-booking';
import BanquetCreateBookingWizard from '@/components/banquest/booking-wizard/BanquetCreateBookingWizard';
import { mapApiBookingToForm } from '@/components/banquest/utils/build-booking-payload';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

export default function EditBanquetBookingPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = Number(params.id);
    const initialStep = Number(searchParams.get('step') || '1');

    const { data, error, isLoading } = useSWR(
        Number.isFinite(id) ? `/banquet/bookings/${id}` : null,
        () => getBanquetBooking(id),
    );

    const initialValues =
        data && !('error' in data)
            ? mapApiBookingToForm(data as Record<string, unknown>)
            : undefined;

    const hasNoMenu =
        !initialValues?.cuisineType &&
        !initialValues?.menuName &&
        !initialValues?.menuType &&
        (!initialValues?.food || initialValues.food.length === 0);

    if (!Number.isFinite(id)) {
        return (
            <PageWrapper>
                <p className="px-4 text-destructive">Invalid booking id.</p>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex flex-col gap-3 w-full">
                    <Button
                        variant="ghost"
                        className="w-fit px-0 text-orion-blue hover:text-orion-blue"
                        asChild
                    >
                        <Link href="/banquet/bookings">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to bookings
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title="Edit Booking"
                        subtitle="Update event, customer, menu, amenities, and payment."
                    />
                </div>
            </PageHeader>
            <div className="mx-auto w-full max-w-6xl px-4 pb-16">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error || (data && 'error' in data) ? (
                    <p className="text-sm text-destructive">
                        Could not load this booking.
                    </p>
                ) : (
                    <BanquetCreateBookingWizard
                        mode="update"
                        bookingId={id}
                        initialValues={initialValues}
                        initialSkipMenu={hasNoMenu}
                        initialStep={initialStep}
                        onSuccess={() => router.push(`/banquet/bookings/${id}`)}
                        onCancel={() => router.push('/banquet/bookings')}
                        onSubmitBooking={(payload) =>
                            updateBanquetBooking(id, payload)
                        }
                    />
                )}
            </div>
        </PageWrapper>
    );
}
