'use client';

import { getBanquetInventory } from '@/app/actions/banquet-inventory';
import SearchInput from '@/components/common/SearchInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Amenities, Food } from '../types';
import { calculateBanquetPricing, formatMoney } from '../utils/banquet-pricing';
import { inventoryToBookingAmenities } from '../utils/inventory-mapper';

interface AmenitiesSearchProps {
    value: Amenities[];
    onChange: (amenities: Amenities[]) => void;
    food?: Food[];
    discount: number;
    tax: number;
    onDiscountChange: (discount: number) => void;
    onTaxChange: (tax: number) => void;
}

const AmenitiesSearch = ({
    value,
    onChange,
    food = [],
    discount,
    tax,
    onDiscountChange,
    onTaxChange,
}: AmenitiesSearchProps) => {
    const [search, setSearch] = useState('');

    const { data: inventoryResult, isLoading } = useSWR(
        '/banquet/inventory',
        getBanquetInventory,
    );

    const loadError =
        inventoryResult && 'error' in inventoryResult && inventoryResult.error;

    const catalog = useMemo(() => {
        if (!inventoryResult?.data) return [];
        return inventoryToBookingAmenities(inventoryResult.data);
    }, [inventoryResult]);

    const selectedById = useMemo(() => {
        const map = new Map<number, Amenities>();
        value.forEach((a) => map.set(a.id, a));
        return map;
    }, [value]);

    const pricing = useMemo(
        () => calculateBanquetPricing(value, food, discount, tax),
        [value, food, discount, tax],
    );

    const filteredCatalog = catalog.filter((item) =>
        item.name.toLowerCase().includes(search.trim().toLowerCase()),
    );

    const updateSelection = (amenity: Amenities, checked: boolean) => {
        if (checked) {
            const maxQty = Number(amenity.available) || 0;
            const existing = selectedById.get(amenity.id);
            const qty = existing?.quantity || (maxQty > 0 ? '1' : '0');
            onChange([
                ...value.filter((a) => a.id !== amenity.id),
                {
                    ...amenity,
                    quantity: String(
                        Math.min(Number(qty) || 1, maxQty || Number(qty) || 1),
                    ),
                },
            ]);
        } else {
            onChange(value.filter((a) => a.id !== amenity.id));
        }
    };

    const updateQuantity = (id: number, quantity: string) => {
        onChange(
            value.map((a) => {
                if (a.id !== id) return a;
                const max = Number(a.available) || 0;
                const qty = Math.min(Math.max(0, Number(quantity) || 0), max);
                return { ...a, quantity: String(qty) };
            }),
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Loading amenities from inventory…
            </div>
        );
    }

    if (loadError) {
        return (
            <p className="text-sm text-destructive">
                Could not load amenities. {String(loadError)}
            </p>
        );
    }

    if (catalog.length === 0) {
        return (
            <div className="rounded-lg border bg-muted/40 p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                    No amenities in inventory yet. Add items on the Amenities
                    page — they will appear here for booking.
                </p>
                <Link
                    href="/banquet/amenities"
                    className="text-sm font-medium text-orion-blue hover:underline"
                >
                    Go to Amenities
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
                Items are loaded from{' '}
                <Link
                    href="/banquet/amenities"
                    className="text-orion-blue hover:underline"
                >
                    Banquet → Amenities
                </Link>
                . Quantity cannot exceed stock remaining.
            </p>

            <SearchInput
                placeholder="Search inventory amenities"
                value={search}
                className="w-full bg-white"
                onChange={(e) => setSearch(e.target.value)}
            />

            <ul className="flex flex-col gap-3 rounded-lg border bg-gray-50 p-4 max-h-[360px] overflow-y-auto">
                {filteredCatalog.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                        No match for your search.
                    </li>
                ) : (
                    filteredCatalog.map((amenity) => {
                        const selected = selectedById.has(amenity.id);
                        const line = selectedById.get(amenity.id);
                        const qty = line?.quantity ?? '1';
                        const max = Number(amenity.available) || 0;
                        const outOfStock = max <= 0;

                        return (
                            <li
                                key={amenity.id}
                                className="flex items-center justify-between gap-3"
                            >
                                <div className="flex items-start gap-2 min-w-0">
                                    <Checkbox
                                        checked={selected}
                                        disabled={outOfStock}
                                        onCheckedChange={(checked) =>
                                            updateSelection(
                                                amenity,
                                                checked === true,
                                            )
                                        }
                                        className="mt-1 bg-white"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium">
                                            {amenity.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {outOfStock
                                                ? 'Out of stock'
                                                : `${max} available · ${formatMoney(Number(amenity.cost))} each`}
                                        </span>
                                    </div>
                                </div>
                                {selected && !outOfStock ? (
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <Input
                                            type="number"
                                            className="w-16 h-8"
                                            min={1}
                                            max={max}
                                            value={qty}
                                            onChange={(e) =>
                                                updateQuantity(
                                                    amenity.id,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <span className="text-xs font-medium">
                                            {formatMoney(
                                                Number(amenity.cost) *
                                                    (Number(qty) || 0),
                                            )}
                                        </span>
                                    </div>
                                ) : null}
                            </li>
                        );
                    })
                )}
            </ul>

            {value.length > 0 ? (
                <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
                    <p className="text-sm font-semibold">
                        Selected for booking
                    </p>
                    {value.map((a) => (
                        <div
                            key={a.id}
                            className="flex justify-between text-sm"
                        >
                            <span>
                                {a.name} × {a.quantity}
                            </span>
                            <span>
                                {formatMoney(
                                    Number(a.cost) * (Number(a.quantity) || 0),
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}

            <div className="rounded-lg border p-4 space-y-4 bg-gray-50">
                <p className="text-sm font-semibold">Pricing summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Amenities</span>
                    <span className="text-right">
                        {formatMoney(pricing.amenitiesSubtotal)}
                    </span>
                    <span className="text-muted-foreground">Food / menu</span>
                    <span className="text-right">
                        {formatMoney(pricing.foodSubtotal)}
                    </span>
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-right font-medium">
                        {formatMoney(pricing.subtotal)}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs">Discount</Label>
                        <Input
                            type="number"
                            min={0}
                            value={discount || ''}
                            onChange={(e) =>
                                onDiscountChange(Number(e.target.value) || 0)
                            }
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Tax / other charges</Label>
                        <Input
                            type="number"
                            min={0}
                            value={tax || ''}
                            onChange={(e) =>
                                onTaxChange(Number(e.target.value) || 0)
                            }
                        />
                    </div>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span>{formatMoney(pricing.total)}</span>
                </div>
            </div>
        </div>
    );
};

export default AmenitiesSearch;
