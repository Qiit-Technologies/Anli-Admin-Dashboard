'use client';

import { getIssuedStockDetail } from '@/app/actions/stock';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';

const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

type SIVLine = {
    id?: string | number;
    name?: string;
    itemName?: string;
    item?: { name?: string };
    quantity?: number;
    qty?: number;
    unitOfMeasurement?: string;
    unit?: string;
    unitPrice?: number;
    costPerUnit?: number;
    totalValue?: number;
    value?: number;
};

const lineName = (line: SIVLine) =>
    line.name || line.itemName || line.item?.name || 'Item';
const lineQty = (line: SIVLine) => Number(line.quantity ?? line.qty ?? 0);
const lineUnit = (line: SIVLine) =>
    line.unitOfMeasurement || line.unit || '—';
const lineUnitPrice = (line: SIVLine) =>
    Number(line.unitPrice ?? line.costPerUnit ?? 0);
const lineValue = (line: SIVLine, idx: number) =>
    Number(line.totalValue ?? line.value ?? lineUnitPrice(line) * lineQty(line));

const buildSivPdfHtml = (siv: any, lines: SIVLine[]) => {
    const sivNo =
        siv.issueNo || siv.sivNumber || siv.requestNumber || `#${siv.id}`;
    const rows = lines
        .map((line, idx) => {
            const qty = lineQty(line);
            const price = lineUnitPrice(line);
            return `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(lineName(line))}</td>
        <td>${escapeHtml(lineUnit(line))}</td>
        <td class="num">${qty.toLocaleString()}</td>
        <td class="num">₦${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
        <td class="num">₦${lineValue(line, idx).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
      </tr>`;
        })
        .join('');
    const totalValue = lines.reduce((s, l, i) => s + lineValue(l, i), 0);
    return `
<!DOCTYPE html>
<html>
<head><title>Store Issue Voucher ${escapeHtml(sivNo)}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#111}
h1{font-size:20px;margin-bottom:2px}h2{font-size:13px;font-weight:normal;color:#555;margin:0 0 16px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;margin-bottom:16px}
.meta span{color:#555}.meta b{color:#111}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
th{background:#f5f5f5}.num{text-align:right}
.total{margin-top:12px;font-weight:bold;text-align:right;font-size:13px}
.sign{margin-top:40px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;font-size:12px}
.sign div{border-top:1px solid #999;padding-top:4px}
</style></head>
<body>
<h1>Store Issue Voucher</h1>
<h2>${escapeHtml(sivNo)}</h2>
<div class="meta">
<p><span>SIV No.:</span> <b>${escapeHtml(sivNo)}</b></p>
<p><span>Date Issued:</span> <b>${siv.date ? format(new Date(siv.date), 'dd MMM yyyy') : '—'}</b></p>
<p><span>Department:</span> <b>${escapeHtml(siv.department || '—')}</b></p>
<p><span>Receiving Officer:</span> <b>${escapeHtml(siv.receivingOfficer?.fullName || siv.receivingOfficer || siv.requestedBy?.fullName || siv.requestedBy || '—')}</b></p>
<p><span>Issued By:</span> <b>${escapeHtml(siv.issuingOfficer?.fullName || siv.issuingOfficer || siv.issuedBy?.fullName || siv.issuedBy || '—')}</b></p>
<p><span>Status:</span> <b>${escapeHtml(siv.status || '—')}</b></p>
</div>
<table><thead><tr><th>#</th><th>Item</th><th>UoM</th><th class="num">Qty Issued</th><th class="num">Unit Price</th><th class="num">Value</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6">No line items</td></tr>'}</tbody></table>
<div class="total">Total value: ₦${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
${siv.remarks ? `<p style="font-size:12px;color:#555;margin-top:16px"><b>Remarks:</b> ${escapeHtml(siv.remarks)}</p>` : ''}
<div class="sign"><div>Requested By</div><div>Issuing Officer</div><div>Receiving Officer</div></div>
</body></html>`;
};

const SivDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: sivResponse, isLoading } = useSWR(
        id ? `/items/siv/${id}` : null,
        () => getIssuedStockDetail(id),
    );

    const siv = sivResponse?.data;
    const lines: SIVLine[] = useMemo(
        () =>
            Array.isArray(siv?.items)
                ? siv.items
                : Array.isArray(siv?.item)
                  ? siv.item
                  : [],
        [siv],
    );
    const totalValue = useMemo(
        () => lines.reduce((s, l, i) => s + lineValue(l, i), 0),
        [lines],
    );
    const sivNo =
        siv?.issueNo || siv?.sivNumber || siv?.requestNumber || `#${siv?.id}`;

    const handleDownloadPdf = async () => {
        if (!siv) return;
        setIsDownloading(true);
        try {
            await downloadHtmlDocumentAsPdf(
                buildSivPdfHtml(siv, lines),
                `SIV-${sivNo}.pdf`,
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="flex justify-center items-center h-64">
                    <p>Loading issue voucher…</p>
                </div>
            </PageWrapper>
        );
    }

    if (sivResponse?.error || !siv) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-destructive font-medium">
                        {sivResponse?.error ||
                            'Issue voucher not found.'}
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </PageWrapper>
        );
    }

    const metaFields: Array<[string, string]> = [
        ['SIV No.', String(sivNo)],
        [
            'Date Issued',
            siv.date
                ? format(new Date(siv.date), 'dd MMMM yyyy')
                : '—',
        ],
        ['Department', siv.department || '—'],
        [
            'Receiving Officer',
            siv.receivingOfficer?.fullName ||
                siv.receivingOfficer ||
                siv.requestedBy?.fullName ||
                siv.requestedBy ||
                '—',
        ],
        [
            'Issued By',
            siv.issuingOfficer?.fullName ||
                siv.issuingOfficer ||
                siv.issuedBy?.fullName ||
                siv.issuedBy ||
                '—',
        ],
        ['Status', siv.status || '—'],
    ];

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <div className="px-6 pt-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Issued Stock
                </button>
            </div>
            <PageHeader>
                <PageHeadertitle
                    title={`Store Issue Voucher — ${sivNo}`}
                    subtitle="Full-page SIV detail (FRD §11): list → detail → PDF."
                />
                <HeaderActions>
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

                    {siv.remarks ? (
                        <div className="rounded-xl border bg-white p-6">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Remarks
                            </p>
                            <p className="text-sm">{siv.remarks}</p>
                        </div>
                    ) : null}

                    <div className="rounded-xl border bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50/50">
                            <h3 className="text-sm font-bold">
                                Issued Items ({lines.length})
                            </h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                                <tr>
                                    <th className="px-6 py-4 w-10">#</th>
                                    <th className="px-4 py-4">Item</th>
                                    <th className="px-4 py-4">UoM</th>
                                    <th className="px-4 py-4 text-right">
                                        Qty Issued
                                    </th>
                                    <th className="px-4 py-4 text-right">
                                        Unit Price
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lines.length > 0 ? (
                                    lines.map((line, idx) => (
                                        <tr key={String(line.id ?? idx)}>
                                            <td className="px-6 py-4 tabular-nums text-muted-foreground">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-4 font-medium">
                                                {lineName(line)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {lineUnit(line)}
                                            </td>
                                            <td className="px-4 py-4 text-right tabular-nums">
                                                {lineQty(line).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-right tabular-nums">
                                                {formatCurrency(
                                                    lineUnitPrice(line),
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium tabular-nums">
                                                {formatCurrency(
                                                    lineValue(line, idx),
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-8 text-center text-muted-foreground"
                                        >
                                            No line items on this voucher.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {lines.length > 0 ? (
                                <tfoot className="border-t bg-gray-50/50">
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-4 text-right font-bold uppercase tracking-wider text-sm"
                                        >
                                            Total value
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold tabular-nums">
                                            {formatCurrency(totalValue)}
                                        </td>
                                    </tr>
                                </tfoot>
                            ) : null}
                        </table>
                    </div>

                    <div className="rounded-xl border bg-white p-6">
                        <div className="grid grid-cols-3 gap-6 text-center pt-4">
                            {[
                                'Requested By',
                                'Issuing Officer',
                                'Receiving Officer',
                            ].map((role) => (
                                <div key={role}>
                                    <div className="border-t border-gray-300 pt-2 mt-12" />
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {role}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default SivDetailPage;
