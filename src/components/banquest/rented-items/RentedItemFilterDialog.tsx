'use client';

import BrandButton from '@/components/common/Button';
import { SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ListFilter, X } from 'lucide-react';

export interface RentedItemFilterValues {
    amenity: string;
    eventType: string;
    status: string;
}

interface RentedItemFilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    values: RentedItemFilterValues;
    onChange: (values: RentedItemFilterValues) => void;
    onApply: () => void;
    amenityOptions: { value: string; label: string }[];
    eventTypeOptions: { value: string; label: string }[];
    statusOptions: { value: string; label: string }[];
}

export function RentedItemFilterTrigger({ onClick }: { onClick: () => void }) {
    return (
        <Button
            type="button"
            variant="outline"
            className="h-10 border-gray-200 bg-white text-gray-700"
            onClick={onClick}
        >
            <ListFilter className="mr-2 h-4 w-4" />
            Filters
        </Button>
    );
}

export function RentedItemFilterDialog({
    open,
    onOpenChange,
    values,
    onChange,
    onApply,
    amenityOptions,
    eventTypeOptions,
    statusOptions,
}: RentedItemFilterDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md gap-0 p-0">
                <DialogHeader className="space-y-1 border-b px-6 py-4 text-left">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <DialogTitle className="text-lg font-semibold">
                                All Filter
                            </DialogTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Enter the following option to filter
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </DialogHeader>
                <div className="space-y-5 px-6 py-5">
                    <SelectField
                        id="filterAmenity"
                        name="filterAmenity"
                        label="Select Amenity"
                        value={values.amenity}
                        onValueChange={(v) =>
                            onChange({ ...values, amenity: v })
                        }
                        options={amenityOptions}
                        placeholder="Select amenity"
                    />
                    <SelectField
                        id="filterEventType"
                        name="filterEventType"
                        label="Event Type"
                        value={values.eventType}
                        onValueChange={(v) =>
                            onChange({ ...values, eventType: v })
                        }
                        options={eventTypeOptions}
                        placeholder="Select event type"
                    />
                    <SelectField
                        id="filterStatus"
                        name="filterStatus"
                        label="Status"
                        value={values.status}
                        onValueChange={(v) =>
                            onChange({ ...values, status: v })
                        }
                        options={statusOptions}
                        placeholder="Select status"
                    />
                </div>
                <div className="flex justify-end gap-3 border-t px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <BrandButton
                        type="button"
                        onClick={() => {
                            onApply();
                            onOpenChange(false);
                        }}
                    >
                        Apply Filter
                    </BrandButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
