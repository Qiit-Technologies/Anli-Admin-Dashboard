'use client';

import { getBadStockRecord } from '@/app/actions/stock';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';

/** FRD §12 — proper B&D reason codes */
export const BD_REASON_LABELS: Record<string, string> = {
    EXPIRED: 'Expired',
    SPOILED: 'Spoiled / Rotten',
    DAMAGED: 'Damaged / Broken',
    SPILLAGE: 'Spillage / Leakage',
    PEST: 'Pest damage',
    MISSING: 'Missing',
    WASTED: 'Wasted',
    OTHER: 'Other',
};

const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

export const formatBdReason = (record: any) => {
    if (!record) return '—';
    const code = String(record.reason || '').toUpperCase();
    const label = BD_REASON_LABELS[code] || record.reason || '—';
    return code === 'OTHER' && record.reasonOther
        ? `Other — ${record.reasonOther}`
        : label;
};

const buildBdPdfHtml = (record: any, lines: any[]) => {
    const reference = record.transactionNumber || `#${record.id}`;
    const rows = lines
        .map((line: any, index: number) => {
            const quantity = Number(line.quantityAffected) || 0;
            const value = Number(line.valueLost) || 0;
            const unitCost = quantity > 0 ? value / quantity : 0;
            return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(line.item?.name || 'Item')}</td>
        <td>${escapeHtml(line.item?.itemNumber || '—')}</td>
        <td class="num">${quantity.toLocaleString()} ${escapeHtml(line.unit || '')}</td>
        <td class="num">₦${unitCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
        <td class="num">₦${value.toLocaleString()}</td>
      </tr>`;
        })
        .join('');
    return `
<!DOCTYPE html>
<html><head><title>Bad & Damaged ${escapeHtml(reference)}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#111}
h1{font-size:18px;margin-bottom:2px}h2{font-size:13px;font-weight:normal;color:#555;margin:0 0 16px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;margin-bottom:16px}
.meta span{color:#555}.meta b{color:#111}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
th{background:#f5f5f5}.num{text-align:right}
.total{margin-top:12px;font-weight:bold;text-align:right;font-size:13px}
.notes{margin-top:16px;font-size:12px;color:#555}
.sign{margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:32px;font-size:12px}
.sign div{border-top:1px solid #999;padding-top:4px}
</style></head>
<body>
<h1>Bad &amp; Damaged — Write-off</h1>
<h2>${escapeHtml(reference)}</h2>
<div class="meta">
<p><span>B&amp;D No.:</span> <b>${escapeHtml(reference)}</b></p>
<p><span>Date:</span> <b>${record.date ? format(new Date(record.date), 'dd MMM yyyy') : '—'}</b></p>
<p><span>Department:</span> <b>${escapeHtml(record.department || '—')}</b></p>
<p><span>Reason:</span> <b>${escapeHtml(formatBdReason(record))}</b></p>
<p><span>Logged By:</span> <b>${escapeHtml(record.discoveredBy?.fullName || record.loggedBy?.fullName || '—')}</b></p>
<p><span>Status:</span> <b>${escapeHtml(record.status || '—')}</b></p>
<p><span>Approved By:</span> <b>${escapeHtml(record.approvedBy?.fullName || '—')}</b></p>
<p><span>Approved At:</span> <b>${record.approvedAt ? format(new Date(record.approvedAt), 'dd MMM yyyy HH:mm') : '—'}</b></p>
</div>
<table><thead><tr><th>#</th><th>Item</th><th>Item No.</th><th class="num">Qty Affected</th><th class="num">Unit Cost</th><th class="num">Value Lost</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6">No line items</td></tr>'}</tbody></table>
<div class="total">Total value lost: ₦${Number(record.valueLost || 0).toLocaleString()}</div>
${record.remarks ? `<div class="notes"><b>Remarks:</b> ${escapeHtml(record.remarks)}</div>` : ''}
${record.rejectionReason ? `<div class="notes"><b>Rejection reason:</b> ${escapeHtml(record.rejectionReason)}</div>` : ''}
<div class="sign"><div>Store Officer</div><div>Approving Manager</div></div>
</body></html>`;
};

const statusBadgeClass = (status?: string) =>
    cn(
        'border-none rounded-md px-3 py-1 font-bold italic text-[9px] uppercase tracking-wider',
        status === 'APPROVED'
            ? 'bg-green-50 text-green-600 shadow-none'
            : status === 'PENDING'
              ? 'bg-orange-50 text-orange-600 shadow-none'
              : status === 'REJECTED'
                ? 'bg-red-50 text-red-600 shadow-none'
                : 'bg-yellow-50 text-yellow-600 shadow-none',
    );

const BdDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: recordResponse, isLoading } = useSWR(
        id ? `/items/bad-stock/${id}` : null,
        () => getBadStockRecord(Number(id)),
    );

    const record = recordResponse?.data?.data ?? recordResponse?.data;
    const lines = Array.isArray(record?.items) ? record.items : [];
    const reference = record?.transactionNumber || `#${record?.id}`;

    const handleDownloadPdf = async () => {
        if (!record) return;
        setIsDownloading(true);
        try {
            await downloadHtmlDocumentAsPdf(
                buildBdPdfHtml(record, lines),
                `BD-${reference}.pdf`,
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="flex justify-center items-center h-64">
                    <p>Loading write-off details…</p>
                </div>
            </PageWrapper>
        );
    }

    if (recordResponse?.error || !record) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-destructive font-medium">
                        {recordResponse?.error || 'Write-off not found.'}
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </PageWrapper>
        );
    }

    const metaFields: Array<[string, React.ReactNode]> = [
        ['B&D No.', reference],
        [
            'Date',
            record.date
                ? format(new Date(record.date), 'dd MMMM yyyy')
                : '—',
        ],
        ['Department', record.department || '—'],
        ['Reason Code', formatBdReason(record)],
        [
            'Logged By',
            record.discoveredBy?.fullName ||
                record.loggedBy?.fullName ||
                '—',
        ],
        [
            'Approved By',
            record.approvedBy?.fullName || '—',
        ],
    ];

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <div className="px-6 pt-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Bad & Perishable
                </button>
            </div>
            <PageHeader>
                <PageHeadertitle
                    title={`Bad & Damaged — ${reference}`}
                    subtitle="Full-page write-off detail (FRD §12): list → detail → PDF."
                />
                <HeaderActions>
                    <Badge className={statusBadgeClass(record.status)}>
                        {record.status || 'UNKNOWN'}
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-3.5 w-3.5" />
                        Print
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        <Download className="h-3.5 w-3.5" />
                        {isDownloading ? 'Preparing…' : 'Download PDF'}
                    </Button>
                </HeaderActions>
            </PageHeader>
            <PageWrapper>
                <div className="max-w-6xl mx-auto space-y-6 pb-12">
                    <div className="rounded-xl border bg-white p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                        {metaFields.map(([label, value]) => (
                            <div key={label} className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className="font-medium text-foreground">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {record.remarks ? (
                        <div className="rounded-xl border bg-white p-6">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Remarks
                            </p>
                            <p className="text-sm">{record.remarks}</p>
                        </div>
                    ) : null}
                    {record.rejectionReason ? (
                        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6">
                            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">
                                Rejection Reason
                            </p>
                            <p className="text-sm text-red-700">
                                {record.rejectionReason}
                            </p>
                        </div>
                    ) : null}

                    <div className="rounded-xl border bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50/50">
                            <h3 className="text-sm font-bold">
                                Affected Items ({lines.length || 1})
                            </h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                                <tr>
                                    <th className="px-6 py-4 w-10">#</th>
                                    <th className="px-4 py-4">Item</th>
                                    <th className="px-4 py-4">Item No.</th>
                                    <th className="px-4 py-4 text-right">
                                        Qty Affected
                                    </th>
                                    <th className="px-4 py-4 text-right">
                                        Unit Cost
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        Value Lost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lines.length > 0 ? (
                                    lines.map((line: any, idx: number) => {
                                        const qty =
                                            Number(
                                                line.quantityAffected,
                                            ) || 0;
                                        const value =
                                            Number(line.valueLost) || 0;
                                        const unitCost =
                                            qty > 0 ? value / qty : 0;
                                        return (
                                            <tr key={String(line.id ?? idx)}>
                                                <td className="px-6 py-4 tabular-nums text-muted-foreground">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-4 font-medium">
                                                    {line.item?.name || 'Item'}
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground">
                                                    {line.item?.itemNumber ||
                                                        '—'}
                                                </td>
                                                <td className="px-4 py-4 text-right tabular-nums">
                                                    {qty.toLocaleString()}{' '}
                                                    {line.unit || ''}
                                                </td>
                                                <td className="px-4 py-4 text-right tabular-nums">
                                                    {formatCurrency(unitCost)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium tabular-nums">
                                                    {formatCurrency(value)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-muted-foreground"
                                        >
                                            No line items on this write-off.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="border-t bg-gray-50/50">
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-4 text-right font-bold uppercase tracking-wider text-sm"
                                    >
                                        Total value lost
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold tabular-nums text-red-600">
                                        {formatCurrency(
                                            Number(record.valueLost || 0),
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="rounded-xl border bg-white p-6">
                        <div className="grid grid-cols-2 gap-6 text-center pt-4">
                            {['Store Officer', 'Approving Manager'].map(
                                (role) => (
                                    <div key={role}>
                                        <div className="border-t border-gray-300 pt-2 mt-12" />
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {role}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default BdDetailPage;
