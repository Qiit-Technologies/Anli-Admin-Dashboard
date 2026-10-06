'use client';

import {
    getBanquetMenuPackage,
    getBanquetMenuPackages,
} from '@/app/actions/banquet-menu-package';
import { getMenuItems } from '@/app/actions/menu-item';
import { getMenus } from '@/app/actions/menu';
import { Food } from '@/components/banquest/types';
import Toast from '@/components/toast';
import {
    calculateBanquetPricing,
    formatMoney,
    lineTotal,
} from '@/components/banquest/utils/banquet-pricing';
import { SelectField } from '@/components/common/Form';
import SearchInput from '@/components/common/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AllSelectedMenuModal from '@/components/banquest/shared/AllSelectedMenuModal';
import OrangeCheckbox from '@/components/banquest/shared/OrangeCheckbox';
import SelectedItemsPanel from '@/components/banquest/shared/SelectedItemsPanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ListFilter, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import QtyStepper from '../QtyStepper';
import SectionHeader from '../SectionHeader';
import { BanquetWizardState } from '../types';

interface MenuStepProps {
    state: BanquetWizardState;
    onChange: <K extends keyof BanquetWizardState>(
        _field: K,
        _value: BanquetWizardState[K],
    ) => void;
}

interface MenuCatalogRow {
    id: number;
    name: string;
    description: string;
    category: string;
    unitPrice: number;
    quantity: number;
    imageUrl?: string;
}

const categoryBadgeClass = (category: string): string => {
    const key = category.toLowerCase();
    if (key.includes('main')) return 'bg-emerald-100 text-emerald-700';
    if (key.includes('drink')) return 'bg-indigo-100 text-indigo-700';
    if (key.includes('dessert')) return 'bg-fuchsia-100 text-fuchsia-700';
    if (key.includes('small')) return 'bg-amber-100 text-amber-700';
    if (key.includes('salad')) return 'bg-slate-100 text-slate-700';
    return 'bg-gray-100 text-gray-700';
};

