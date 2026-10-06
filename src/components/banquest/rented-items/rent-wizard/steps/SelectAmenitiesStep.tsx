'use client';

import { getBanquetInventory } from '@/app/actions/banquet-inventory';
import AmenityThumbnail from '@/components/banquest/amenities/AmenityThumbnail';
import QtyStepper from '@/components/banquest/booking-wizard/QtyStepper';
import OrangeCheckbox from '@/components/banquest/shared/OrangeCheckbox';
import SelectionDot from '@/components/banquest/shared/SelectionDot';
import { inventoryToRentSelection } from '@/components/banquest/rented-items/utils/inventory-to-rent-selection';
import {
    RentAmenitySelection,
    RentWizardState,
} from '@/components/banquest/rented-items/rent-wizard/types';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import SearchInput from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ListFilter, LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

const conditionStyles = {
    excellent: 'bg-emerald-50 text-emerald-700',
    good: 'bg-orange-50 text-orange-700',
};

interface Props {
    state: RentWizardState;
    onChange: (patch: Partial<RentWizardState>) => void;
}

export default function SelectAmenitiesStep({ state, onChange }: Props) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data: inventoryResponse, isLoading } = useSWR(
        '/banquet/inventory/rent-wizard',
        getBanquetInventory,
    );

    const catalog = useMemo(() => {
        if (!inventoryResponse?.data || 'error' in inventoryResponse) {
            return [];
        }
        return inventoryResponse.data
            .filter((item) => item.remaining > 0)
            .map(inventoryToRentSelection);
    }, [inventoryResponse]);

    const selectedIds = new Set(
        state.selections.filter((s) => s.quantity > 0).map((s) => s.id),
    );

    const filtered = useMemo(
        () =>
            catalog.filter((row) =>
                row.name.toLowerCase().includes(search.trim().toLowerCase()),
            ),
        [catalog, search],
    );

    const pageSize = 7;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    const syncSelection = (row: RentAmenitySelection, qty: number) => {
        const next = state.selections.filter((s) => s.id !== row.id);
        if (qty > 0) {
            next.push({ ...row, quantity: qty });
        }
        onChange({ selections: next });
    };

    const getQty = (id: string) =>
        state.selections.find((s) => s.id === id)?.quantity ?? 0;

    const selectedForSidebar = state.selections.filter((s) => s.quantity > 0);

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Select Amenity
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Select and Choose the amenity suitable for your event
                </p>

                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                        <SearchInput
                            placeholder="Search amenity"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-11 bg-white"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 border-gray-200"
                    >
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm">
                            <thead className="border-b bg-gray-50 text-xs font-medium text-muted-foreground">
                                <tr>
                                    <th className="w-10 p-3" />
                                    <th className="p-3 text-left">Menu Item</th>
                                    <th className="p-3 text-left">Condition</th>
                                    <th className="p-3 text-left">
                                        Unit Available
                                    </th>
                                    <th className="p-3 text-left">
                                        Unit Price
                                    </th>
                                    <th className="p-3 text-left">Quantity</th>
                                    <th className="p-3 text-left">
                                        Total Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
                                        </td>
                                    </tr>
                                ) : paged.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            No available amenities found.
                                        </td>
                                    </tr>
                                ) : (
                                    paged.map((row) => {
                                        const selected = selectedIds.has(
                                            row.id,
                                        );
                                        const qty = getQty(row.id);
                                        const rowTotal = row.unitPrice * qty;
                                        return (
                                            <tr
                                                key={row.id}
                                                className={cn(
                                                    'border-b last:border-0',
                                                    selected &&
                                                        'bg-orange-50/40',
                                                )}
                                            >
                                                <td className="p-3">
                                                    <OrangeCheckbox
                                                        checked={selected}
                                                        onCheckedChange={(c) =>
                                                            syncSelection(
                                                                row,
                                                                c ? 1 : 0,
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <AmenityThumbnail
                                                            src={row.imageUrl}
                                                            alt={row.name}
                                                        />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {row.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {row.subtitle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span
                                                        className={cn(
                                                            'inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize',
                                                            conditionStyles[
                                                                row.condition
                                                            ],
                                                        )}
                                                    >
                                                        {row.condition}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-700">
                                                    {row.unitAvailable}
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-medium text-gray-900">
                                                        {formatMoney(
                                                            row.unitPrice,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Per Item
                                                    </p>
                                                </td>
                                                <td className="p-3">
                                                    {selected ? (
                                                        <QtyStepper
                                                            value={qty}
                                                            min={1}
                                                            max={
                                                                row.unitAvailable
                                                            }
                                                            onChange={(v) =>
                                                                syncSelection(
                                                                    row,
                                                                    v,
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 font-medium text-gray-900">
                                                    {selected
                                                        ? formatMoney(rowTotal)
                                                        : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between border-t bg-white p-3 text-sm">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={safePage <= 1}
                            onClick={() => setPage(safePage - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-muted-foreground">
                            Page {safePage} of {totalPages}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={safePage >= totalPages}
                            onClick={() => setPage(safePage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold text-gray-900">
                    Selected Amenity for Rent
                </h3>
                {selectedForSidebar.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                        No amenities selected yet.
                    </p>
                ) : (
                    <ul className="mt-4 space-y-4">
                        {selectedForSidebar.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-start gap-2"
                            >
                                <SelectionDot />
                                <div>
                                    <p className="font-semibold text-emerald-700">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.subtitle}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.quantity} Item
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
        </div>
    );
}
