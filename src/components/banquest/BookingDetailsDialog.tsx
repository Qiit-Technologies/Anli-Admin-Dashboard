'use client';

import { deleteBanquetBooking } from '@/app/actions/banquet-booking';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { BookingForm } from './types';
import { formatMoney } from './utils/banquet-pricing';

export interface BookingDetailsDialogProps {
    booking: BookingForm;
    trigger?: ReactNode;
    open?: boolean;
    onOpenChange?: (_open: boolean) => void;
    onDeleted?: () => void;
}

function formatEventDate(value: string): string {
    if (!value) return '—';
    try {
        const d = value.includes('T')
            ? parseISO(value)
            : parseISO(`${value}T12:00:00`);
        return format(d, 'do MMMM yyyy');
    } catch {
        return value;
    }
}

function displayValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    const s = String(value).trim();
    return s.length > 0 ? s : '—';
}

function bookingStatusBadge(status: string) {
    const normalized = status.toLowerCase();
    if (normalized === 'confirmed') {
        return (
            <Badge className="rounded-full bg-emerald-100 text-emerald-800 shadow-none hover:bg-emerald-100">
                Confirmed
            </Badge>
        );
    }
    if (normalized === 'cancelled') {
        return (
            <Badge className="rounded-full bg-red-100 text-red-700 shadow-none hover:bg-red-100">
                Cancelled
            </Badge>
        );
    }
    return (
        <Badge className="rounded-full bg-slate-100 text-slate-700 shadow-none capitalize">
            {status}
        </Badge>
    );
}

function paymentStatusBadge(status: string) {
    const normalized = status.toLowerCase();
    if (normalized === 'paid') {
        return (
            <Badge className="rounded-full bg-emerald-100 text-emerald-800 shadow-none hover:bg-emerald-100">
                Paid
            </Badge>
        );
    }
    if (normalized === 'partial') {
        return (
            <Badge className="rounded-full bg-amber-100 text-amber-800 shadow-none hover:bg-amber-100">
                Partial Payment
            </Badge>
        );
    }
    return (
        <Badge className="rounded-full bg-orange-100 text-orange-800 shadow-none hover:bg-orange-100 capitalize">
            {normalized || 'Pending'}
        </Badge>
    );
}

function DetailSection({
    title,
    badge,
    children,
}: {
    title: string;
    badge?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                {badge}
            </div>
            {children}
        </section>
    );
}

function DetailField({
    label,
    value,
    className,
    valueClassName,
    href,
}: {
    label: string;
    value: string;
    className?: string;
    valueClassName?: string;
    href?: string;
}) {
    const content = href ? (
        <Link
            href={href}
            className={cn(
                'text-base font-semibold text-orion-blue underline underline-offset-2 break-words',
                valueClassName,
            )}
        >
            {value}
        </Link>
    ) : (
        <p
            className={cn(
                'text-base font-semibold text-gray-900 break-words',
                valueClassName,
            )}
        >
            {value}
        </p>
    );

    return (
        <div className={cn('min-w-0 flex flex-col gap-1', className)}>
            <span className="text-sm text-muted-foreground">{label}</span>
            {content}
        </div>
    );
}

function DetailGrid({ children }: { children: ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 min-w-0">
            {children}
        </div>
    );
}

function computePaymentAmounts(booking: BookingForm) {
    const total = Number(booking.total) || 0;
    const status = booking.paymentStatus ?? 'pending';

    if (status === 'paid') {
        return { amountPaid: total, balance: 0 };
    }
    if (status === 'partial') {
        return {
            amountPaid: null as number | null,
            balance: null as number | null,
        };
    }
    return { amountPaid: 0, balance: total };
}

