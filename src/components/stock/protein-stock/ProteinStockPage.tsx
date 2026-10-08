'use client';

import { fetchItemCategories } from '@/app/actions/items';
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
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DayStrip } from '../stock-movement/DayStrip';
import { ProteinBoard } from './ProteinBoard';
import { ProteinSummary } from './ProteinSummary';
import { downloadProteinStockSheetPdf } from './proteinStockPdf';
import type { ProteinFilter } from './types';
import { useProteinStockDraft } from './useProteinStockDraft';

function parseDateParam(value: string | null) {
    if (!value) return new Date();
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? new Date() : d;
}

function normalizeCategoryName(name: string) {
    return name.trim();
}

export default function ProteinStockPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedDate = useMemo(
        () => parseDateParam(searchParams.get('date')),
        [searchParams],
    );
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const filter = (searchParams.get('filter') as ProteinFilter) || 'all';
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || '';

    const [month, setMonth] = useState(() => startOfMonth(selectedDate));
    const monthKey = format(month, 'yyyy-MM');

    const { data: items, isLoading } = useSWR('/items', fetchStockItems);
    const { data: categoryOptions, isLoading: categoriesLoading } = useSWR(
        '/items/categories',
        fetchItemCategories,
    );

    const {
        rows,
        dirty,
        saving,
        summary,
        updateField,
        updateBdReason,
        save,
        clearDay,
        draft,
    } = useProteinStockDraft(items, dateKey);

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
        const set = new Set<string>();
        if (
            Object.keys(draft).some((id) => {
                const line = draft[id];
                return Boolean(
                    line.inPtn ||
                        line.inPcs ||
                        line.outPtn ||
                        line.outPcs ||
                        line.rtnPtn ||
                        line.rtnPcs ||
                        line.bdPtn ||
                        line.bdPcs,
                );
            })
        ) {
            set.add(dateKey);
        }
        return set;
    }, [draft, dateKey]);

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
                                : 'Failed to save protein stock.'
                        }
                        type="error"
                    />
                ));
                return;
            }
            mutate('/items');
            toast.custom(() => (
                <Toast
                    title="Day posted"
                    description={`Protein IN, OUT, RTN, and B&D for ${format(selectedDate, 'd MMM yyyy')} are now the store history.`}
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
                            : 'Failed to save protein stock.'
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
            await downloadProteinStockSheetPdf(
                rows,
                dateKey,
                format(selectedDate, 'EEEE, d MMMM yyyy'),
            );
            toast.custom(() => (
                <Toast
                    title="Downloaded"
                    description={`Protein stock sheet PDF for ${dateKey} downloaded.`}
                    type="success"
                />
            ));
        } catch (err) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={
                        err instanceof Error ? err.message : 'Download failed'
                    }
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
                    title="Protein Stock"
                    subtitle="Pieces-and-portions ledger for counted proteins. Only items classified as Protein appear here."
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
                        {downloadingPdf
                            ? 'Downloading…'
                            : 'Download Stock Sheet PDF'}
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

                <ProteinSummary {...summary} />

                <ProteinBoard
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
                    onBdReasonChange={updateBdReason}
                    onClear={handleClear}
                    onSave={handleSave}
                />
            </PageWrapper>
        </div>
    );
}
