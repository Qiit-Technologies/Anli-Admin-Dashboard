'use client';

import { fetchItemCategories } from '@/app/actions/items';
import { getStockMovements } from '@/app/actions/stock';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import Toast from '@/components/toast';
import { fetchStockItems } from '@/hooks/fetcher';
import { format, startOfMonth } from 'date-fns';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { downloadDailyStockSummaryPdf } from '@/app/actions/stock-summary';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DayStrip } from './DayStrip';
import { MovementBoard } from './MovementBoard';
import { MovementSummary } from './MovementSummary';
import type { MovementFilter } from './types';
import { useStockMovementDraft } from './useStockMovementDraft';

function parseDateParam(value: string | null) {
    if (!value) return new Date();
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? new Date() : d;
}

function normalizeCategoryName(name: string) {
    return name.trim();
}

export default function StockMovementPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedDate = useMemo(
        () => parseDateParam(searchParams.get('date')),
        [searchParams],
    );
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const filter = (searchParams.get('filter') as MovementFilter) || 'all';
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';

    const [month, setMonth] = useState(() => startOfMonth(selectedDate));
    const monthKey = format(month, 'yyyy-MM');

    const { data: items, isLoading } = useSWR('/items', fetchStockItems);
    const { data: categoryOptions, isLoading: categoriesLoading } = useSWR(
        '/items/categories',
        fetchItemCategories,
    );
    const { data: monthDays } = useSWR(
        ['stock-movement-days', monthKey],
        async () => {
            const result = await getStockMovements({ month: monthKey });
            return new Set<string>(result.data?.days ?? []);
        },
    );
    const {
        rows,
        dirty,
        saving,
        summary,
        updateField,
        save,
        clearDay,
        draft,
    } = useStockMovementDraft(items, dateKey);

    /** Categories from Items page, plus any still present only on items. */
    const categories = useMemo(() => {
        const seen = new Map<string, string>();

        for (const opt of categoryOptions ?? []) {
            const name = normalizeCategoryName(opt.name || '');
            if (!name) continue;
            const key = name.toLowerCase();
            if (!seen.has(key)) seen.set(key, name);
        }

        for (const row of rows) {
            const name = normalizeCategoryName(row.category || '');
            if (!name) continue;
            const key = name.toLowerCase();
            if (!seen.has(key)) seen.set(key, name);
        }

        return Array.from(seen.values()).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' }),
        );
    }, [categoryOptions, rows]);

    const activeCategory = useMemo(() => {
        if (!categories.length) return '';
        if (
            categoryParam &&
            categories.some(
                (c) => c.toLowerCase() === categoryParam.toLowerCase(),
            )
        ) {
            return (
                categories.find(
                    (c) => c.toLowerCase() === categoryParam.toLowerCase(),
                ) || categories[0]
            );
        }
        return categories[0];
    }, [categories, categoryParam]);

    const setParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (!value) params.delete(key);
            else params.set(key, value);
        }
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    };

    const movedDays = useMemo(() => {
        const set = new Set(monthDays ?? []);
        if (
            Object.keys(draft).some((id) => {
                const line = draft[id];
                return Boolean(line.inQty || line.outQty || line.bdQty);
            })
        ) {
            set.add(dateKey);
        }
        return set;
    }, [monthDays, draft, dateKey]);

    const handleSave = async () => {
        try {
            const result = await save();
            if ('error' in result && result.error) {
                toast.custom(() => (
                    <Toast
                        title="Could not post day"
                        description={
                            typeof result.error === 'string'
                                ? result.error
                                : 'Failed to save stock movements.'
                        }
                        type="error"
                    />
                ));
                return;
            }
            mutate('/items');
            mutate(['stock-movement-days', monthKey]);
            mutate('/items/purchase-logs');
            mutate('/items/approved');
            mutate('/items/bad-stock');
            toast.custom(() => (
                <Toast
                    title="Day posted"
                    description={`IN, OUT, and B&D for ${format(selectedDate, 'd MMM yyyy')} are now the store history.`}
                    type="success"
                />
            ));
        } catch (error) {
            toast.custom(() => (
                <Toast
                    title="Could not post day"
                    description={
                        error instanceof Error
                            ? error.message
                            : 'Failed to save stock movements.'
                    }
                    type="error"
                />
            ));
        }
    };

    const handleClear = () => {
        clearDay();
        toast.custom(() => (
            <Toast
                title="Edits reset"
                description="Unposted changes were discarded. Posted movements are unchanged."
                type="success"
            />
        ));
    };

    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true);
        try {
            const res = await downloadDailyStockSummaryPdf(dateKey);
            console.log(res)
            if (res.data) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${res.data}`;
                link.download = res.filename || `Daily-Stock-Summary-${dateKey}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.custom(() => (
                    <Toast
                        title="Downloaded"
                        description={`Daily stock summary PDF for ${dateKey} downloaded.`}
                        type="success"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={res.error || 'Failed to download PDF summary'}
                        type="error"
                    />
                ));
            }
        } catch (err: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={err?.message || 'Download failed'}
                    type="error"
                />
            ));
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <div className="flex h-full flex-col overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Stock Movement"
                    subtitle="Single source of truth for store IN, OUT, and B&D. History views update automatically."
                />
                <HeaderActions>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="flex items-center gap-1.5"
                    >
                        <Download className="w-4 h-4" />
                        {downloadingPdf ? 'Downloading…' : 'Download Summary PDF'}
                    </Button>
                </HeaderActions>
            </PageHeader>

            <PageWrapper className="gap-4 py-4">
                <DayStrip
                    month={month}
                    selected={selectedDate}
                    movedDays={movedDays}
                    onMonthChange={(m) => {
                        setMonth(startOfMonth(m));
                    }}
                    onSelect={(date) => {
                        setMonth(startOfMonth(date));
                        setParams({ date: format(date, 'yyyy-MM-dd') });
                    }}
                />

                <MovementSummary {...summary} />

                <MovementBoard
                    rows={rows}
                    categories={categories}
                    category={activeCategory}
                    categoriesLoading={categoriesLoading && !categories.length}
                    onCategoryChange={(c) => setParams({ category: c })}
                    filter={
                        ['all', 'moved', 'reorder', 'available'].includes(
                            filter,
                        )
                            ? filter
                            : 'all'
                    }
                    query={query}
                    loading={isLoading}
                    dirty={dirty}
                    saving={saving}
                    canClear={dirty}
                    onQueryChange={(q) => setParams({ q: q || null })}
                    onFilterChange={(f) =>
                        setParams({ filter: f === 'all' ? null : f })
                    }
                    onChange={updateField}
                    onClear={handleClear}
                    onSave={handleSave}
                />
            </PageWrapper>
        </div>
    );
}
