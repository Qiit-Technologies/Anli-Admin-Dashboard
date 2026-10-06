'use client';

import BrandButton from '@/components/common/Button';
import { SelectField } from '@/components/common/Form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ListFilter, X } from 'lucide-react';

export interface MenuPackageFilterValues {
    menuOption: string;
    category: string;
}

interface MenuPackageFilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    values: MenuPackageFilterValues;
    onChange: (values: MenuPackageFilterValues) => void;
    onApply: () => void;
    menuOptions: { value: string; label: string }[];
    categoryOptions: { value: string; label: string }[];
}

export function MenuPackageFilterDialog({
    open,
    onOpenChange,
    values,
    onChange,
    onApply,
    menuOptions,
    categoryOptions,
}: MenuPackageFilterDialogProps) {
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
                        id="filterMenuOption"
                        name="filterMenuOption"
                        label="Select Menu option"
                        value={values.menuOption}
                        onValueChange={(v) =>
                            onChange({ ...values, menuOption: v })
                        }
                        options={menuOptions}
                        placeholder="Enter menu option"
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
                        placeholder="Enter Category"
                    />
                    <BrandButton
                        type="button"
                        className="w-full"
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

export function MenuPackageFilterTrigger({
    onClick,
}: {
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            className="h-10 border-gray-200"
            onClick={onClick}
        >
            <ListFilter className="mr-2 h-4 w-4" />
            Filters
        </Button>
    );
}
