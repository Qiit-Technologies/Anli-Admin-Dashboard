'use client';

import { formatMoney, lineTotal } from '@/components/banquest/utils/banquet-pricing';
import SearchInput from '@/components/common/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import QtyStepper from './QtyStepper';

export interface SelectionRow {
    id: number;
    name: string;
    description?: string;
    category?: string;
    unitPrice: number;
    quantity: number;
    maxQuantity?: number;
    imageUrl?: string;
}

interface SelectionLineTableProps {
    rows: SelectionRow[];
    selectedIds: Set<number>;
    onToggle: (id: number, checked: boolean) => void;
    onQuantityChange: (id: number, quantity: number) => void;
    search: string;
    onSearchChange: (value: string) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export default function SelectionLineTable({
    rows,
    selectedIds,
    onToggle,
    onQuantityChange,
    search,
    onSearchChange,
    isLoading,
    emptyMessage = 'No items found.',
    page,
    pageSize,
    onPageChange,
}: SelectionLineTableProps) {
    const filtered = rows.filter((r) =>
        r.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageRows = filtered.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    return (
        <div className="flex flex-col gap-4">
            <SearchInput
                placeholder="Search items"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-white"
            />
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-muted-foreground">
                        <tr>
                            <th className="w-10 p-3" />
                            <th className="w-14 p-3">Image</th>
                            <th className="p-3">Item</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Unit price</th>
                            <th className="p-3">Qty</th>
                            <th className="p-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="p-8 text-center text-muted-foreground"
                                >
                                    <LoaderCircle className="mx-auto h-6 w-6 animate-spin" />
                                </td>
                            </tr>
                        ) : pageRows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="p-8 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            pageRows.map((row) => {
                                const selected = selectedIds.has(row.id);
                                const qty = selected ? row.quantity : 0;
                                return (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            'border-b last:border-0',
                                            selected && 'bg-hexbrand/5',
                                        )}
                                    >
                                        <td className="p-3">
                                            <Checkbox
                                                checked={selected}
                                                onCheckedChange={(c) =>
                                                    onToggle(row.id, !!c)
                                                }
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="relative h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                                                {row.imageUrl ? (
                                                    <Image
                                                        src={row.imageUrl}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center text-lg">
                                                        🍽️
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <p className="font-medium text-gray-900">
                                                {row.name}
                                            </p>
                                            {row.description ? (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {row.description}
                                                </p>
                                            ) : null}
                                        </td>
                                        <td className="p-3">
                                            {row.category ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="font-normal"
                                                >
                                                    {row.category}
                                                </Badge>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="p-3 whitespace-nowrap">
                                            {formatMoney(row.unitPrice)}
                                        </td>
                                        <td className="p-3">
                                            {selected ? (
                                                <QtyStepper
                                                    value={qty}
                                                    min={1}
                                                    max={row.maxQuantity}
                                                    onChange={(n) =>
                                                        onQuantityChange(
                                                            row.id,
                                                            n,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            {selected
                                                ? formatMoney(
                                                      lineTotal(
                                                          row.unitPrice,
                                                          qty,
                                                      ),
                                                  )
                                                : '—'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between text-sm">
                <button
                    type="button"
                    className="text-orion-blue disabled:text-gray-300"
                    disabled={safePage <= 1}
                    onClick={() => onPageChange(safePage - 1)}
                >
                    Previous
                </button>
                <span className="text-muted-foreground">
                    Page {safePage} of {totalPages}
                </span>
                <button
                    type="button"
                    className="text-orion-blue disabled:text-gray-300"
                    disabled={safePage >= totalPages}
                    onClick={() => onPageChange(safePage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
