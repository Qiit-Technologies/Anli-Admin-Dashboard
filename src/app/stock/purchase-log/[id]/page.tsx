'use client';

import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { getPurchaseLog } from '@/app/actions/stock';
import { format } from 'date-fns';

const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

const buildGrnPdfHtml = (log: any, items: any[]) => {
    const rows = items
        .map((item: any, index: number) => {
            return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.item?.name || item.name || 'Item')}<br><small>${escapeHtml(item.outerUnit || 'Outer')} → ${escapeHtml(item.baseUnit || 'Base')}</small></td>
        <td>${escapeHtml(item.itemLocation || '—')}</td>
        <td>${escapeHtml(item.supplierName || log.supplierName || '—')}</td>
        <td class="num">${Number(item.quantityOuter || 0).toLocaleString()}</td>
        <td class="num">${Number(item.quantityBase || 0).toLocaleString()}</td>
        <td class="num">₦${Number(item.costPerOuter || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
        <td class="num">₦${Number(item.totalCost || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
      </tr>`;
        })
        .join('');
    const itemsSubtotal = items.reduce(
        (s: number, i: any) => s + Number(i.totalCost || 0),
        0,
    );
    const misc = Number(log?.miscellaneousExpense || 0);
    const grandTotal = Number(log?.totalCost ?? itemsSubtotal + misc);
    return `
<!DOCTYPE html>
<html><head><title>GRN ${escapeHtml(log.logId || log.id)}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#111}
h1{font-size:20px;margin-bottom:2px;text-align:center}
.sub{text-align:center;font-size:13px;color:#555;margin-bottom:16px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;font-size:12px;margin-bottom:16px}
.meta span{color:#555}.meta b{color:#111}
table{width:100%;border-collapse:collapse;font-size:11px}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
th{background:#f5f5f5}.num{text-align:right}
.total{text-align:right;font-size:13px;margin-top:8px}
.sign{margin-top:36px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;font-size:12px}
.sign div{border-top:1px solid #999;padding-top:4px}
</style></head>
<body>
<h1>GOODS RECEIVED NOTE</h1>
<p class="sub">Purchase Log Receipt — ${escapeHtml(log.logId || '')}</p>
<div class="meta">
<p><span>GRN No.:</span> <b>${escapeHtml(log.logId || `#${log.id}`)}</b></p>
<p><span>Purchase Date:</span> <b>${log.purchaseDate || log.createdAt ? format(new Date(log.purchaseDate || log.createdAt), 'dd MMM yyyy') : '—'}</b></p>
<p><span>Supplier:</span> <b>${escapeHtml(log.supplierName || items[0]?.supplierName || '—')}</b></p>
<p><span>Invoice No.:</span> <b>${escapeHtml(log.invoiceNumber || log.invoiceNo || '—')}</b></p>
<p><span>Receiving Dept:</span> <b>${escapeHtml(log.receivingDepartment || log.department || '—')}</b></p>
<p><span>Receiving Officer:</span> <b>${escapeHtml(log.receivingOfficer?.fullName || log.receivingOfficer || log.receivedBy?.fullName || log.receivedBy || '—')}</b></p>
<p><span>Total Items:</span> <b>${log.totalItems ?? items.length}</b></p>
<p><span>Received By:</span> <b>${escapeHtml(log.receivedBy?.fullName || log.receivedBy || '—')}</b></p>
</div>
<table><thead><tr><th>#</th><th>Item</th><th>Dept</th><th>Supplier</th><th class="num">Qty (outer)</th><th class="num">Qty (base)</th><th class="num">Cost/outer</th><th class="num">Line total</th></tr></thead>
<tbody>${rows || '<tr><td colspan="8">No items</td></tr>'}</tbody></table>
<p class="total">Items subtotal: ₦${itemsSubtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br>
Miscellaneous: ₦${misc.toLocaleString(undefined, { maximumFractionDigits: 2 })}<br>
<b>Grand total: ₦${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></p>
${log.remarks ? `<p style="font-size:12px;color:#555"><b>Remarks:</b> ${escapeHtml(log.remarks)}</p>` : ''}
<div class="sign"><div>Received By</div><div>Checked By</div><div>Approved By</div></div>
</body></html>`;
};

const PurchaseLogDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: logResponse, isLoading } = useSWR(
        id ? `/items/purchase-logs/${id}` : null,
        () => getPurchaseLog(id),
    );

    const log = logResponse?.data;
    const items = Array.isArray(log?.items) ? log.items : [];
    const itemsSubtotal = items.reduce(
        (sum: number, item: any) => sum + Number(item.totalCost || 0),
        0,
    );
    const misc = Number(log?.miscellaneousExpense || 0);
    const grandTotal = Number(log?.totalCost ?? itemsSubtotal + misc);

    const handleDownloadPdf = async () => {
        if (!log) return;
        setIsDownloading(true);
        try {
            await downloadHtmlDocumentAsPdf(
                buildGrnPdfHtml(log, items),
                `GRN-${log.logId || id}.pdf`,
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="flex justify-center items-center h-64">
                    <p>Loading purchase log details...</p>
                </div>
            </PageWrapper>
        );
    }

    if (!log) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-destructive font-medium">
                        Purchase log not found.
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="bg-white">
            <div className="print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </button>
                <PageHeader>
                    <PageHeadertitle
                        title="Purchase Log Details"
                        subtitle="View and print the complete goods receiving receipt"
                    />
                </PageHeader>
            </div>

            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold tracking-tight uppercase">
                        Goods Receiving Register
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Purchase Log Receipt
                    </p>
                    <div className="w-full max-w-sm mx-auto h-px bg-border mt-4" />
                </div>

                <div className="rounded-xl border border-gray-200 p-8 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                GRN No.
                            </p>
                            <p className="font-medium text-foreground">
                                {log.logId}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Purchase Date
                            </p>
                            <p className="font-medium text-foreground">
                                {format(
                                    new Date(
                                        log.purchaseDate || log.createdAt,
                                    ),
                                    'dd MMMM yyyy',
                                )}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Supplier
                            </p>
                            <p className="font-medium text-foreground">
                                {log.supplierName ||
                                    items[0]?.supplierName ||
                                    '—'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Invoice No.
                            </p>
                            <p className="font-medium text-foreground">
                                {log.invoiceNumber || log.invoiceNo || '—'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Receiving Department
                            </p>
                            <p className="font-medium text-foreground capitalize">
                                {log.receivingDepartment ||
                                    log.department ||
                                    '—'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Receiving Officer
                            </p>
                            <p className="font-medium text-foreground">
                                {log.receivingOfficer?.fullName ||
                                    log.receivingOfficer ||
                                    log.receivedBy?.fullName ||
                                    log.receivedBy ||
                                    '—'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Items
                            </p>
                            <p className="font-medium text-foreground">
                                {log.totalItems ?? items.length}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Received By
                            </p>
                            <p className="font-medium text-foreground">
                                {log.receivedBy?.fullName ||
                                    log.receivedBy ||
                                    '---'}
                            </p>
                        </div>
                    </div>
                    {log.remarks ? (
                        <div className="space-y-1 pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Remarks
                            </p>
                            <p className="text-sm font-medium text-foreground">
                                {log.remarks}
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50/50 px-8 py-4 border-b">
                        <h3 className="text-sm font-bold text-foreground">
                            Purchased Items
                        </h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-4 py-4">Department</th>
                                <th className="px-4 py-4">Supplier</th>
                                <th className="px-4 py-4 text-right">
                                    Qty (outer)
                                </th>
                                <th className="px-4 py-4 text-right">
                                    Qty (base)
                                </th>
                                <th className="px-4 py-4 text-right">
                                    Cost / outer
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Line total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.length > 0 ? (
                                items.map((item: any, index: number) => (
                                    <tr key={item.id || index}>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">
                                                {item.item?.name ||
                                                    item.name ||
                                                    'Item'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.outerUnit || 'Outer'} →{' '}
                                                {item.baseUnit || 'Base'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 font-medium capitalize">
                                            {item.itemLocation || '—'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {item.supplierName || '—'}
                                        </td>
                                        <td className="px-4 py-4 text-right tabular-nums">
                                            {Number(
                                                item.quantityOuter || 0,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right tabular-nums">
                                            {Number(
                                                item.quantityBase || 0,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right tabular-nums">
                                            {formatCurrency(
                                                Number(item.costPerOuter || 0),
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium tabular-nums">
                                            {formatCurrency(
                                                Number(item.totalCost || 0),
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-8 py-5 text-center text-muted-foreground"
                                    >
                                        No item details available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="border-t bg-white">
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-3 text-right text-muted-foreground"
                                >
                                    Items subtotal
                                </td>
                                <td className="px-6 py-3 text-right tabular-nums font-medium">
                                    {formatCurrency(itemsSubtotal)}
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-3 text-right text-muted-foreground"
                                >
                                    Miscellaneous
                                </td>
                                <td className="px-6 py-3 text-right tabular-nums font-medium">
                                    {formatCurrency(misc)}
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-4 text-right font-bold uppercase tracking-wider"
                                >
                                    Grand total
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-lg tabular-nums">
                                    {formatCurrency(grandTotal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="text-center space-y-2 mt-8">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        Generated by Inventory Management System
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(
                            new Date(log.createdAt),
                            'dd/MM/yyyy, HH:mm:ss',
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-8 print:hidden">
                    <Button
                        className="flex-1 h-12 bg-orion-blue hover:bg-orion-blue/90 font-semibold gap-2 rounded-lg"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4" />
                        Print Receipt
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-12 font-semibold gap-2 rounded-lg"
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        <Download className="h-4 w-4" />
                        {isDownloading ? 'Preparing…' : 'Download PDF'}
                    </Button>
                    <Button
                        variant="secondary"
                        className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-foreground font-semibold rounded-lg"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </PageWrapper>
    );
};

export default PurchaseLogDetailPage;
