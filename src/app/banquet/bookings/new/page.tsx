'use client';

import BanquetCreateBookingWizard from '@/components/banquest/booking-wizard/BanquetCreateBookingWizard';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function NewBanquetBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const calendarPrefill = useMemo(() => {
        const eventDate = searchParams.get('eventDate');
        const eventVenue = searchParams.get('eventVenue');
        if (!eventDate && !eventVenue) return undefined;
        return {
            ...(eventDate ? { eventDate } : {}),
            ...(eventVenue ? { eventVenue } : {}),
        };
    }, [searchParams]);

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
                        title="Create New Booking"
                        subtitle="Complete each step to reserve your banquet event."
                    />
                </div>
            </PageHeader>
            <div className="mx-auto w-full max-w-6xl px-4 pb-16">
                <BanquetCreateBookingWizard
                    initialValues={calendarPrefill}
                    onSuccess={(bookingId) =>
                        router.push(
                            bookingId
                                ? `/banquet/bookings/${bookingId}`
                                : '/banquet/bookings',
                        )
                    }
                    onCancel={() => router.push('/banquet/bookings')}
                />
            </div>
        </PageWrapper>
    );
}
