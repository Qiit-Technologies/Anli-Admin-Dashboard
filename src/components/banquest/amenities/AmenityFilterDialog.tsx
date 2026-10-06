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

export interface AmenityFilterValues {
    amenity: string;
    category: string;
    condition: string;
}

interface AmenityFilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    values: AmenityFilterValues;
    onChange: (values: AmenityFilterValues) => void;
    onApply: () => void;
    amenityOptions: { value: string; label: string }[];
    categoryOptions: { value: string; label: string }[];
    conditionOptions: { value: string; label: string }[];
}

export function AmenityFilterTrigger({ onClick }: { onClick: () => void }) {
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

export function AmenityFilterDialog({
    open,
    onOpenChange,
    values,
    onChange,
    onApply,
    amenityOptions,
    categoryOptions,
    conditionOptions,
}: AmenityFilterDialogProps) {
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
                        placeholder="Enter amenity name"
                    />
                    <SelectField
                        id="filterCategory"
                        name="filterCategory"
                        label="Select Category"
                        value={values.category}
                        onValueChange={(v) =>
                            onChange({ ...values, category: v })
                        }
                        options={categoryOptions}
                        placeholder="Select category"
                    />
                    <SelectField
                        id="filterCondition"
                        name="filterCondition"
                        label="Select Condition"
                        value={values.condition}
                        onValueChange={(v) =>
                            onChange({ ...values, condition: v })
                        }
                        options={conditionOptions}
                        placeholder="Select condition"
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
