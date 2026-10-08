'use client';

import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import {
    calcProteinClosing,
    formatPtnPcs,
    proteinValue,
    type ProteinDayMovement,
} from './types';

function esc(value: string | number): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function money(n: number): string {
    return `₦${Number(n || 0).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Protein Stock Sheet — reproduces the client Excel columns:
 * Item · Opening (PTN/PCS) · New/Received (PTN/PCS) · Issued (PTN/PCS) ·
 * B&D (PTN/PCS) · Closing (PTN/PCS) · U.Price · Value · R.O. Level,
 * with signature lines for the store keeper and manager.
 */
export function buildProteinStockSheetHtml(
    rows: ProteinDayMovement[],
    dateLabel: string,
): string {
    const bodyRows = rows
        .map((row, i) => {
            const closing = calcProteinClosing(row);
            const inPieces = row.inPtn * row.ppp + row.inPcs;
            const outPieces = row.outPtn * row.ppp + row.outPcs;
            const bdPieces = row.bdPtn * row.ppp + row.bdPcs;
            return `
            <tr>
                <td class="num">${i + 1}</td>
                <td class="item">${esc(row.itemName)}<span class="ppp">${row.ppp} pcs/PTN</span></td>
                <td class="num">${esc(formatPtnPcs(row.openingPieces, row.ppp))}</td>
                <td class="num">${esc(formatPtnPcs(inPieces, row.ppp))}</td>
                <td class="num">${esc(formatPtnPcs(outPieces, row.ppp))}</td>
                <td class="num">${esc(formatPtnPcs(bdPieces, row.ppp))}${row.bdReason ? `<span class="ppp">${esc(row.bdReason)}</span>` : ''}</td>
                <td class="num bold">${esc(formatPtnPcs(closing, row.ppp))}</td>
                <td class="num">${money(row.unitCost)}</td>
                <td class="num">${money(proteinValue(closing, row.unitCost))}</td>
                <td class="num">${row.minStock.toLocaleString()} pcs</td>
            </tr>`;
        })
        .join('');

    const totalValue = rows.reduce(
        (sum, row) =>
            sum + proteinValue(calcProteinClosing(row), row.unitCost),
        0,
    );

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 24px; font-size: 11px; }
    .confirmation-doc { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 18px; margin: 0 0 2px; }
    .sub { color: #555; margin: 0 0 12px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #999; padding: 5px 6px; text-align: left; vertical-align: top; }
    th { background: #f2f2f2; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; }
    td.num, th.num { text-align: right; white-space: nowrap; }
    td.item { font-weight: 600; }
    .ppp { display: block; font-weight: 400; color: #555; font-size: 10px; }
    .bold { font-weight: 700; }
    tfoot td { font-weight: 700; background: #f9f9f9; }
    .sigs { display: flex; gap: 32px; margin-top: 36px; }
    .sig { flex: 1; }
    .sig .line { border-top: 1px solid #111; margin-top: 44px; padding-top: 4px; font-size: 11px; }
    .sig .role { color: #555; font-size: 10px; }
</style>
</head>
<body>
<div class="confirmation-doc">
    <h1>Protein Stock Sheet</h1>
    <p class="sub">Working day: ${esc(dateLabel)} · Pieces-and-portions ledger (PTN = portion, PCS = piece)</p>
    <table>
        <thead>
            <tr>
                <th class="num">#</th>
                <th>Item</th>
                <th class="num">Opening</th>
                <th class="num">New (Received)</th>
                <th class="num">Issued</th>
                <th class="num">B&amp;D</th>
                <th class="num">Closing</th>
                <th class="num">U. Price</th>
                <th class="num">Value</th>
                <th class="num">R.O. Level</th>
            </tr>
        </thead>
        <tbody>
            ${bodyRows || '<tr><td colspan="10" style="text-align:center;color:#777">No protein items</td></tr>'}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="8" class="num">Total closing value</td>
                <td class="num">${money(totalValue)}</td>
                <td></td>
            </tr>
        </tfoot>
    </table>
    <div class="sigs">
        <div class="sig"><div class="line">Protein Store Keeper</div><div class="role">Name / Signature / Date</div></div>
        <div class="sig"><div class="line">F&amp;B Controller / Auditor</div><div class="role">Name / Signature / Date</div></div>
        <div class="sig"><div class="line">General Manager</div><div class="role">Name / Signature / Date</div></div>
    </div>
</div>
</body>
</html>`;
}

export async function downloadProteinStockSheetPdf(
    rows: ProteinDayMovement[],
    dateKey: string,
    dateLabel: string,
): Promise<void> {
    const html = buildProteinStockSheetHtml(rows, dateLabel);
    await downloadHtmlDocumentAsPdf(html, `Protein-Stock-Sheet-${dateKey}.pdf`);
}
