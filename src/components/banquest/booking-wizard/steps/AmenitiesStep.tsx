'use client';

import { getBanquetInventory } from '@/app/actions/banquet-inventory';
import { Amenities } from '@/components/banquest/types';
import {
    calculateBanquetPricing,
    formatMoney,
    lineTotal,
} from '@/components/banquest/utils/banquet-pricing';
import { inventoryToBookingAmenities } from '@/components/banquest/utils/inventory-mapper';
import SearchInput from '@/components/common/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OrangeCheckbox from '@/components/banquest/shared/OrangeCheckbox';
import SelectedItemsPanel from '@/components/banquest/shared/SelectedItemsPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ListFilter, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import CategoryPillFilters from '../CategoryPillFilters';
import { AMENITY_CATEGORY_PILLS } from '../constants';
import QtyStepper from '../QtyStepper';
import SectionHeader from '../SectionHeader';
import { BanquetWizardState } from '../types';

interface AmenitiesStepProps {
    state: BanquetWizardState;
    onChange: <K extends keyof BanquetWizardState>(
        _field: K,
        _value: BanquetWizardState[K],
    ) => void;
}

interface AmenityCatalogRow {
    id: number;
    name: string;
    description: string;
    category: string;
    unitPrice: number;
    quantity: number;
    maxQuantity?: number;
}

function inferCategory(type: string): string {
    const t = type.toLowerCase();
    if (t.includes('chair') || t.includes('table')) return 'Furniture';
    if (t.includes('decor') || t.includes('flower')) return 'Decoration';
    if (t.includes('audio') || t.includes('mic')) return 'Audio & virtual';
    if (t.includes('service') || t.includes('staff')) return 'Service';
    return 'Others';
}

function matchesPill(type: string, pillId: string): boolean {
    if (pillId === 'all') return true;
    const cat = inferCategory(type).toLowerCase();
    const map: Record<string, string> = {
        decoration: 'decoration',
        furniture: 'furniture',
        service: 'service',
        others: 'others',
        audio: 'audio',
    };
    return cat.toLowerCase().includes(map[pillId] ?? pillId);
}

const categoryBadgeClass = (category: string): string => {
    const key = category.toLowerCase();
    if (key.includes('furniture')) return 'bg-indigo-100 text-indigo-700';
    if (key.includes('decoration')) return 'bg-emerald-100 text-emerald-700';
    if (key.includes('service')) return 'bg-amber-100 text-amber-700';
    if (key.includes('audio')) return 'bg-fuchsia-100 text-fuchsia-700';
    return 'bg-slate-100 text-slate-700';
};

