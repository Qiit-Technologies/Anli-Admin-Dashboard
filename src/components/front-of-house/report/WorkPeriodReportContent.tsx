'use client';

import {
    WorkPeriodItemSale,
    WorkPeriodPaymentRow,
    WorkPeriodReportData,
    WorkPeriodTicketCountRow,
} from './types';

function formatReceiptAmount(amount: number): string {
    return amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatReceiptPercent(percent: number): string {
    return `${percent.toFixed(2)}%`;
}

interface ReceiptLineProps {
    readonly label: string;
    readonly value?: string;
    readonly className?: string;
}

const TABLE_COLS = (
    <colgroup>
        <col className="min-w-0" />
        <col className="w-[80px]" />
        <col className="w-[120px]" />
    </colgroup>
);

function ReceiptLine({ label, value, className = '' }: ReceiptLineProps) {
    return (
        <tr className={className}>
            <td className="py-1 break-words align-middle">{label}</td>
            <td className="py-1 text-right tabular-nums w-[80px] align-middle"></td>
            <td className="py-1 text-right tabular-nums w-[120px] align-middle">
                {value}
            </td>
        </tr>
    );
}

function ReceiptLineWithPercent({
    label,
    percent,
    amount,
    className = '',
}: Readonly<{
    label: string;
    percent: number;
    amount: number;
    className?: string;
}>) {
    return (
        <tr className={className}>
            <td className="py-1 break-words align-middle">{label}</td>
            <td className="py-1 text-right tabular-nums w-[80px] align-middle">
                {formatReceiptPercent(percent)}
            </td>
            <td className="py-1 text-right tabular-nums w-[120px] align-middle">
                {formatReceiptAmount(amount)}
            </td>
        </tr>
    );
}

function ReceiptLineWithCount({
    label,
    count,
    amount,
    className = '',
}: Readonly<{
    label: string;
    count: number;
    amount?: number;
    className?: string;
}>) {
    return (
        <tr className={className}>
            <td className="py-1 break-words align-middle">{label}</td>
            <td className="py-1 text-right tabular-nums w-[80px] align-middle">
                {count}
            </td>
            <td className="py-1 text-right tabular-nums w-[120px] align-middle">
                {amount != null ? formatReceiptAmount(amount) : ''}
            </td>
        </tr>
    );
}

interface WorkPeriodReportContentProps {
    readonly data: WorkPeriodReportData | null;
    readonly loading?: boolean;
    readonly businessName?: string;
    readonly location?: string;
}

export default function WorkPeriodReportContent({
    data,
    loading = false,
    businessName: propBusinessName,
    location: propLocation,
}: WorkPeriodReportContentProps) {
    if (loading) {
        return (
            <div className="py-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-6 w-64 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                    <div className="h-32 w-full max-w-md bg-gray-100 rounded animate-pulse mt-6" />
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const businessName = propBusinessName ?? data.businessName;
    const location = propLocation ?? data.location;

    return (
        <div className="py-6 max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm print:border-0 print:shadow-none">
                <div className="text-center mb-4">
                    <div className="font-semibold uppercase tracking-wide">
                        {businessName}
                    </div>
                    <div className="text-muted-foreground uppercase text-xs mt-0.5">
                        {location}
                    </div>
                    <div className="font-semibold mt-3">Work Period Report</div>
                    <div className="text-muted-foreground text-xs mt-1">
                        {data.periodStart}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {data.periodEnd}
                    </div>
                </div>

                <hr className="border-dashed border-gray-300 my-3 print:my-1" />

                <div className="mb-3 print:mb-1">
                    <div className="font-semibold mb-1">Sales</div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            <ReceiptLine
                                label="Ticket"
                                value={formatReceiptAmount(data.ticketSales)}
                            />
                            <ReceiptLine
                                label="GRAND TOTAL"
                                value={formatReceiptAmount(data.grandTotal)}
                            />
                        </tbody>
                    </table>
                </div>

                <hr className="border-dashed border-gray-300 my-3 print:my-1" />

                <div className="mb-3 print:mb-1">
                    <div className="font-semibold mb-1">Payments</div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            {data.payments.map((p: WorkPeriodPaymentRow) => (
                                <ReceiptLineWithPercent
                                    key={p.method}
                                    label={p.method}
                                    percent={p.percent}
                                    amount={p.amount}
                                />
                            ))}
                            <ReceiptLine
                                label="Total"
                                value={formatReceiptAmount(data.totalPayments)}
                            />
                        </tbody>
                    </table>
                </div>

                <hr className="border-dashed border-gray-300 my-3 print:my-1" />

                <div className="mb-3 print:mb-1">
                    <div className="font-semibold mb-2">Ticket Details</div>
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                        Ticket Counts
                    </div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            {data.ticketCounts.map(
                                (row: WorkPeriodTicketCountRow) => (
                                    <ReceiptLineWithCount
                                        key={row.label}
                                        label={row.label}
                                        count={row.count}
                                        amount={
                                            row.amount > 0
                                                ? row.amount
                                                : undefined
                                        }
                                    />
                                ),
                            )}
                            <ReceiptLineWithCount
                                label="Total"
                                count={data.ticketCounts.reduce(
                                    (a, r) => a + r.count,
                                    0,
                                )}
                                amount={data.ticketSales}
                            />
                            <ReceiptLine
                                label="Amount per Ticket"
                                value={formatReceiptAmount(
                                    data.amountPerTicket,
                                )}
                            />
                        </tbody>
                    </table>

                    <div className="font-medium text-xs text-muted-foreground mt-2 mb-1">
                        Order Counts
                    </div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            {data.orderCounts.map(
                                (row: WorkPeriodTicketCountRow) => (
                                    <ReceiptLineWithCount
                                        key={row.label}
                                        label={row.label}
                                        count={row.count}
                                        amount={
                                            row.amount > 0
                                                ? row.amount
                                                : undefined
                                        }
                                    />
                                ),
                            )}
                            <ReceiptLineWithCount
                                label="Total"
                                count={data.orderCounts.reduce(
                                    (a, r) => a + r.count,
                                    0,
                                )}
                                amount={data.grandTotal}
                            />
                            <ReceiptLine
                                label="Orders per Ticket"
                                value={data.ordersPerTicket.toFixed(2)}
                            />
                            <ReceiptLine
                                label="Amount per Order"
                                value={formatReceiptAmount(data.amountPerOrder)}
                            />
                        </tbody>
                    </table>

                    <div className="font-medium text-xs text-muted-foreground mt-2 mb-1">
                        Ticket Counts per State
                    </div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            {data.ticketCountsByState.map((row) => (
                                <ReceiptLineWithCount
                                    key={row.state}
                                    label={row.state}
                                    count={row.count}
                                    amount={row.amount}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                <hr className="border-dashed border-gray-300 my-3 print:my-1" />

                <div className="mb-3 print:mb-1">
                    <div className="font-semibold mb-1">Payment Details</div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            {data.paymentDetails.map(
                                (p: WorkPeriodPaymentRow) => (
                                    <ReceiptLineWithPercent
                                        key={p.method}
                                        label={p.method}
                                        percent={p.percent}
                                        amount={p.amount}
                                    />
                                ),
                            )}
                            <ReceiptLine
                                label="7.5% VAT"
                                value={formatReceiptAmount(data.vatAmount)}
                            />
                        </tbody>
                    </table>

                    <div className="text-muted-foreground text-xs mt-1">
                        Delivery Ticket
                    </div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            <ReceiptLine
                                label="7.5% VAT"
                                value={formatReceiptAmount(
                                    data.deliveryVatAmount,
                                )}
                            />
                        </tbody>
                    </table>
                </div>

                <hr className="border-dashed border-gray-300 my-3 print:my-1" />

                <div className="mb-3 print:mb-1">
                    <div className="font-semibold mb-1">User Sales</div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            {data.userSales.map((u) => (
                                <ReceiptLine
                                    key={u.userName}
                                    label={u.userName}
                                    value={formatReceiptAmount(u.amount)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {data.settledByUser && (
                    <>
                        <div className="mb-3 print:mb-1">
                            <div className="font-semibold mb-1">
                                Settled by {data.settledByUser.userName}
                            </div>
                            <table className="w-full table-fixed">
                                {TABLE_COLS}
                                <tbody>
                                    {data.settledByUser.payments.map(
                                        (p: WorkPeriodPaymentRow) => (
                                            <ReceiptLineWithPercent
                                                key={p.method}
                                                label={p.method}
                                                percent={p.percent}
                                                amount={p.amount}
                                            />
                                        ),
                                    )}
                                    <ReceiptLine
                                        label="Total Income"
                                        value={formatReceiptAmount(
                                            data.settledByUser.totalIncome,
                                        )}
                                    />
                                </tbody>
                            </table>
                        </div>
                        <hr className="border-dashed border-gray-300 my-3 print:my-1" />
                    </>
                )}

                <div className="mb-3 print:mb-1">
                    <div className="font-semibold mb-1">Item Sales</div>
                    <table className="w-full table-fixed">
                        {TABLE_COLS}
                        <tbody>
                            {data.itemSales.map((item: WorkPeriodItemSale) => (
                                <ReceiptLineWithPercent
                                    key={item.category}
                                    label={item.category}
                                    percent={item.percent}
                                    amount={item.amount}
                                />
                            ))}
                            <ReceiptLine
                                label="Total"
                                value={formatReceiptAmount(data.totalItemSales)}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
