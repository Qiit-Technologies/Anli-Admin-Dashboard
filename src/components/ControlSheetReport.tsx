'use client';

import React from 'react';
import { ControlSheetReportData } from '@/types/control-sheet';
import { BankAccount } from '@/app/actions/bank-accounts';
import { formatBankAccountLabel } from '@/lib/utils';

interface ControlSheetReportProps {
    data: ControlSheetReportData;
    bankAccounts: BankAccount[];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export default function ControlSheetReport({
    data,
    bankAccounts,
}: Readonly<ControlSheetReportProps>) {
    const allOtherMethods = new Set<string>();
    const allReceivingAccounts = new Set<string>();

    const bankAccountMap = new Map<string, string>();
    for (const acc of bankAccounts) {
        bankAccountMap.set(acc.accountNumber, formatBankAccountLabel(acc));
    }

    const getReceivingAccountLabel = (acc: string) => bankAccountMap.get(acc) || acc;

    for (const order of data.orders) {
        for (const method of Object.keys(order.otherPaymentMethods)) {
            allOtherMethods.add(method);
        }
        for (const acc of Object.keys(order.receivingAccounts)) {
            allReceivingAccounts.add(acc);
        }
    }

    const sortedOtherMethods = Array.from(allOtherMethods).sort();
    const sortedReceivingAccounts = Array.from(allReceivingAccounts).sort();
    console.log(allReceivingAccounts);
    console.log(data)
    return (
        <div className="control-sheet-doc p-4 text-xs">
            <style>{`
                @page { size: landscape; margin: 5mm; }
                .control-sheet-doc { font-family: Arial, sans-serif; color: #000; width: 100%; margin: 0 auto; font-size: 8px; line-height: 1.1; }
                .control-sheet-doc table { border-collapse: collapse; width: 100%; table-layout: auto; }
                .control-sheet-doc th, .control-sheet-doc td { border: 1px solid #000; padding: 1px 2px; text-align: left; vertical-align: middle; font-size: 7.5px; }
                .control-sheet-doc th { background: #f0f0f0; font-weight: bold; text-align: center; font-size: 7.5px; }
                .control-sheet-doc td.num, .control-sheet-doc th.num { text-align: right; }
                .control-sheet-doc .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
                .control-sheet-doc .company-info { text-align: left; }
                .control-sheet-doc .report-meta { text-align: right; font-size: 8px; }
                .control-sheet-doc .title { font-size: 12px; font-weight: bold; text-align: center; margin: 2px 0; }
                .control-sheet-doc .subtitle { font-size: 9px; text-align: center; margin-bottom: 4px; }
                .control-sheet-doc .wp-details { display: flex; flex-wrap: wrap; gap: 4px; font-size: 8px; margin-bottom: 4px; }
                .control-sheet-doc .wp-details span { background: #e8e8e8; padding: 1px 3px; border-radius: 2px; }
                .control-sheet-doc .summary-section { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
                .control-sheet-doc .summary-box { border: 1px solid #000; padding: 2px 4px; min-width: 80px; }
                .control-sheet-doc .summary-box strong { display: block; font-size: 7px; text-transform: uppercase; }
                .control-sheet-doc .summary-box .value { font-size: 9px; font-weight: bold; }
                @media print {
                    @page { size: landscape; margin: 5mm; }
                    body { margin: 0; }
                    .control-sheet-doc { padding: 2px; width: 100%; font-size: 7.5px; }
                }
            `}</style>

            <div className="header-section">
                <div className="company-info">
                    {data.restaurantLogo && (
                        <img
                            src={data.restaurantLogo}
                            alt="Logo"
                            style={{ height: 30, marginBottom: 2, objectFit: 'contain' }}
                        />
                    )}
                    <div className="text-sm font-bold">
                        {data.restaurantName || data.businessName}
                    </div>
                    {data.businessAddress && (
                        <div className="text-[9px]">{data.businessAddress}</div>
                    )}
                    {(data.businessPhone || data.businessEmail) && (
                        <div className="text-[9px]">
                            {data.businessPhone}
                            {data.businessPhone && data.businessEmail && ' | '}
                            {data.businessEmail}
                        </div>
                    )}
                </div>
                <div className="report-meta">
                    <div><strong>Report:</strong> {data.reportTitle}</div>
                    <div><strong>Business Date:</strong> {data.businessDate}</div>
                    <div><strong>Generated:</strong> {new Date(data.generatedAt).toLocaleString()}</div>
                    <div><strong>Generated By:</strong> {data.generatedBy}</div>
                </div>
            </div>

            <div className="title">{data.reportTitle}</div>
            {data.workPeriod && data.workPeriod.id ? (
                <>
                    <div className="subtitle">
                        Work Period #{data.workPeriod.id} — {data.workPeriod.area}
                    </div>

                    <div className="wp-details">
                        <span>
                            <strong>WP #:</strong> {data.workPeriod.id}
                        </span>
                        <span>
                            <strong>Area:</strong> {data.workPeriod.area}
                        </span>
                        <span>
                            <strong>Opening:</strong> {data.workPeriod.openingTime}
                        </span>
                        {data.workPeriod.closingTime && (
                            <span>
                                <strong>Closing:</strong> {data.workPeriod.closingTime}
                            </span>
                        )}
                        <span>
                            <strong>Duration:</strong> {data.workPeriod.duration}
                        </span>
                        <span>
                            <strong>Status:</strong> {data.workPeriod.status}
                        </span>
                    </div>
                </>
            ) : null}

            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th rowSpan={2} style={{ minWidth: 65 }}>Date &amp; Time</th>
                            <th rowSpan={2} style={{ minWidth: 40 }}>Table / Room</th>
                            <th rowSpan={2} style={{ minWidth: 45 }}>Type</th>
                            <th rowSpan={2} style={{ minWidth: 55 }}>Guest</th>
                            <th rowSpan={2} style={{ minWidth: 55 }}>Created By</th>
                            <th rowSpan={2} style={{ minWidth: 40 }}>Status</th>
                            <th rowSpan={2} style={{ minWidth: 50 }} className="num">Amount</th>
                            <th rowSpan={2} style={{ minWidth: 35 }} className="num">Compl.</th>
                            <th rowSpan={2} style={{ minWidth: 40 }} className="num">Pay Status</th>
                            <th rowSpan={2} style={{ minWidth: 40 }} className="num">Cash</th>
                            <th rowSpan={2} style={{ minWidth: 45 }} className="num">Transfer</th>
                            <th colSpan={2} style={{ minWidth: 70 }} className="num">Card / POS</th>
                            {sortedOtherMethods.map((method) => (
                                <th key={method} rowSpan={2} style={{ minWidth: 45 }} className="num">{method}</th>
                            ))}
                            {sortedReceivingAccounts.map((acc) => (
                                <th key={acc} rowSpan={2} style={{ minWidth: 55 }} className="num">{getReceivingAccountLabel(acc)}</th>
                            ))}
                        </tr>
                        <tr>
                            <th style={{ minWidth: 35 }} className="num">Card</th>
                            <th style={{ minWidth: 35 }} className="num">POS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.orders.map((order) => {
                            const receivingMap: Record<string, number> = {};
                            for (const p of order.payments) {
                                const acc = p.receivingAccount || (order.receivingAccounts ? Object.keys(order.receivingAccounts)[0] : '');
                                if (acc) {
                                    receivingMap[acc] = (receivingMap[acc] || 0) + p.amount;
                                }
                            }
                            for (const acc of Object.keys(order.receivingAccounts)) {
                                receivingMap[acc] = order.receivingAccounts[acc];
                            }

                            return (
                                <tr key={order.orderId}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{order.orderDateTime}</td>
                                    <td>{order.tableRoom}</td>
                                    <td>{order.orderType}</td>
                                    <td>{order.guestName}</td>
                                    <td>{order.createdBy}</td>
                                    <td>{order.orderStatus}</td>
                                    <td className="num">{formatCurrency(order.orderAmount)}</td>
                                    <td className="num">{order.complimentary ? 'Yes' : 'No'}</td>
                                    <td className="num">{order.paymentStatus}</td>
                                    <td className="num">{formatCurrency(order.cash)}</td>
                                    <td className="num">{formatCurrency(order.transfer)}</td>
                                    <td className="num">{formatCurrency(order.card)}</td>
                                    <td className="num">{formatCurrency(order.pos)}</td>
                                    {sortedOtherMethods.map((method) => (
                                        <td key={method} className="num">{formatCurrency(order.otherPaymentMethods[method] || 0)}</td>
                                    ))}
                                    {sortedReceivingAccounts.map((acc) => (
                                        <td key={acc} className="num">{formatCurrency(receivingMap[acc] || 0)}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', background: '#f8f8f8' }}>
                            <td colSpan={6} className="num">Totals</td>
                            <td className="num">{formatCurrency(data.summary.grandTotalSales)}</td>
                            <td className="num">{data.summary.complimentaryOrders}</td>
                            <td></td>
                            <td className="num">{formatCurrency(data.summary.cashTotal)}</td>
                            <td className="num">{formatCurrency(data.summary.transferTotal)}</td>
                            <td className="num">{formatCurrency(data.summary.cardTotal)}</td>
                            <td className="num">{formatCurrency(data.summary.posTotal)}</td>
                            {sortedOtherMethods.map((method) => (
                                <td key={method} className="num">{formatCurrency(data.summary.otherPaymentTotals[method] || 0)}</td>
                            ))}
                            {sortedReceivingAccounts.map((acc) => (
                                <td key={acc} className="num">{formatCurrency(data.summary.receivingAccountTotals[acc] || 0)}</td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="summary-section">
                <div className="summary-box">
                    <strong>Total Orders</strong>
                    <div className="value">{data.summary.totalOrders}</div>
                </div>
                <div className="summary-box">
                    <strong>Complimentary Orders</strong>
                    <div className="value">{data.summary.complimentaryOrders}</div>
                </div>
                <div className="summary-box">
                    <strong>Grand Total Sales</strong>
                    <div className="value">{formatCurrency(data.summary.grandTotalSales)}</div>
                </div>
                <div className="summary-box">
                    <strong>Complimentary Total</strong>
                    <div className="value">{formatCurrency(data.summary.complimentaryTotal)}</div>
                </div>
                <div className="summary-box">
                    <strong>Cash Total</strong>
                    <div className="value">{formatCurrency(data.summary.cashTotal)}</div>
                </div>
                <div className="summary-box">
                    <strong>Transfer Total</strong>
                    <div className="value">{formatCurrency(data.summary.transferTotal)}</div>
                </div>
                <div className="summary-box">
                    <strong>Card Total</strong>
                    <div className="value">{formatCurrency(data.summary.cardTotal)}</div>
                </div>
                <div className="summary-box">
                    <strong>POS Total</strong>
                    <div className="value">{formatCurrency(data.summary.posTotal)}</div>
                </div>
                <div className="summary-box">
                    <strong>Total Revenue</strong>
                    <div className="value">{formatCurrency(data.summary.totalRevenue)}</div>
                </div>
            </div>

            {sortedReceivingAccounts.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 8 }}>
                    <strong>Receiving Account Totals:</strong>
                    {sortedReceivingAccounts.map((acc) => (
                        <span key={acc} style={{ marginLeft: 6 }}>
                            {getReceivingAccountLabel(acc)}: {formatCurrency(data.summary.receivingAccountTotals[acc] || 0)}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
