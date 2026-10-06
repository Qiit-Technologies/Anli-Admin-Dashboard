'use client';

import SectionHeader from '@/components/banquest/booking-wizard/SectionHeader';
import MenuPackageImageEdit from '@/components/banquest/menu/MenuPackageImageEdit';
import MenuItemsTable from '@/components/banquest/menu/shared/MenuItemsTable';
import { MenuPackageRow } from '@/components/banquest/menu/types';
import { formatMoney } from '@/components/banquest/utils/banquet-pricing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, Percent, Tag, Users, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';

const METRICS = [
    { key: 'price', label: 'Price Range', icon: Tag },
    { key: 'guests', label: 'Guest Range Count', icon: Users },
    { key: 'service', label: 'Service Charge', icon: Wrench },
    { key: 'vat', label: 'Tax(VAT)', icon: Percent },
] as const;

export default function MenuPackageDetailView({
    pkg,
}: {
    pkg: MenuPackageRow;
}) {
    const initialIds = useMemo(
        () => (pkg.items ?? []).map((i) => i.id),
        [pkg.items],
    );
    const initialQty = useMemo(
        () =>
            Object.fromEntries(
                (pkg.items ?? []).map((i) => [i.id, i.quantity]),
            ),
        [pkg.items],
    );

    const fallbackCatalog = useMemo(
        () =>
            (pkg.items ?? []).map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                category: 'Package',
                type: 'Food',
                unit: 'Per person',
                unitPrice: item.unitPrice,
            })),
        [pkg.items],
    );

    const [selectedIds, setSelectedIds] = useState(initialIds);
    const [quantities, setQuantities] = useState(initialQty);

    const metrics = useMemo(() => {
        const guestMin = pkg.guestMin;
        const guestMax = pkg.guestMax;
        const guests =
            guestMin && guestMax
                ? `${guestMin} - ${guestMax} guest`
                : guestMin
                  ? `${guestMin} guest`
                  : '—';

        return {
            price: `${formatMoney(pkg.priceMin)} - ${formatMoney(pkg.priceMax)}`,
            guests,
            service: `${pkg.serviceChargePercent ?? 10}%`,
            vat: `${pkg.vatPercent ?? 7.5}%`,
        };
    }, [pkg]);

    const toggle = (id: number, selected: boolean) => {
        setSelectedIds((prev) =>
            selected ? [...prev, id] : prev.filter((x) => x !== id),
        );
        if (selected) {
            setQuantities((q) => ({ ...q, [id]: q[id] ?? 1 }));
        }
    };

    return (
        <div className="flex flex-col gap-6 px-4 pb-12 lg:px-8">
            <div className="rounded-xl border border-gray-200 bg-white p-6 mt-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-5">
                            <MenuPackageImageEdit
                                packageId={Number(pkg.id)}
                                category={pkg.category}
                                imageUrl={pkg.imageUrl}
                                size="lg"
                            />
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {pkg.name}
                                    </h2>
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-3 py-1 text-xs font-medium',
                                            pkg.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-orange-50 text-orange-700',
                                        )}
                                    >
                                        {pkg.status === 'active'
                                            ? 'Active'
                                            : 'Un-available'}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground capitalize">
                                    {pkg.categoryLabel} · {pkg.mealType}
                                    {pkg.serviceStyle
                                        ? ` · ${pkg.serviceStyle}`
                                        : ''}{' '}
                                    · {pkg.itemCount} items
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {pkg.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
                            <MenuPackageImageEdit
                                packageId={Number(pkg.id)}
                                category={pkg.category}
                                imageUrl={pkg.imageUrl}
                                layout="inline"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-200"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 border-t border-gray-100 pt-6">
                        {METRICS.map(({ key, label, icon: Icon }) => (
                            <div
                                key={key}
                                className="flex min-w-[140px] items-center gap-3"
                            >
                                <Icon className="h-5 w-5 shrink-0 text-gray-700" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {metrics[key]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
                <SectionHeader
                    title="Menu Configuration"
                    subtitle="Select and configure the menu item from your existing menu"
                />
                <div className="mt-6">
                    <MenuItemsTable
                        mode="configure"
                        selectedIds={selectedIds}
                        quantities={quantities}
                        restrictToIds={initialIds.length ? initialIds : undefined}
                        fallbackItems={
                            fallbackCatalog.length ? fallbackCatalog : undefined
                        }
                        onToggleItem={toggle}
                        onQuantityChange={(id, qty) =>
                            setQuantities((q) => ({ ...q, [id]: qty }))
                        }
                    />
                </div>
            </div>
        </div>
    );
}
