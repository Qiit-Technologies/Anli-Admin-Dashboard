'use client';

import BrandButton from '@/components/common/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface MenuItemFilterValues {
    action: string;
    category: string;
}

const ACTION_OPTIONS = ['Food', 'Drinks'];
const CATEGORY_OPTIONS = [
    'Wedding',
    'Corporate',
    'Social',
    'Local',
    'Main Course',
    'Dessert',
];

interface MenuItemFilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    values: MenuItemFilterValues;
    onChange: (values: MenuItemFilterValues) => void;
    onApply: () => void;
}

export default function MenuItemFilterDialog({
    open,
    onOpenChange,
    values,
    onChange,
    onApply,
}: MenuItemFilterDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg gap-0 p-0">
                <DialogHeader className="border-b px-6 py-4 text-left">
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
                <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground">
                            Actions
                        </p>
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                            {ACTION_OPTIONS.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        onChange({
                                            ...values,
                                            action: item.toLowerCase(),
                                        })
                                    }
                                    className={cn(
                                        'block w-full px-4 py-3 text-left text-sm font-medium',
                                        values.action === item.toLowerCase()
                                            ? 'bg-sky-50 text-gray-900'
                                            : 'text-gray-900 hover:bg-gray-50',
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-xs text-muted-foreground">
                            Category
                        </p>
                        <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                            {CATEGORY_OPTIONS.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        onChange({
                                            ...values,
                                            category: item.toLowerCase(),
                                        })
                                    }
                                    className={cn(
                                        'block w-full px-4 py-3 text-left text-sm font-medium',
                                        values.category ===
                                            item.toLowerCase()
                                            ? 'bg-sky-50 text-gray-900'
                                            : 'text-gray-900 hover:bg-gray-50',
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border-t px-6 py-4">
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
