'use client';

import { returnBanquetRentalItem } from '@/app/actions/banquet-rental';
import AmenityThumbnail from '@/components/banquest/amenities/AmenityThumbnail';
import { mapApiRentalToRow } from '@/components/banquest/rented-items/utils/map-api-rental';
import { RentedItemRow } from '@/components/banquest/rented-items/types';
import Toast from '@/components/toast';
import {
    RENTED_CONDITION_STYLES,
    RENTED_STATUS_STYLES,
} from '@/components/banquest/rented-items/utils/rented-item-styles';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Download, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';

function InfoCell({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm font-semibold text-gray-900">
                {value}
            </div>
        </div>
    );
}

export default function RentedItemDetailDialog({
    item: initialItem,
}: {
    item: RentedItemRow;
}) {
    const { mutate } = useSWRConfig();
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState(initialItem);
    const [returning, setReturning] = useState(false);
    const statusStyles = RENTED_STATUS_STYLES[item.status];
    const condStyles = RENTED_CONDITION_STYLES[item.condition];

    const canReturn =
        item.status === 'rented' || item.status === 'over-due';

    const handleReturn = async () => {
        const lineId = Number(item.id);
        if (!Number.isFinite(lineId)) return;

        setReturning(true);
        const result = await returnBanquetRentalItem(lineId);
        setReturning(false);

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        if (result.data) {
            setItem(mapApiRentalToRow(result.data));
        }

        await mutate('/banquet/rentals');
        await mutate('/banquet/rentals/stats');
        await mutate('/banquet/inventory');
        await mutate('/banquet/inventory/stats');

        toast.custom(() => (
            <Toast
                title="Returned"
                description="Item marked as returned."
                type="success"
            />
        ));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="text-sm font-medium text-gray-600 hover:text-orion-blue"
                >
                    View
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl gap-0 overflow-y-auto p-0">
                <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                    <DialogTitle className="text-lg font-semibold">
                        Rented Item
                    </DialogTitle>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </DialogHeader>

                <div className="space-y-6 px-6 py-5">
                    <div className="flex flex-col gap-4 rounded-xl bg-orange-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-4">
                            <AmenityThumbnail
                                src={item.imageUrl}
                                alt={item.amenityName}
                                size="lg"
                            />
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {item.amenityName}
                                    </h3>
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                                            statusStyles.bg,
                                            statusStyles.text,
                                        )}
                                    >
                                        {statusStyles.label}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {item.category} · Electronic · indoor -
                                    outdoor
                                </p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            {canReturn ? (
                                <Button
                                    type="button"
                                    variant="default"
                                    disabled={returning}
                                    onClick={handleReturn}
                                >
                                    {returning
                                        ? 'Returning…'
                                        : 'Mark Returned'}
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-200"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-base font-semibold text-gray-900">
                            Additional information
                        </h4>
                        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <InfoCell
                                label="Total Quantity Rented"
                                value={item.rentedQuantity}
                            />
                            <InfoCell
                                label="Amount Paid"
                                value={formatMoney(item.amountPaid)}
                            />
                            <InfoCell
                                label="Event Type"
                                value={item.eventType}
                            />
                            <InfoCell
                                label="Current Condition"
                                value={
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                            condStyles.bg,
                                            condStyles.text,
                                        )}
                                    >
                                        {condStyles.label}
                                    </span>
                                }
                            />
                            <InfoCell
                                label="Rented Time"
                                value={item.rentedTime}
                            />
                            <InfoCell
                                label="Returned Date"
                                value={item.returnedDate ?? '—'}
                            />
                            <InfoCell
                                label="Returned Time"
                                value={item.returnedTime ?? '—'}
                            />
                            <InfoCell label="Due- Date" value={item.dueDate} />
                            <InfoCell
                                label="Rented Date"
                                value={item.rentedDate}
                            />
                            <InfoCell
                                label="Created By"
                                value={item.createdBy ?? '—'}
                            />
                            <InfoCell
                                label="Date created"
                                value={item.dateCreated ?? '—'}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-5">
                        <h4 className="text-base font-semibold text-gray-900">
                            Customer Contact
                        </h4>
                        <div className="mt-4 grid gap-6 sm:grid-cols-3">
                            <InfoCell
                                label="Title"
                                value={item.contact.title}
                            />
                            <InfoCell
                                label="First Name"
                                value={item.contact.firstName}
                            />
                            <InfoCell
                                label="Last Name"
                                value={item.contact.lastName}
                            />
                            <InfoCell
                                label="Email Address"
                                value={item.contact.email}
                            />
                            <InfoCell
                                label="Address"
                                value={item.contact.address}
                            />
                            <InfoCell
                                label="Phone Number"
                                value={item.contact.phone}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
