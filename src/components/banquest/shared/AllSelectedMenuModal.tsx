'use client';

import OrangeCheckbox from '@/components/banquest/shared/OrangeCheckbox';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

export interface MenuModalRow {
    id: number;
    name: string;
    description: string;
    category: string;
    unitPrice: number;
    quantity: number;
    imageUrl?: string;
}

interface AllSelectedMenuModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rows: MenuModalRow[];
    categoryBadgeClass: (category: string) => string;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function AllSelectedMenuModal({
    open,
    onOpenChange,
    rows,
    categoryBadgeClass,
    page,
    totalPages,
    onPageChange,
}: AllSelectedMenuModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl gap-0 p-0">
                <DialogHeader className="space-y-1 border-b px-6 py-4 text-left">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-orion-blue hover:underline"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </button>
                    <DialogTitle className="text-lg font-semibold">
                        All Selected Menu Summary
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Showing all the food menu selected for this event
                    </p>
                </DialogHeader>

                <div className="overflow-x-auto px-6 py-4">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="border-b text-xs font-medium text-muted-foreground">
                            <tr>
                                <th className="w-10 pb-3" />
                                <th className="pb-3 text-left">Menu Item</th>
                                <th className="pb-3 text-left">Category</th>
                                <th className="pb-3 text-left">Unit Prize</th>
                                <th className="pb-3 text-left">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="py-3">
                                        <OrangeCheckbox checked disabled />
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                                                {row.imageUrl ? (
                                                    <Image
                                                        src={row.imageUrl}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center text-xs">
                                                        🍽️
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {row.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {row.description ||
                                                        'Party style rice'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                'font-medium',
                                                categoryBadgeClass(
                                                    row.category,
                                                ),
                                            )}
                                        >
                                            {row.category}
                                        </Badge>
                                    </td>
                                    <td className="py-3">
                                        <p className="font-semibold text-gray-900">
                                            {formatMoney(row.unitPrice)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Per head
                                        </p>
                                    </td>
                                    <td className="py-3 font-medium text-gray-900">
                                        {row.quantity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t px-6 py-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
