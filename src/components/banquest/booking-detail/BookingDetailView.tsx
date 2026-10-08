'use client';

import BookingMoreActionsMenu from '@/components/banquest/booking-detail/BookingMoreActionsMenu';
import {
    BookingQuickFacts,
    BookingStatusCards,
} from '@/components/banquest/booking-detail/BookingStatusCards';
import EventOverviewTab from '@/components/banquest/booking-detail/EventOverviewTab';
import GuestsRequestTab from '@/components/banquest/booking-detail/GuestsRequestTab';
import PaymentsInvoiceTab from '@/components/banquest/booking-detail/PaymentsInvoiceTab';
import { buildBookingDetailModel } from '@/components/banquest/booking-detail/booking-detail-model';
import { BookingForm } from '@/components/banquest/types';
import SearchInput from '@/components/common/SearchInput';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CloudDownload, LoaderCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function BookingDetailView({
    booking,
    raw,
}: {
    booking: BookingForm;
    raw?: Record<string, unknown>;
}) {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'overview';
    const [tab, setTab] = useState(initialTab);
    const [search, setSearch] = useState('');

    const model = useMemo(
        () => buildBookingDetailModel(booking, raw),
        [booking, raw],
    );

    const editBase = `/banquet/bookings/${booking.id}/edit`;
    const title = booking.eventName || booking.eventType || 'Booking';

    const showComingSoon = (label: string) => {
        toast.custom(() => (
            <Toast
                title="Coming soon"
                description={`${label} will be available in a future update.`}
                type="success"
            />
        ));
    };

    return (
        <div className="space-y-5 pb-10">
            {/* <Link
                href="/banquet/bookings"
                className="inline-flex items-center gap-1 text-sm font-medium text-orion-blue hover:underline"
            >
                <ChevronLeft className="h-4 w-4" />
                Back
            </Link> */}

            {model.vipNotes ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-900 break-words">
                    {model.vipNotes}
                </div>
            ) : null}

            <div className="flex flex-col justify-between gap-4 bg-white p-8">
                <div className="flex align-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Bookings
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {model.createdLabel}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 gap-2 self-start"
                        onClick={() => showComingSoon('Download')}
                    >
                        <CloudDownload className="h-4 w-4" />
                        Download
                    </Button>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <SearchInput
                            className="max-w-xs"
                            placeholder="Search by event name, client...."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button variant="outline" asChild>
                            <Link href={editBase}>Edit Booking</Link>
                        </Button>
                        <Button
                            className="bg-hexbrand hover:bg-hexbrand/90 text-white"
                            asChild
                        >
                            <Link href={`${editBase}?step=6`}>Add Payment</Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => showComingSoon('Print Invoice')}
                        >
                            <Printer className="h-4 w-4" />
                            Print Invoice
                        </Button>
                        <BookingMoreActionsMenu booking={booking} />
                    </div>
                </div>
            </div>

            <div className="px-4 lg:px-8 flex flex-col bg-white p-8 gap-4">
                <BookingStatusCards model={model} />
                <BookingQuickFacts model={model} />
            </div>

            <Tabs
                value={tab}
                onValueChange={setTab}
                className="w-full px-4 lg:px-8"
            >
                <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-gray-100 p-1">
                    {[
                        { value: 'overview', label: 'Event Overview' },
                        { value: 'payments', label: 'Payments & Invoice' },
                        { value: 'guests', label: 'Guests Request' },
                    ].map((item) => (
                        <TabsTrigger
                            key={item.value}
                            value={item.value}
                            className={cn(
                                'rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-hexbrand data-[state=active]:text-white data-[state=active]:shadow-none',
                            )}
                        >
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                    <EventOverviewTab model={model} editBase={editBase} />
                </TabsContent>
                <TabsContent value="payments" className="mt-4">
                    <PaymentsInvoiceTab model={model} editBase={editBase} />
                </TabsContent>
                <TabsContent value="guests" className="mt-4">
                    <GuestsRequestTab model={model} editBase={editBase} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export function BookingDetailLoading() {
    return (
        <div className="flex justify-center py-20">
            <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
}
