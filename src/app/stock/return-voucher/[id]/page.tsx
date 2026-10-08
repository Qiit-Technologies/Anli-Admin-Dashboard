'use client';

import { getReturnVoucher } from '@/app/actions/stock';
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
import {
    ReturnVoucher,
    ReturnVoucherLine,
    rtvNumber,
    rtvDate,
    rtvFromDepartment,
    rtvReceivedBy,
    rtvLines,
    lineName,
    lineQty,
    lineUnit,
    lineUnitPrice,
    lineValue,
    rtvTotalValue,
} from '../types';

const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

const buildRtvPdfHtml = (rtv: ReturnVoucher, lines: ReturnVoucherLine[]) => {
    const rtvNo = rtvNumber(rtv);
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
        <td class="num">₦${lineValue(line).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
        <td>${escapeHtml(line.reason || '—')}</td>
      </tr>`;
        })
        .join('');
    const totalValue = rtvTotalValue(rtv);
    const d = rtvDate(rtv);
    return `
<!DOCTYPE html>
<html>
<head><title>Return Voucher ${escapeHtml(rtvNo)}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#111}
h1{font-size:20px;margin-bottom:2px}h2{font-size:13px;font-weight:normal;color:#555;margin:0 0 16px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;margin-bottom:16px}
.meta span{color:#555}.meta b{color:#111}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
th{background:#f5f5f5}.num{text-align:right}
.total{margin-top:12px;font-weight:bold;text-align:right;font-size:13px}
.sign{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:12px}
.sign div{border-top:1px solid #999;padding-top:4px}
</style></head>
<body>
<h1>Return Voucher</h1>
<h2>${escapeHtml(rtvNo)}</h2>
<div class="meta">
<p><span>RTV No.:</span> <b>${escapeHtml(rtvNo)}</b></p>
<p><span>Return Date:</span> <b>${d ? format(new Date(d), 'dd MMM yyyy') : '—'}</b></p>
<p><span>From Department:</span> <b>${escapeHtml(rtvFromDepartment(rtv))}</b></p>
<p><span>Received By:</span> <b>${escapeHtml(rtvReceivedBy(rtv))}</b></p>
<p><span>Status:</span> <b>${escapeHtml(rtv.status || '—')}</b></p>
</div>
<table><thead><tr><th>#</th><th>Item</th><th>UoM</th><th class="num">Qty Returned</th><th class="num">Unit Price</th><th class="num">Value</th><th>Reason</th></tr></thead>
<tbody>${rows || '<tr><td colspan="7">No line items</td></tr>'}</tbody></table>
<div class="total">Total value: ₦${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
${rtv.remarks ? `<p style="font-size:12px;color:#555;margin-top:16px"><b>Remarks:</b> ${escapeHtml(rtv.remarks)}</p>` : ''}
<div class="sign"><div>Returning Department</div><div>Store Officer</div></div>
</body></html>`;
};

const ReturnVoucherDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: rtvResponse, isLoading } = useSWR(
        id ? `/items/return-vouchers/${id}` : null,
        () => getReturnVoucher(id),
    );

    const rtv: ReturnVoucher | undefined = rtvResponse?.data;
    const lines = useMemo(() => rtvLines(rtv ?? ({} as ReturnVoucher)), [rtv]);
    const totalValue = useMemo(
        () => (rtv ? rtvTotalValue(rtv) : 0),
        [rtv],
    );
    const rtvNo = rtv ? rtvNumber(rtv) : '';

    const handleDownloadPdf = async () => {
        if (!rtv) return;
        setIsDownloading(true);
        try {
            await downloadHtmlDocumentAsPdf(
                buildRtvPdfHtml(rtv, lines),
                `RTV-${rtvNo}.pdf`,
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="flex justify-center items-center h-64">
                    <p>Loading return voucher…</p>
                </div>
            </PageWrapper>
        );
    }

    if (rtvResponse?.error || !rtv) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-destructive font-medium">
                        {rtvResponse?.error || 'Return voucher not found.'}
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </PageWrapper>
        );
    }

    const d = rtvDate(rtv);
    const metaFields: Array<[string, string]> = [
        ['RTV No.', rtvNo],
        ['Return Date', d ? format(new Date(d), 'dd MMMM yyyy') : '—'],
        ['From Department', rtvFromDepartment(rtv)],
        ['Received By', rtvReceivedBy(rtv)],
        ['Status', rtv.status || '—'],
    ];

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <div className="px-6 pt-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Return Vouchers
                </button>
            </div>
            <PageHeader>
                <PageHeadertitle
                    title={`Return Voucher — ${rtvNo}`}
                    subtitle="Full-page RTV detail (FRD §10): list → detail → PDF."
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

                    {rtv.remarks ? (
                        <div className="rounded-xl border bg-white p-6">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Remarks
                            </p>
                            <p className="text-sm">{rtv.remarks}</p>
                        </div>
                    ) : null}

                    <div className="rounded-xl border bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50/50">
                            <h3 className="text-sm font-bold">
                                Returned Items ({lines.length})
                            </h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                                <tr>
                                    <th className="px-6 py-4 w-10">#</th>
                                    <th className="px-4 py-4">Item</th>
                                    <th className="px-4 py-4">UoM</th>
                                    <th className="px-4 py-4 text-right">
                                        Qty Returned
                                    </th>
                                    <th className="px-4 py-4 text-right">
                                        Unit Price
                                    </th>
                                    <th className="px-4 py-4 text-right">
                                        Value
                                    </th>
                                    <th className="px-6 py-4">Reason</th>
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
                                            <td className="px-4 py-4 text-right font-medium tabular-nums">
                                                {formatCurrency(
                                                    lineValue(line),
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {line.reason || '—'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
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
                                        <td />
                                    </tr>
                                </tfoot>
                            ) : null}
                        </table>
                    </div>

                    <div className="rounded-xl border bg-white p-6">
                        <div className="grid grid-cols-2 gap-6 text-center pt-4">
                            {['Returning Department', 'Store Officer'].map(
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

export default ReturnVoucherDetailPage;