export default function AmenitiesStep({
    state,
    onChange,
}: Readonly<AmenitiesStepProps>) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data: inventoryResult, isLoading } = useSWR(
        '/banquet/inventory',
        getBanquetInventory,
    );

    const catalog = useMemo(() => {
        if (!inventoryResult?.data) return [];
        return inventoryToBookingAmenities(inventoryResult.data);
    }, [inventoryResult]);

    const catalogRows: AmenityCatalogRow[] = useMemo(
        () =>
            catalog
                .filter((a) => matchesPill(a.name, state.amenityCategoryFilter))
                .map((a) => ({
                    id: a.id,
                    name: a.name,
                    description: `Available: ${a.available}`,
                    category: inferCategory(a.name),
                    unitPrice: Number(a.cost) || 0,
                    quantity: Number(a.quantity) || 0,
                    maxQuantity: Number(a.available) || undefined,
                })),
        [catalog, state.amenityCategoryFilter],
    );

    const selected = state.amenities ?? [];
    const selectedIds = new Set(
        selected.filter((a) => Number(a.quantity) > 0).map((a) => a.id),
    );

    const filteredCatalog = catalogRows.filter((row) =>
        row.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

    const pageSize = 7;
    const totalPages = Math.max(
        1,
        Math.ceil(filteredCatalog.length / pageSize),
    );
    const safePage = Math.min(page, totalPages);
    const pagedCatalog = filteredCatalog.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    const displayRows = pagedCatalog.map((row) => {
        const sel = selected.find((a) => a.id === row.id);
        return { ...row, quantity: sel ? Number(sel.quantity) : 0 };
    });

    const syncAmenity = (id: number, patch: Partial<Amenities>) => {
        const base = catalog.find((a) => a.id === id);
        if (!base) return;
        const existing = selected.find((a) => a.id === id);
        const max = Number(base.available) || 0;
        let qty = Number(patch.quantity ?? existing?.quantity ?? 1);
        if (max > 0) qty = Math.min(qty, max);
        const next: Amenities = {
            ...base,
            ...existing,
            ...patch,
            quantity: String(qty > 0 ? qty : 0),
        };
        onChange('amenities', [
            ...selected.filter((a) => a.id !== id),
            ...(Number(next.quantity) > 0 ? [next] : []),
        ]);
    };

    const pricing = calculateBanquetPricing(
        selected.filter((a) => Number(a.quantity) > 0),
        [],
        state.discount,
        {
            serviceChargePercent: state.serviceChargePercent,
            vatPercent: state.vatPercent,
        },
    );

    const lineItems = selected
        .filter((a) => Number(a.quantity) > 0)
        .map((a) => ({
            name: a.name,
            detail: `${a.quantity} × ${formatMoney(Number(a.cost))}`,
            amount: lineTotal(a.cost, a.quantity),
        }));
    const selectedCount = lineItems.length;
    const summaryItems = lineItems.map((item, index) => ({
        key: `${item.name}-${index}`,
        name: item.name,
        calcDetail: item.detail,
        amount: item.amount,
    }));

    const loadError =
        inventoryResult && 'error' in inventoryResult && inventoryResult.error;

    const tableRows = (() => {
        if (isLoading) {
            return (
                <tr>
                    <td
                        colSpan={6}
                        className="p-8 text-center text-muted-foreground"
                    >
                        <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                </tr>
            );
        }

        if (displayRows.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={6}
                        className="p-8 text-center text-muted-foreground"
                    >
                        No amenities in inventory.
                    </td>
                </tr>
            );
        }

        return displayRows.map((row) => {
            const selectedRow = selectedIds.has(row.id);
            const quantity = selectedRow ? row.quantity : 0;
            const rowTotal = lineTotal(row.unitPrice, quantity);

            return (
                <tr
                    key={row.id}
                    className={cn(
                        'border-b last:border-0',
                        selectedRow && 'bg-orange-50/40',
                    )}
                >
                    <td className="p-3">
                        <OrangeCheckbox
                            checked={selectedRow}
                            onCheckedChange={(c) =>
                                syncAmenity(row.id, { quantity: c ? '1' : '0' })
                            }
                        />
                    </td>
                    <td className="p-3">
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                                <span className="flex h-full w-full items-center justify-center text-xs">
                                    🪑
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {row.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {row.description}
                                </p>
                            </div>
                        </div>
                    </td>
                    <td className="p-3">
                        <Badge
                            variant="secondary"
                            className={cn(
                                'font-medium',
                                categoryBadgeClass(row.category),
                            )}
                        >
                            {row.category}
                        </Badge>
                    </td>
                    <td className="p-3">
                        <div>
                            <p className="font-medium text-gray-700">
                                {formatMoney(row.unitPrice)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Per unit
                            </p>
                        </div>
                    </td>
                    <td className="p-3">
                        {selectedRow ? (
                            <QtyStepper
                                value={quantity}
                                min={1}
                                max={row.maxQuantity}
                                onChange={(qty) =>
                                    syncAmenity(row.id, {
                                        quantity: String(qty),
                                    })
                                }
                            />
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )}
                    </td>
                    <td className="p-3 font-medium text-gray-700">
                        {selectedRow ? formatMoney(rowTotal) : '—'}
                    </td>
                </tr>
            );
        });
    })();

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
                <SectionHeader
                    title="Amenities Configuration"
                    subtitle="Select and configure amenities from your inventory"
                />
                <div className="mt-4" />
                <CategoryPillFilters
                    pills={AMENITY_CATEGORY_PILLS}
                    value={state.amenityCategoryFilter}
                    onChange={(v) => onChange('amenityCategoryFilter', v)}
                />
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                        <SearchInput
                            placeholder="Search amenities"
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
                        className="h-11 min-w-[120px] border-gray-200"
                    >
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>
                {loadError ? (
                    <p className="mt-4 text-sm text-destructive">
                        {inventoryResult.error}.{' '}
                        <Link
                            href="/banquet/amenities"
                            className="text-orion-blue underline"
                        >
                            Add amenities in inventory
                        </Link>
                    </p>
                ) : (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="border-b bg-gray-50 text-xs font-medium text-muted-foreground">
                                    <tr>
                                        <th className="w-10 p-3" />
                                        <th className="p-3 text-left">
                                            Amenity item
                                        </th>
                                        <th className="p-3 text-left">
                                            Category
                                        </th>
                                        <th className="p-3 text-left">
                                            Unit Prize
                                        </th>
                                        <th className="p-3 text-left">
                                            Quantity
                                        </th>
                                        <th className="p-3 text-left">
                                            Total Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{tableRows}</tbody>
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
                )}
                <button
                    type="button"
                    className="mt-4 w-fit text-sm font-medium text-orion-blue hover:underline"
                >
                    + Add custom amenities
                </button>
                <div className="mt-5 space-y-2">
                    <h4 className="text-xl font-semibold text-gray-900">
                        Special Instruction or note/ Optional
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Add a short description or note about amenities and
                        setup.
                    </p>
                    <Label htmlFor="amenityInstructions" className="sr-only">
                        Special instructions
                    </Label>
                    <Textarea
                        id="amenityInstructions"
                        rows={4}
                        placeholder="eg Extra decor setup by 8am"
                        value={state.amenitiesSpecialInstructions}
                        onChange={(e) =>
                            onChange(
                                'amenitiesSpecialInstructions',
                                e.target.value,
                            )
                        }
                    />
                </div>
            </div>
            <SelectedItemsPanel
                title="Selected item cost Summary"
                meta={[
                    {
                        label: 'Items Selected',
                        value: String(selectedCount),
                    },
                    {
                        label: 'Guest Count',
                        value: state.estimatedGuestCount
                            ? `${state.estimatedGuestCount} Guest`
                            : '—',
                    },
                ]}
                items={summaryItems}
                selectedCount={selectedCount}
                subtotal={pricing.amenitiesSubtotal}
                serviceChargePercent={state.serviceChargePercent}
                serviceCharge={pricing.serviceCharge}
                vatPercent={state.vatPercent}
                vat={pricing.vat}
                total={pricing.total}
            />
        </div>
    );
}