export function BookingDetailsDialog({
    booking,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    onDeleted,
}: BookingDetailsDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled
        ? (next: boolean) => controlledOnOpenChange?.(next)
        : setInternalOpen;

    const bookingStatus = booking.bookingStatus ?? 'confirmed';
    const paymentStatus = booking.paymentStatus ?? 'pending';
    const { amountPaid, balance } = computePaymentAmounts(booking);

    const customerDisplayName = [booking.customerTitle, booking.customerName]
        .filter(Boolean)
        .join(' ')
        .trim();

    const foodRows = (() => {
        const items = booking.food?.filter((f) => f.name?.trim()) ?? [];
        if (items.length >= 3) {
            return [
                { label: 'Main Dishes', value: items[0]?.name },
                { label: 'Protein', value: items[1]?.name },
                { label: 'Drink', value: items[2]?.name },
            ];
        }
        if (items.length > 0) {
            return items.map((f, i) => ({
                label: i === 0 ? 'Menu item' : `Item ${i + 1}`,
                value: f.name,
            }));
        }
        const rows: { label: string; value: string }[] = [];
        if (booking.menuName) {
            rows.push({ label: 'Menu', value: booking.menuName });
        }
        if (booking.cuisineType) {
            rows.push({ label: 'Cuisine', value: booking.cuisineType });
        }
        if (booking.menuType) {
            rows.push({ label: 'Menu type', value: booking.menuType });
        }
        return rows;
    })();

    const handleDelete = async () => {
        if (
            !window.confirm(
                'Delete this booking? This action cannot be undone.',
            )
        ) {
            return;
        }
        setDeleting(true);
        const result = await deleteBanquetBooking(booking.id);
        setDeleting(false);

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        toast.custom(() => (
            <Toast
                title="Deleted"
                description="Booking removed successfully."
                type="success"
            />
        ));
        setOpen(false);
        await mutate('/banquet/bookings');
        onDeleted?.();
    };

    const dialogBody = (
        <>
            <div className="space-y-4">
                <DetailSection
                    title="Event Details"
                    badge={bookingStatusBadge(bookingStatus)}
                >
                    <DetailGrid>
                        <DetailField
                            label="Event Name"
                            value={displayValue(booking.eventName)}
                        />
                        <DetailField
                            label="Event Type"
                            value={displayValue(booking.eventType)}
                        />
                        <DetailField
                            label="Event Theme"
                            value={displayValue(booking.menuType)}
                        />
                        <DetailField
                            label="Event Venue"
                            value={displayValue(booking.eventVenue)}
                            href={
                                booking.eventVenue
                                    ? `https://maps.google.com/?q=${encodeURIComponent(booking.eventVenue)}`
                                    : undefined
                            }
                        />
                        <DetailField
                            label="Event Date"
                            value={formatEventDate(booking.eventDate)}
                        />
                        <DetailField
                            label="Event Time"
                            value={displayValue(booking.eventTime)}
                        />
                        {booking.eventDuration ? (
                            <DetailField
                                label="Event Duration"
                                value={displayValue(booking.eventDuration)}
                            />
                        ) : null}
                    </DetailGrid>
                </DetailSection>

                <DetailSection title="Customer Information">
                    <DetailGrid>
                        <DetailField
                            label="Customer ID"
                            value={`BK-${booking.id}`}
                        />
                        <DetailField
                            label="Customer Name"
                            value={displayValue(customerDisplayName)}
                        />
                        <DetailField
                            label="Contact Phone Number"
                            value={displayValue(booking.customerPhoneNumber)}
                        />
                        <DetailField
                            label="Customer Email Address"
                            value={displayValue(booking.customerEmailAddress)}
                        />
                    </DetailGrid>
                </DetailSection>

                {foodRows.length > 0 ? (
                    <DetailSection title="Food Menu">
                        <DetailGrid>
                            {foodRows.map((row) => (
                                <DetailField
                                    key={row.label}
                                    label={row.label}
                                    value={displayValue(row.value)}
                                />
                            ))}
                        </DetailGrid>
                    </DetailSection>
                ) : null}

                {(booking.amenities?.length ?? 0) > 0 ? (
                    <DetailSection title="Amenities">
                        <ul className="space-y-2 min-w-0">
                            {booking.amenities.map((a) => (
                                <li
                                    key={`${a.id}-${a.name}`}
                                    className="flex justify-between gap-3 text-sm min-w-0"
                                >
                                    <span className="font-medium break-words min-w-0">
                                        {a.name}{' '}
                                        <span className="text-muted-foreground font-normal">
                                            × {a.quantity}
                                        </span>
                                    </span>
                                    <span className="shrink-0 font-semibold">
                                        {formatMoney(
                                            Number(a.cost) * Number(a.quantity),
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </DetailSection>
                ) : null}

                <DetailSection
                    title="Payment Amount"
                    badge={paymentStatusBadge(paymentStatus)}
                >
                    <DetailGrid>
                        <DetailField
                            label="Discount"
                            value={formatMoney(Number(booking.discount) || 0)}
                        />
                        <DetailField
                            label="Tax"
                            value={formatMoney(Number(booking.tax) || 0)}
                        />
                        <DetailField
                            label="Total Amount"
                            value={formatMoney(Number(booking.total) || 0)}
                        />
                    </DetailGrid>
                    <hr className="my-4 border-gray-200" />
                    <DetailGrid>
                        <DetailField
                            label="Amount Paid"
                            value={
                                amountPaid === null
                                    ? '—'
                                    : formatMoney(amountPaid)
                            }
                        />
                        <DetailField
                            label="Balance"
                            value={
                                balance === null ? '—' : formatMoney(balance)
                            }
                        />
                    </DetailGrid>
                </DetailSection>
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <Button
                    className="w-full h-12 bg-orion-blue hover:bg-orion-blue/90"
                    asChild
                    onClick={() => setOpen(false)}
                >
                    <Link href={`/banquet/bookings/${booking.id}/edit?step=1`}>
                        Extend Booking
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-12 border-orion-blue text-orion-blue hover:bg-orion-blue/5"
                    asChild
                    onClick={() => setOpen(false)}
                >
                    <Link href={`/banquet/bookings/${booking.id}/edit`}>
                        Edit Booking
                    </Link>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="w-full h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    {deleting ? 'Deleting…' : 'Delete Booking'}
                </Button>
            </div>
        </>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader className="text-left space-y-1">
                    <DialogTitle className="text-xl font-bold">
                        Event Details
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        Manage the entire reservation for an event, including
                        venue selection, menus, amenities, and payment tracking.
                    </DialogDescription>
                </DialogHeader>
                {dialogBody}
            </DialogContent>
        </Dialog>
    );
}

export default BookingDetailsDialog;
