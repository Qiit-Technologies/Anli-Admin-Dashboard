'use client';

import { getBarStock } from '@/app/actions/stock';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import Toast from '@/components/toast';
import { DayStrip } from '@/components/stock/stock-movement/DayStrip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth } from 'date-fns';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import {
    BAR_DEPARTMENTS,
    BarDepartment,
    BarStockRow,
    formatNaira,
    formatQty,
    normalizeBarStockResponse,
    normalizeRegisterFallback,
    summarizeBarStock,
} from './types';

function parseDateParam(value: string | null) {
    if (!value) return new Date();
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? new Date() : d;
}

function parseDepartment(value: string | null): BarDepartment {
    return BAR_DEPARTMENTS.some((d) => d.value === value)
        ? (value as BarDepartment)
        : 'bar';
}

const summaryCells = [
    { key: 'openingValue', label: 'Opening value', hint: 'On hand at open' },
    { key: 'receivedValue', label: 'Received value', hint: 'Received today' },
    { key: 'soldValue', label: 'Sold value', hint: 'Sold today' },
    {
        key: 'transferredValue',
        label: 'Transferred value',
        hint: 'Moved out today',
    },
    { key: 'wastageValue', label: 'Wastage value', hint: 'B&D today' },
    { key: 'closingValue', label: 'Closing value', hint: 'Carry forward' },
] as const;

export default function BarStockPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedDate = useMemo(
        () => parseDateParam(searchParams.get('date')),
        [searchParams],
    );
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const department = parseDepartment(searchParams.get('department'));
    const query = searchParams.get('q') || '';

    const [month, setMonth] = useState(() => startOfMonth(selectedDate));

    const setParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (!value) params.delete(key);
            else params.set(key, value);
        }
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };

    const fetcher = async (): Promise<{
        rows: BarStockRow[];
        source: string;
    }> => {
        const result = await getBarStock({ date: dateKey, department });
        if ('error' in result && result.error) {
            throw new Error(
                typeof result.error === 'string'
                    ? result.error
                    : 'Failed to load bar stock.',
            );
        }
        const payload = (result as { data: unknown }).data;
        const source = (result as { source?: string }).source ?? 'bar-stock';
        const rows =
            source === 'daily-register'
                ? normalizeRegisterFallback(payload, department)
                : normalizeBarStockResponse(payload);
        return { rows, source };
    };

    const swrKey = `/items/bar-stock?date=${dateKey}&department=${department}`;
    const { data, isLoading, error } = useSWR(swrKey, fetcher, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (error) {
            toast.custom(() => (
                <Toast
                    title="Could not load bar stock"
                    description={error.message}
                    type="error"
                />
            ));
        }
    }, [error]);

    const rows = data?.rows ?? [];
    const summary = useMemo(() => summarizeBarStock(rows), [rows]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.itemName.toLowerCase().includes(q) ||
                (r.itemNumber ?? '').toLowerCase().includes(q),
        );
    }, [rows, query]);

    const summaryValues = {
        openingValue: summary.openingValue,
        receivedValue: summary.receivedValue,
        soldValue: summary.soldValue,
        transferredValue: summary.transferredValue,
        wastageValue: summary.wastageValue,
        closingValue: summary.closingValue,
    };

    const departmentLabel =
        BAR_DEPARTMENTS.find((d) => d.value === department)?.label ?? 'Bar';

    return (
        <div className="flex h-full flex-col overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Bar Stock"
                    subtitle={`Department stock balance — opening, received, sold, transferred, wastage, closing per item.`}
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="gap-4 py-4">
                <DayStrip
                    month={month}
                    selected={selectedDate}
                    onMonthChange={(m) => setMonth(startOfMonth(m))}
                    onSelect={(date) => {
                        setMonth(startOfMonth(date));
                        setParams({ date: format(date, 'yyyy-MM-dd') });
                    }}
                />

                <div className="grid items-stretch gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-6">
                    {summaryCells.map((cell) => (
                        <div
                            key={cell.key}
                            className="flex h-full min-h-[5.5rem] flex-col bg-card p-4"
                        >
                            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {cell.label}
                            </p>
                            <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                                {formatCurrency(summaryValues[cell.key])}
                            </p>
                            <p className="mt-auto text-[12px] text-muted-foreground">
                                {cell.hint}
                            </p>
                        </div>
                    ))}
                </div>
                <p className="text-[12px] text-muted-foreground">
                    {summary.itemCount} {departmentLabel.toLowerCase()} items ·{' '}
                    {format(selectedDate, 'EEEE, d MMMM yyyy')}
                    {data?.source === 'daily-register' &&
                        ' · derived from the daily stock register'}
                </p>

                <div className="overflow-hidden rounded-lg border bg-card">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-[14px] font-semibold">
                            {departmentLabel} balance{' '}
                            <span className="font-normal text-muted-foreground">
                                — {dateKey}
                            </span>
                        </h2>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative w-full sm:w-56">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search items…"
                                    value={query}
                                    onChange={(e) =>
                                        setParams({
                                            q: e.target.value || null,
                                        })
                                    }
                                    className="h-9 rounded-sm pl-9 shadow-none"
                                />
                            </div>
                            <Select
                                value={department}
                                onValueChange={(v) =>
                                    setParams({
                                        department: v === 'bar' ? null : v,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-full sm:w-44">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BAR_DEPARTMENTS.map((d) => (
                                        <SelectItem
                                            key={d.value}
                                            value={d.value}
                                        >
                                            {d.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
                            Loading {departmentLabel.toLowerCase()} balance…
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-sm font-medium">
                                Could not load bar stock
                            </p>
                            <p className="mt-1 text-[12px] text-muted-foreground">
                                {error.message}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-sm text-muted-foreground">
                            {query
                                ? 'No items match your search.'
                                : `No ${departmentLabel.toLowerCase()} stock recorded for this day yet.`}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            'Item',
                                            'UoM',
                                            'Opening',
                                            'Received',
                                            'Sold',
                                            'Transferred',
                                            'Wastage',
                                            'Closing',
                                            'Unit price',
                                            'Value',
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filtered.map((r) => (
                                        <tr
                                            key={`${r.itemId}-${r.itemName}`}
                                            className="hover:bg-gray-50/60"
                                        >
                                            <td className="px-4 py-2.5">
                                                <div className="font-medium">
                                                    {r.itemName}
                                                </div>
                                                {r.itemNumber && (
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {r.itemNumber}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-muted-foreground">
                                                {r.unit}
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums">
                                                {formatQty(r.opening)}
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums text-emerald-700">
                                                +{formatQty(r.received)}
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums text-rose-700">
                                                −{formatQty(r.sold)}
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums">
                                                {formatQty(r.transferred)}
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums text-amber-700">
                                                {formatQty(r.wastage)}
                                            </td>
                                            <td className="px-4 py-2.5 font-semibold tabular-nums">
                                                {formatQty(r.closing)}
                                            </td>
                                            <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                                                {formatNaira(r.unitPrice)}
                                            </td>
                                            <td className="px-4 py-2.5 font-medium tabular-nums">
                                                {formatNaira(r.value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </PageWrapper>
        </div>
    );
}
