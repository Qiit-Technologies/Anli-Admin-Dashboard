'use client';

import { BookingDetailModel } from '@/components/banquest/booking-detail/booking-detail-model';
import { cn } from '@/lib/utils';
import {
    CalendarDays,
    Clock3,
    FileText,
    MapPin,
    Wallet,
} from 'lucide-react';

function StatusCard({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: string;
    icon: typeof FileText;
    tone: 'green' | 'orange' | 'red';
}) {
    const tones = {
        green: {
            wrap: 'bg-emerald-50 border-emerald-100',
            icon: 'bg-emerald-100 text-emerald-600',
            text: 'text-emerald-700',
        },
        orange: {
            wrap: 'bg-orange-50 border-orange-100',
            icon: 'bg-orange-100 text-orange-600',
            text: 'text-orange-700',
        },
        red: {
            wrap: 'bg-red-50 border-red-100',
            icon: 'bg-red-100 text-red-600',
            text: 'text-red-700',
        },
    }[tone];

    return (
        <div
            className={cn(
                'rounded-[8px] border p-2 flex items-center gap-3 min-w-0',
                tones.wrap,
            )}
        >
            <div
                className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    tones.icon,
                )}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn('text-lg font-bold truncate', tones.text)}>
                    {value}
                </p>
            </div>
        </div>
    );
}

export function BookingStatusCards({ model }: { model: BookingDetailModel }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusCard
                label="Booking Status"
                value={model.bookingStatus}
                icon={FileText}
                tone="green"
            />
            <StatusCard
                label="Payment Status"
                value={model.paymentStatus}
                icon={Wallet}
                tone="orange"
            />
            <StatusCard
                label="Event Status"
                value={model.eventStatus}
                icon={CalendarDays}
                tone="red"
            />
        </div>
    );
}

export function BookingQuickFacts({ model }: { model: BookingDetailModel }) {
    const facts = [
        {
            icon: CalendarDays,
            label: 'Event Date',
            value: model.eventDateLabel,
        },
        {
            icon: CalendarDays,
            label: 'Event Date',
            value: model.eventDateLabel,
        },
        {
            icon: Clock3,
            label: 'Guests',
            value: model.guestCountLabel,
        },
        {
            icon: MapPin,
            label: 'Venue',
            value: model.booking.eventVenue,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
            {facts.map((fact, index) => (
                <div
                    key={`${fact.label}-${index}`}
                    className="flex items-start gap-2 min-w-0"
                >
                    <fact.icon className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                            {fact.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 capitalize break-words">
                            {fact.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
