'use client';

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
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { RentedItemRow } from '../types/rented-item';
import { formatMoney, lineTotal } from '../utils/banquet-pricing';

interface Props {
    row: RentedItemRow;
}

function formatDisplayDate(value: string): string {
    try {
        const d = value.includes('T')
            ? parseISO(value)
            : parseISO(`${value}T12:00:00`);
        return format(d, 'do MMMM yyyy');
    } catch {
        return value;
    }
}

const RentedItemAction = ({ row }: Props) => {
    const { booking } = row;
    const amenitiesTotal = booking.amenities.reduce(
        (sum, a) => sum + lineTotal(a.cost, a.quantity),
        0,
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="link"
                    className="h-auto p-0 text-orion-blue font-normal"
                >
                    View
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Amenities Review</DialogTitle>
                    <DialogDescription>
                        Rental details for this event booking.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-3">
                        <h3 className="text-sm font-semibold">Booking Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Customer Name</p>
                                <p className="font-semibold">{booking.customerName}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Customer Email</p>
                                <p className="font-semibold">
                                    {booking.customerEmailAddress}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Customer Phone</p>
                                <p className="font-semibold">
                                    {booking.customerPhoneNumber}
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-muted-foreground">Event Venue</p>
                                <p className="font-semibold">{booking.eventVenue}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Event Date</p>
                                <p className="font-semibold">
                                    {formatDisplayDate(booking.eventDate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Event Time</p>
                                <p className="font-semibold">{booking.eventTime}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-3">
                        <h3 className="text-sm font-semibold">Amount for Amenities</h3>
                        <ul className="space-y-3">
                            {booking.amenities.map((item) => (
                                <li
                                    key={`${item.id}-${item.name}`}
                                    className="flex items-start justify-between gap-4"
                                >
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} pieces
                                        </p>
                                    </div>
                                    <p className="font-semibold shrink-0">
                                        {formatMoney(
                                            lineTotal(item.cost, item.quantity),
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between border-t pt-3 font-semibold">
                            <span>Total Amount</span>
                            <span>{formatMoney(amenitiesTotal)}</span>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4 flex items-center justify-between">
                        <span className="text-sm font-medium">Returned Status</span>
                        <Badge
                            className={cn(
                                row.returnStatus === 'returned'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-600',
                                'rounded-full shadow-none capitalize',
                            )}
                        >
                            {row.returnStatus}
                        </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button className="flex-1 bg-orion-blue hover:bg-orion-blue/90" asChild>
                            <Link
                                href={`/banquet/bookings/${row.bookingId}/edit?step=4`}
                            >
                                Manage amenities
                            </Link>
                        </Button>
                        <Button variant="outline" className="flex-1" asChild>
                            <Link href={`/banquet/bookings/${row.bookingId}/edit?step=6`}>
                                Proceed to payment
                            </Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RentedItemAction;