export default function MenuStep({ state, onChange }: Readonly<MenuStepProps>) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalPage, setModalPage] = useState(1);

    const { data: menusResult } = useSWR('/menus', getMenus);
    const { data: packagesResult } = useSWR(
        '/banquet/menu-packages/booking',
        getBanquetMenuPackages,
    );
    const { data: itemsResult, isLoading } = useSWR(
        '/menu/items',
        getMenuItems,
    );

    const packageOptions = useMemo(() => {
        if (!packagesResult?.data || 'error' in packagesResult) return [];
        const raw = packagesResult.data;
        if (!Array.isArray(raw)) return [];
        return raw
            .filter((p) => p.status === 'active')
            .map((p) => ({
                value: String(p.id),
                label: p.name,
            }));
    }, [packagesResult]);

    const applyMenuPackage = useCallback(
        async (packageId: string) => {
            onChange('menuPackageId', packageId);
            if (!packageId) return;

            const id = Number(packageId);
            if (!Number.isFinite(id)) return;

            const result = await getBanquetMenuPackage(id);
            if (result.error || !result.data) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            result.error ?? 'Could not load menu package'
                        }
                        type="error"
                    />
                ));
                return;
            }

            const pkg = result.data;
            onChange('menuName', pkg.name);
            onChange('restaurantMenuName', pkg.name);
            onChange('menuType', state.menuType || '');
            onChange(
                'serviceChargePercent',
                Number(pkg.serviceChargePercent) || 10,
            );
            onChange('vatPercent', Number(pkg.vatPercent) || 7.5);
            if (pkg.guestMin) {
                onChange('estimatedGuestCount', String(pkg.guestMin));
            }
            if (pkg.description) {
                onChange('menuSpecialInstructions', pkg.description);
            }

            const food: Food[] = (pkg.items ?? []).map((item) => ({
                id: item.menuItemId,
                name: item.menuItemName,
                description: item.menuItemDescription ?? '',
                cost: String(item.unitPrice),
                quantity: String(item.quantity || 1),
            }));
            onChange('food', food);
            setPage(1);
        },
        [onChange, state.menuType],
    );

    const menuOptions = useMemo(() => {
        const menus = menusResult?.data;
        if (!Array.isArray(menus)) return [];
        return menus.map((m: { id: number; name: string }) => ({
            value: String(m.id),
            label: m.name,
        }));
    }, [menusResult]);

    const catalogRows: MenuCatalogRow[] = useMemo(() => {
        const raw = itemsResult?.data;
        if (!Array.isArray(raw)) return [];
        return raw.map(
            (item: {
                id: number;
                name: string;
                description?: string;
                price?: number;
                category?: { name?: string };
                imageUrl?: string;
            }) => ({
                id: item.id,
                name: item.name,
                description: item.description ?? '',
                category: item.category?.name ?? 'General',
                unitPrice: Number(item.price) || 0,
                quantity: 0,
                imageUrl: item.imageUrl,
            }),
        );
    }, [itemsResult]);

    const menuCategoryOptions = useMemo(() => {
        const categories = Array.from(
            new Set(catalogRows.map((r) => r.category)),
        );
        return [
            { value: 'all', label: 'All Menu' },
            ...categories.map((cat) => ({ value: cat, label: cat })),
        ];
    }, [catalogRows]);

    const selectedFood = state.food ?? [];
    const selectedIds = new Set(
        selectedFood.filter((f) => Number(f.quantity) > 0).map((f) => f.id),
    );

    const selectedCategory = state.cuisineType || 'all';

    const filteredCatalog = catalogRows
        .filter((row) =>
            selectedCategory === 'all'
                ? true
                : row.category === selectedCategory,
        )
        .filter((row) =>
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
        const sel = selectedFood.find((f) => f.id === row.id);
        return {
            ...row,
            quantity: sel ? Number(sel.quantity) : 0,
        };
    });

    const syncFood = (id: number, patch: Partial<Food>) => {
        const existing = selectedFood.find((f) => f.id === id);
        const row = catalogRows.find((r) => r.id === id);
        if (!row) return;
        const next: Food = {
            id,
            name: row.name,
            description: row.description ?? '',
            cost: String(row.unitPrice),
            quantity: patch.quantity ?? existing?.quantity ?? '1',
            ...existing,
            ...patch,
        };
        onChange('food', [
            ...selectedFood.filter((f) => f.id !== id),
            ...(Number(next.quantity) > 0 ? [next] : []),
        ]);
    };

    const pricing = calculateBanquetPricing(
        [],
        selectedFood.filter((f) => Number(f.quantity) > 0),
        state.discount,
        {
            serviceChargePercent: state.serviceChargePercent,
            vatPercent: state.vatPercent,
        },
    );

    const selectedCount = selectedFood.filter(
        (f) => Number(f.quantity) > 0,
    ).length;
    const lineItems = selectedFood
        .filter((f) => Number(f.quantity) > 0)
        .map((f) => ({
            name: f.name,
            detail: `${f.quantity} × ${formatMoney(Number(f.cost))}`,
            amount: lineTotal(f.cost, f.quantity),
        }));

    const perHead =
        Number(state.estimatedGuestCount) > 0
            ? pricing.foodSubtotal / Number(state.estimatedGuestCount)
            : 0;
    const summaryItems = lineItems.map((item, index) => ({
        key: `${item.name}-${index}`,
        name: item.name,
        calcDetail: item.detail,
        amount: item.amount,
    }));

    const selectedForModal = selectedFood
        .filter((f) => Number(f.quantity) > 0)
        .map((f) => {
            const row = catalogRows.find((r) => r.id === f.id);
            return {
                id: f.id,
                name: f.name,
                description: f.description ?? row?.description ?? '',
                category: row?.category ?? 'General',
                unitPrice: Number(f.cost),
                quantity: Number(f.quantity),
                imageUrl: row?.imageUrl,
            };
        });

    const modalPageSize = 7;
    const modalTotalPages = Math.max(
        1,
        Math.ceil(selectedForModal.length / modalPageSize),
    );
    const modalSafePage = Math.min(modalPage, modalTotalPages);
    const modalRows = selectedForModal.slice(
        (modalSafePage - 1) * modalPageSize,
        modalSafePage * modalPageSize,
    );
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
                        No menu items. Add items in menu management.
                    </td>
                </tr>
            );
        }

        return displayRows.map((row) => {
            const selected = selectedIds.has(row.id);
            const quantity = selected ? row.quantity : 0;
            const rowTotal = lineTotal(row.unitPrice, quantity);

            return (
                <tr
                    key={row.id}
                    className={cn(
                        'border-b last:border-0',
                        selected && 'bg-orange-50/40',
                    )}
                >
                    <td className="p-3">
                        <OrangeCheckbox
                            checked={selected}
                            onCheckedChange={(c) =>
                                syncFood(row.id, {
                                    quantity: c ? '1' : '0',
                                })
                            }
                        />
                    </td>
                    <td className="p-3">
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
                                <p className="font-medium text-gray-900">
                                    {row.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {row.description || 'Party style rice'}
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
                                Per head
                            </p>
                        </div>
                    </td>
                    <td className="p-3">
                        {selected ? (
                            <QtyStepper
                                value={quantity}
                                min={1}
                                onChange={(qty) =>
                                    syncFood(row.id, {
                                        quantity: String(qty),
                                    })
                                }
                            />
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )}
                    </td>
                    <td className="p-3 font-medium text-gray-700">
                        {selected ? formatMoney(rowTotal) : '—'}
                    </td>
                </tr>
            );
        });
    })();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4">
                <Checkbox
                    id="skipMenu"
                    checked={state.skipMenu}
                    onCheckedChange={(c) => {
                        onChange('skipMenu', !!c);
                        if (c) onChange('food', []);
                    }}
                />
                <Label htmlFor="skipMenu" className="font-normal">
                    No menu for this event
                </Label>
            </div>
            {state.skipMenu ? (
                <p className="text-sm text-muted-foreground">
                    Menu step will be skipped on submit. You can continue to
                    amenities.
                </p>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
                        <SectionHeader
                            title="Menu Configuration"
                            subtitle="Select and configure the menu item from your existing menu"
                        />
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <SelectField
                                id="savedMenuPackage"
                                name="savedMenuPackage"
                                label="Saved Menu Package"
                                value={state.menuPackageId || 'none'}
                                onValueChange={(v) => {
                                    if (v === 'none') {
                                        onChange('menuPackageId', '');
                                        return;
                                    }
                                    void applyMenuPackage(v);
                                }}
                                options={[
                                    {
                                        value: 'none',
                                        label: 'Select package (optional)',
                                    },
                                    ...packageOptions,
                                ]}
                                placeholder="Select package"
                            />
                            <SelectField
                                id="restaurantMenu"
                                name="restaurantMenu"
                                label="Restaurant Menu"
                                value={state.menuType ?? ''}
                                onValueChange={(v) => {
                                    onChange('menuType', v);
                                    const label = menuOptions.find(
                                        (o) => o.value === v,
                                    )?.label;
                                    if (label) {
                                        onChange('restaurantMenuName', label);
                                        onChange('menuName', label);
                                    }
                                }}
                                options={menuOptions}
                                placeholder="Select Menu"
                            />
                            <SelectField
                                id="menuCategory"
                                name="menuCategory"
                                label="Menu Category"
                                value={selectedCategory}
                                onValueChange={(v) => {
                                    onChange('cuisineType', v);
                                    setPage(1);
                                }}
                                options={menuCategoryOptions}
                                placeholder="All Menu"
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1">
                                <SearchInput
                                    placeholder="Search menu item"
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
                        {itemsResult && 'error' in itemsResult ? (
                            <p className="mt-4 text-sm text-destructive">
                                Could not load menu items.{' '}
                                <Link
                                    href="/menu"
                                    className="text-orion-blue underline"
                                >
                                    Manage menu
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
                                                    Menu item
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
                        <div className="mt-5 space-y-2">
                            <h4 className="text-xl font-semibold text-gray-900">
                                Special Instruction or note/ Optional
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Add a short description or note about the food
                                and how you want it.
                            </p>
                            <Label
                                htmlFor="menuInstructions"
                                className="sr-only"
                            >
                                Special instructions
                            </Label>
                            <Textarea
                                id="menuInstructions"
                                rows={4}
                                placeholder="eg A beautiful white wedding with 250 guests"
                                value={state.menuSpecialInstructions}
                                onChange={(e) =>
                                    onChange(
                                        'menuSpecialInstructions',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                    <SelectedItemsPanel
                        title="Event Menu Summary"
                        meta={[
                            {
                                label: 'Menu Package',
                                value:
                                    packageOptions.find(
                                        (o) =>
                                            o.value === state.menuPackageId,
                                    )?.label ??
                                    state.restaurantMenuName ??
                                    state.menuName ??
                                    'Banquet Menu',
                            },
                            {
                                label: 'Guest Count',
                                value: state.estimatedGuestCount
                                    ? `${state.estimatedGuestCount} Guest`
                                    : '—',
                            },
                            {
                                label: 'Price per head',
                                value: formatMoney(perHead),
                            },
                        ]}
                        items={summaryItems}
                        selectedCount={selectedCount}
                        subtotalLabel="SubTotal(Food)"
                        subtotal={pricing.foodSubtotal}
                        serviceChargePercent={state.serviceChargePercent}
                        serviceCharge={pricing.serviceCharge}
                        vatPercent={state.vatPercent}
                        vat={pricing.vat}
                        total={pricing.total}
                        onViewAll={
                            selectedCount > 0
                                ? () => {
                                      setModalPage(1);
                                      setModalOpen(true);
                                  }
                                : undefined
                        }
                    />
                </div>
            )}
            <p className="text-center text-sm text-muted-foreground sm:hidden">
                {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
            </p>

            <AllSelectedMenuModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                rows={modalRows}
                categoryBadgeClass={categoryBadgeClass}
                page={modalSafePage}
                totalPages={modalTotalPages}
                onPageChange={setModalPage}
            />
        </div>
    );
}
