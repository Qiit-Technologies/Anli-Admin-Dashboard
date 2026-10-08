'use client';

import { getMenuItems } from '@/app/actions/menu-item';
import { formatMoney, lineTotal } from '@/components/banquest/utils/banquet-pricing';
import SearchInput from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
import OrangeCheckbox from '@/components/banquest/shared/OrangeCheckbox';
import MenuItemFilterDialog, {
    MenuItemFilterValues,
} from './MenuItemFilterDialog';
import { cn } from '@/lib/utils';
import { ListFilter, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import MenuCategoryBadge from './menu-category-badge';
import QtyStepper from '../../booking-wizard/QtyStepper';
import { MenuCatalogItem, SEED_MENU_CATALOG } from './menu-catalog';

export type MenuItemsTableMode = 'select' | 'configure';

interface MenuItemsTableProps {
    mode: MenuItemsTableMode;
    selectedIds: number[];
    quantities?: Record<number, number>;
    onToggleItem?: (id: number, selected: boolean) => void;
    onQuantityChange?: (id: number, qty: number) => void;
    /** When set, only these menu item ids are shown (e.g. package detail). */
    restrictToIds?: number[];
    /** Used when API catalog is empty but package items are known. */
    fallbackItems?: MenuCatalogItem[];
    className?: string;
}

function mapApiItems(raw: unknown[]): MenuCatalogItem[] {
    return (raw as {
        id: number;
        name: string;
        description?: string;
        price?: number;
        category?: { name?: string };
        imageUrl?: string;
    }[]).map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description ?? '',
            category: item.category?.name ?? 'General',
            type: 'Food',
            unit: 'Per person',
            unitPrice: Number(item.price) || 0,
            imageUrl: item.imageUrl,
        }),
    );
}

export default function MenuItemsTable({
    mode,
    selectedIds,
    quantities = {},
    onToggleItem,
    onQuantityChange,
    restrictToIds,
    fallbackItems,
    className,
}: MenuItemsTableProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<MenuItemFilterValues>({
        action: 'all',
        category: 'all',
    });
    const [appliedFilters, setAppliedFilters] = useState<MenuItemFilterValues>({
        action: 'all',
        category: 'all',
    });

    const { data: itemsResult, isLoading } = useSWR(
        '/menu/items/package-wizard',
        getMenuItems,
    );

    const catalog = useMemo(() => {
        const raw = itemsResult?.data;
        if (Array.isArray(raw) && raw.length > 0) {
            return mapApiItems(raw);
        }
        if (fallbackItems?.length) {
            return fallbackItems;
        }
        if (restrictToIds?.length) {
            return [];
        }
        return SEED_MENU_CATALOG;
    }, [itemsResult, restrictToIds, fallbackItems]);

    const restrictSet = useMemo(
        () => (restrictToIds?.length ? new Set(restrictToIds) : null),
        [restrictToIds],
    );

    const filtered = catalog.filter((row) => {
        if (restrictSet && !restrictSet.has(row.id)) {
            return false;
        }
        if (
            !row.name.toLowerCase().includes(search.trim().toLowerCase())
        ) {
            return false;
        }
        if (
            appliedFilters.action !== 'all' &&
            row.type.toLowerCase() !== appliedFilters.action
        ) {
            return false;
        }
        if (
            appliedFilters.category !== 'all' &&
            !row.category.toLowerCase().includes(appliedFilters.category)
        ) {
            return false;
        }
        return true;
    });

    const pageSize = mode === 'select' ? 7 : 8;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    const selectedSet = new Set(selectedIds);

    const headers =
        mode === 'select'
            ? ['', 'Menu Item', 'Category', 'Type', 'Unit', 'Default Price']
            : ['', 'Menu Item', 'Category', 'Unit Price', 'Quantity', 'Total Price'];

    return (
        <div className={cn('flex flex-col', className)}>
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Search menu item"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="h-11 w-full bg-white"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 min-w-[120px] shrink-0 border-gray-200"
                    onClick={() => setFilterOpen(true)}
                >
                    <ListFilter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                <div className="max-h-[420px] overflow-x-auto overflow-y-auto">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="sticky top-0 z-10 border-b bg-gray-50 text-xs font-medium text-muted-foreground">
                            <tr>
                                {headers.map((h) => (
                                    <th
                                        key={h || 'check'}
                                        className={cn(
                                            'p-3 text-left',
                                            !h && 'w-10',
                                        )}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-8 text-center text-muted-foreground"
                                    >
                                        <LoaderCircle className="mx-auto h-5 w-5 animate-spin" />
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-8 text-center text-muted-foreground"
                                    >
                                        No menu items found.
                                    </td>
                                </tr>
                            ) : (
                                paged.map((row) => {
                                    const selected = selectedSet.has(row.id);
                                    const qty = quantities[row.id] ?? 1;
                                    const total = lineTotal(row.unitPrice, qty);

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
                                                        onToggleItem?.(
                                                            row.id,
                                                            !!c,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                                                        {row.imageUrl ? (
                                                            <Image
                                                                src={
                                                                    row.imageUrl
                                                                }
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
                                                        <p className="font-medium text-gray-900">
                                                            {row.name}
                                                        </p>
                                                        {mode ===
                                                            'configure' && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {row.description ||
                                                                    'Party style rice'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <MenuCategoryBadge
                                                    category={row.category}
                                                />
                                            </td>
                                            {mode === 'select' ? (
                                                <>
                                                    <td className="p-3 text-gray-700">
                                                        {row.type}
                                                    </td>
                                                    <td className="p-3 text-gray-700">
                                                        {row.unit}
                                                    </td>
                                                    <td className="p-3 font-medium text-gray-900">
                                                        {formatMoney(
                                                            row.unitPrice,
                                                        )}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-3">
                                                        <div>
                                                            <p className="font-medium text-gray-700">
                                                                {formatMoney(
                                                                    row.unitPrice,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Per head
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {selected ? (
                                                            <QtyStepper
                                                                value={qty}
                                                                min={1}
                                                                onChange={(
                                                                    n,
                                                                ) =>
                                                                    onQuantityChange?.(
                                                                        row.id,
                                                                        n,
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 font-medium text-gray-700">
                                                        {selected
                                                            ? formatMoney(
                                                                  total,
                                                              )
                                                            : '—'}
                                                    </td>
                                                </>
                                            )}
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

            <MenuItemFilterDialog
                open={filterOpen}
                onOpenChange={setFilterOpen}
                values={draftFilters}
                onChange={setDraftFilters}
                onApply={() => {
                    setAppliedFilters(draftFilters);
                    setPage(1);
                }}
            />
        </div>
    );
}
