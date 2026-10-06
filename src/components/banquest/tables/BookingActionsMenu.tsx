'use client';

import { updateBanquetBooking } from '@/app/actions/banquet-booking';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookingForm } from '@/components/banquest/types';
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

const MENU_ITEMS = [
    { id: 'view', label: 'View Booking' },
    { id: 'reschedule', label: 'Reschedule Event' },
    { id: 'discount', label: 'Apply Discount' },
    { id: 'download-receipt', label: 'Download Receipt' },
    { id: 'assign-coordinator', label: 'Assign Coordinator' },
    { id: 'print-order', label: 'Print Banquet Event Order (BEO)' },
    { id: 'mark-completed', label: 'Mark Event Completed' },
    { id: 'cancel', label: 'Cancel Booking', destructive: true },
] as const;

function showComingSoon(label: string) {
    toast.custom(() => (
        <Toast
            title="Coming soon"
            description={`${label} will be available in a future update.`}
            type="success"
        />
    ));
}

export default function BookingActionsMenu({
    booking,
    trigger,
}: {
    booking: BookingForm;
    trigger?: ReactNode;
}) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleAction = async (
        actionId: (typeof MENU_ITEMS)[number]['id'],
    ) => {
        setMenuOpen(false);

        switch (actionId) {
            case 'view':
                router.push(`/banquet/bookings/${booking.id}`);
                break;
            case 'reschedule':
                router.push(`/banquet/bookings/${booking.id}/edit?step=1`);
                break;
            case 'discount':
                router.push(`/banquet/bookings/${booking.id}/edit?step=6`);
                break;
            case 'cancel': {
                if (
                    !window.confirm(
                        'Cancel this booking? The booking will be marked as cancelled.',
                    )
                ) {
                    return;
                }
                const result = await updateBanquetBooking(booking.id, {
                    bookingStatus: 'cancelled',
                });
                if (result.error) {
                    toast.custom(() => (
                        <Toast
                            title="Error"
                            description={result.error}
                            type="error"
                        />
                    ));
                    return;
                }
                toast.custom(() => (
                    <Toast
                        title="Cancelled"
                        description="Booking has been cancelled."
                        type="success"
                    />
                ));
                await mutate('/banquet/bookings');
                break;
            }
            case 'download-receipt':
            case 'assign-coordinator':
            case 'mark-completed':
            case 'print-order':
                showComingSoon(
                    MENU_ITEMS.find((i) => i.id === actionId)?.label ??
                        'Action',
                );
                break;
            default:
                break;
        }
    };

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                {trigger ?? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        aria-label="Booking actions"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-64 rounded-xl border border-gray-200 p-2 shadow-lg"
            >
                {MENU_ITEMS.map((item) => (
                    <DropdownMenuItem
                        key={item.id}
                        className="cursor-pointer rounded-lg px-3 py-3 text-sm font-medium text-gray-900 focus:bg-slate-50"
                        onClick={() => handleAction(item.id)}
                    >
                        {'destructive' in item && item.destructive ? (
                            <span className="text-red-600">{item.label}</span>
                        ) : (
                            item.label
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
