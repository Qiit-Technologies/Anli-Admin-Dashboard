'use client';

import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import { useUser } from '@/context/useUser';
import { downloadData } from '@/lib/downloadData';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getBanquetReport } from '@/app/actions/banquet-report';
import { buildDefaultFilters, generateBanquetReportData } from '../config';
import { BanquetReportConfig, BanquetReportData } from '../types';
import BanquetReportContent from './BanquetReportContent';
import BanquetReportFilters from './BanquetReportFilters';
import {
    formatLongDate,
    to12Hour,
    toHHMM,
    toYYYYMMDD,
} from './utils';

interface BanquetReportPageProps {
    config: BanquetReportConfig;
}

function buildFilterSummary(
    config: BanquetReportConfig,
    filters: Record<string, string>,
): string {
    const parts = config.filters
        .map((field) => {
            const value = filters[field.key];
            if (!value || value === 'all') return null;
            if (field.type === 'select') {
                const label = field.options?.find((o) => o.value === value)
                    ?.label;
                return `${field.label}: ${label ?? value}`;
            }
            return `${field.label}: ${value}`;
        })
        .filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : 'All filters';
}

export default function BanquetReportPage({
    config,
}: Readonly<BanquetReportPageProps>) {
    const { user } = useUser();
    const today = toYYYYMMDD(new Date());

    const [filters, setFilters] = useState(() =>
        buildDefaultFilters(config, today),
    );
    const [reportData, setReportData] = useState<BanquetReportData | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(
        null,
    );

    const filterSummary = useMemo(
        () => buildFilterSummary(config, filters),
        [config, filters],
    );

    const usesLiveData = config.dataSource !== 'preview';

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            if (usesLiveData) {
                const result = await getBanquetReport({
                    slug: config.slug,
                    ...filters,
                });
                if (result.error) {
                    toast.error(result.error);
                    return;
                }
                if (!result.data) {
                    toast.error('No report data returned');
                    return;
                }
                setReportData(result.data);
            } else {
                const data = generateBanquetReportData(config);
                setReportData(data);
            }
            setReportGeneratedAt(new Date());
            toast.success('Report generated successfully');
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        const dataToExport = reportData.items.map((row) => {
            const mapped: Record<string, string | number> = {};
            for (const col of config.columns) {
                mapped[col.label] = row[col.key] ?? '';
            }
            return mapped;
        });
        const filename = `${config.title} (${filters.startDate} - ${filters.endDate})`;
        downloadData(dataToExport, 'xlsx', filename);
    };

    const handlePrint = () => {
        if (!reportData) return;
        const win = window.open('', '_blank');
        if (!win) return;

        const generatedBy = user?.fullName ?? 'System';
        const period = `${formatLongDate(filters.startDate)} → ${formatLongDate(filters.endDate)}`;
        const headerCells = config.columns
            .map((c) => `<th>${c.label}</th>`)
            .join('');
        const bodyRows = reportData.items
            .map(
                (row) =>
                    `<tr>${config.columns
                        .map(
                            (col) =>
                                `<td style="text-align:${col.align === 'right' ? 'right' : 'left'}">${row[col.key] ?? ''}</td>`,
                        )
                        .join('')}</tr>`,
            )
            .join('');

        const summaryHtml = config.summaryCards
            .map(
                (card) =>
                    `<div class="kpi"><strong>${card.label}</strong>${reportData.summary[card.key] ?? 0}</div>`,
            )
            .join('');

        win.document.write(`
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${config.title}</title>
                <style>
                    body { font-family: Inter, sans-serif; padding: 40px; color: #1a1a1a; }
                    .header { text-align: center; margin-bottom: 24px; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .header p { margin: 5px 0; color: #666; font-size: 14px; }
                    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; font-size: 12px; }
                    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
                    .kpi strong { display: block; color: #555; font-size: 11px; margin-bottom: 4px; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    th, td { padding: 8px 6px; border-bottom: 1px solid #eee; text-align: left; }
                    th { color: #555; text-transform: uppercase; font-size: 9px; border-bottom: 2px solid #333; }
                    .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
                    .footer .created-by { color: #f97316; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${config.title}</h1>
                    <p>Report period: ${period}</p>
                    <p>${filterSummary}</p>
                    <p>Printed at: ${new Date().toLocaleString()} · Printed by: ${generatedBy}</p>
                </div>
                <div class="kpis">${summaryHtml}</div>
                <table>
                    <thead><tr>${headerCells}</tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
                <div class="footer">
                    Report generated on ${new Date().toLocaleDateString()}
                    <br /><span class="created-by">Printed by: ${generatedBy}.</span>
                </div>
                <script>window.onload = () => { window.print(); window.close(); };</script>
            </body>
            </html>
        `);
        win.document.close();
    };

    const hasData = reportData !== null;

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex flex-col gap-2 w-full">
                    <Link
                        href="/banquet/reports"
                        className="text-sm text-orion-blue hover:underline w-fit"
                    >
                        ← Back to reports
                    </Link>
                    <PageHeadertitle
                        title={config.title}
                        subtitle={config.subtitle}
                    />
                </div>
            </PageHeader>

            <div className="mt-4">
                <BanquetReportFilters
                    fields={config.filters}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onGenerateReport={handleGenerateReport}
                    onExportExcel={handleExportExcel}
                    onPrint={handlePrint}
                    isLoading={isLoading}
                />
            </div>

            <hr className="my-4" />

            <div className="min-h-[400px]">
                {isLoading ? (
                    <BanquetReportContent
                        title={config.title}
                        columns={config.columns}
                        summaryCards={config.summaryCards}
                        data={null}
                        loading
                    />
                ) : hasData ? (
                    <BanquetReportContent
                        title={config.title}
                        columns={config.columns}
                        summaryCards={config.summaryCards}
                        data={reportData}
                        headerInfo={{
                            hotelName: user?.orgName ?? '',
                            printedAt: reportGeneratedAt
                                ? `${formatLongDate(reportGeneratedAt.toISOString().slice(0, 10))}, ${to12Hour(toHHMM(reportGeneratedAt))}`
                                : '',
                            dateRange: `${formatLongDate(filters.startDate)} → ${formatLongDate(filters.endDate)}`,
                            generatedBy: user?.fullName ?? 'System',
                            generatedAt: reportGeneratedAt
                                ? reportGeneratedAt.toLocaleString()
                                : '',
                            filterSummary,
                        }}
                    />
                ) : (
                    <EmptyReportState
                        title="No results found"
                        description="Select filters and click Generate to see this report."
                    />
                )}
            </div>

            {reportGeneratedAt ? (
                <div className="mt-6 py-4 border-t border-gray-200 text-center text-sm text-gray-600">
                    Report generated on{' '}
                    {reportGeneratedAt.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}{' '}
                    – {to12Hour(toHHMM(reportGeneratedAt))}
                    <br />
                    <span className="text-orange-500">
                        Printed by: {user?.fullName ?? 'System'}.
                    </span>
                </div>
            ) : null}
        </PageWrapper>
    );
}
