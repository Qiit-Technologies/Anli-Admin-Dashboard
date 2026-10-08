'use client';

import { getItemHourlySalesBreakdown } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import BrandButton from '@/components/common/Button';
import CustomTable from '@/components/common/table/CustomTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/context/useUser';
import { downloadData } from '@/lib/downloadData';
import { formatCurrency } from '@/lib/utils';
import { Download, Inbox, Printer, RefreshCcw } from 'lucide-react';

function getOrderStatus(status: string) {
    // also add colors
    switch (status) {
        case 'PENDING':
            return <span className="text-yellow-500">Pending</span>;
        case 'IN_KITCHEN':
            return <span className="text-yellow-500">In Kitchen</span>;
        case 'READY':
            return <span className="text-orion-blue">Ready</span>;
        case 'COMPLETED':
            return <span className="text-green-500">Completed</span>;
        case 'CANCELLED':
            return <span className="text-red-500">Cancelled</span>;
        default:
            return <span className="text-gray-500">Unknown</span>;
    }
}
export default TimeWiseSalesReportPage;

function TimeWiseSalesReportPage() {
    const toYYYYMMDD = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate())
            .toISOString()
            .slice(0, 10);

    const toHHMM = (d: Date) =>
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const [startDate, setStartDate] = useState<string>(toYYYYMMDD(new Date()));
    const [startTime, setStartTime] = useState<string>(toHHMM(new Date()));
    const [endDate, setEndDate] = useState<string>(toYYYYMMDD(new Date()));
    const [endTime, setEndTime] = useState<string>(toHHMM(new Date()));

    const [menuType, setMenuType] = useState<'All' | 'Food' | 'Drink'>('All');
    const [includeCancelled, setIncludeCancelled] = useState<boolean>(false);

    const toLocalISO = (date: string, time: string) => {
        const [yyyy, mm, dd] = date.split('-').map(Number);
        const [hh, min] = time.split(':').map(Number);
        const dt = new Date(
            yyyy,
            (mm as number) - 1,
            dd as number,
            hh as number,
            min as number,
            0,
        );
        return dt.toISOString();
    };

    const [query, setQuery] = useState<{
        startDate?: string;
        endDate?: string;
        menuType?: string;
        includeCancelled?: boolean;
    } | null>(null);

    const swrKey = query?.startDate
        ? `/orders/item-hourly-sales-breakdown?startDate=${query.startDate}&endDate=${query.endDate}&menuType=${query.menuType ?? ''}&includeCancelled=${query.includeCancelled ?? false}`
        : null;

    const { data, isLoading } = useSWR(swrKey, async () => {
        const res = await getItemHourlySalesBreakdown({
            startDate: query?.startDate,
            endDate: query?.endDate,
            menuType: query?.menuType,
            includeCancelled: query?.includeCancelled,
        });
        return Array.isArray(res?.data) ? res.data : [];
    });
    const hasData = Array.isArray(data) && data.length > 0;
    const { user } = useUser();

    const to12Hour = (hhmm: string) => {
        const [hStr, m] = hhmm.split(':');
        let h = parseInt(hStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
    };

    const totals = useMemo(() => {
        const rows = Array.isArray(data) ? data : [];
        let drink = 0;
        let food = 0;
        let shift = 0;
        for (const r of rows) {
            const tp = Number(r?.totalPrice || 0);
            if (r?.menuType === 'Drink') drink += tp;
            if (r?.menuType === 'Food') food += tp;
            shift += tp;
        }
        return { drink, food, shift };
    }, [data]);

    const formatLongDate = (d: Date) =>
        d.toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                accessorKey: 'sn',
                header: 'S/N',
                cell: ({ row }) => <span>{row.index + 1}</span>,
            },
            {
                accessorKey: 'item',
                header: 'Items',
                cell: ({ row }) => <span>{row.original.item}</span>,
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
                cell: ({ row }) => <span>{row.original.quantity}</span>,
            },
            {
                accessorKey: 'unitPrice',
                header: 'Unit Price',
                cell: ({ row }) => (
                    <span>{formatCurrency(row.original.unitPrice || 0)}</span>
                ),
            },
            {
                accessorKey: 'totalPrice',
                header: 'Total Price',
                cell: ({ row }) => (
                    <span>{formatCurrency(row.original.totalPrice || 0)}</span>
                ),
            },
            {
                accessorKey: 'staffName',
                header: 'Staff Name',
                cell: ({ row }) => <span>{row.original.staffName ?? '—'}</span>,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <span>{getOrderStatus(row.original.status)}</span>
                ),
            },
        ],
        [],
    );

    const handleGenerate = () => {
        const startISO = toLocalISO(startDate, startTime);
        const endISO = toLocalISO(endDate, endTime);
        setQuery({
            startDate: startISO,
            endDate: endISO,
            menuType: menuType !== 'All' ? menuType : undefined,
            includeCancelled,
        });
    };

    const handleExportExcel = () => {
        const rows = Array.isArray(data) ? data : [];
        const filename = `Time-wise Item Sales (${startDate} ${startTime} - ${endDate} ${endTime})`;

        const exportRows = rows.map((r: any, idx: number) => ({
            's/n': idx + 1,
            item: r.item ?? '',
            quantity: r.quantity ?? 0,
            unitPrice: r.unitPrice ?? 0,
            totalPrice: r.totalPrice ?? 0,
            staffName: r.staffName ?? '',
        }));

        downloadData(exportRows, 'xlsx', filename);
    };

    const handlePrint = () => {
        const rows = Array.isArray(data) ? data : [];
        const title = 'Time-wise Item Sales Report';
        const period = `From: ${formatLongDate(new Date(startDate))} ${to12Hour(startTime)} — To: ${formatLongDate(new Date(endDate))} ${to12Hour(endTime)}${menuType !== 'All' ? ` | Menu: ${menuType}` : ''}${includeCancelled ? ' | Including Cancelled Orders' : ''}`;
        const win = window.open('', '_blank');
        if (!win) return;

        const tableRows = rows
            .map(
                (r: any, idx: number) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${r.item ?? ''}</td>
                <td>${r.quantity ?? 0}</td>
                <td>${formatCurrency(r.unitPrice ?? 0)}</td>
                <td>${formatCurrency(r.totalPrice ?? 0)}</td>
                <td>${r.staffName ?? ''}</td>
            </tr>
        `,
            )
            .join('');

        const createdBy = user?.fullName ?? '—';

        const html = `
            <!doctype html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { margin: 0 0 6px 0; font-size: 20px; }
                    .meta { margin-bottom: 12px; color: #666; font-size: 13px; }
                    table { width: 100%; border-collapse: collapse; font-size: 13px; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background: #f8f8f8; text-align: left; }
                    .summary { margin: 10px 0 8px 0; font-size: 13px; }
                    .summary .row { display: flex; gap: 16px; flex-wrap: wrap; }
                    .summary .item { background: #f9fafb; border: 1px solid #eee; padding: 8px 10px; border-radius: 6px; }
                    .footer { margin-top: 10px; font-size: 12px; color: #777; }
                    .footer div { margin-top: 2px; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="meta">${period}</div>
                <div class="summary">
                    <div class="row">
                        <div class="item">Total Sales (Drink): <strong>${formatCurrency(totals.drink)}</strong></div>
                        <div class="item">Total Sales (Food): <strong>${formatCurrency(totals.food)}</strong></div>
                        <div class="item">Total Sales (Shift): <strong>${formatCurrency(totals.shift)}</strong></div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>S/N</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                            <th>Staff Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class="footer">
                    <div>Generated on ${formatLongDate(new Date())}</div>
                    <div>Created By: ${createdBy}</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        win.document.write(html);
        win.document.close();
        win.focus();
    };

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Time-wise Sales Report"
                        subtitle=""
                    />
                </div>
            </PageHeader>

            <div className="flex flex-col w-full gap-2 rounded-lg border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                    <div className="flex items-center gap-2">
                        <div>Start From:</div>
                        <div className="md:col-span-1">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div>To Date:</div>
                        <div className="md:col-span-1">
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <hr className="my-3" />
                <div className="flex items-center gap-2">
                    <div className="md:col-span-1">
                        <Select
                            value={menuType}
                            onValueChange={(value) =>
                                setMenuType(value as 'All' | 'Food' | 'Drink')
                            }
                        >
                            <SelectTrigger className="w-full min-w-[120px]">
                                <SelectValue placeholder="Menu Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Drink">Drink</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-1 flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeCancelled}
                                onChange={(e) =>
                                    setIncludeCancelled(e.target.checked)
                                }
                                className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm">
                                Include Cancelled Orders
                            </span>
                        </label>
                    </div>
                    <div className="md:col-span-1 flex items-center gap-2">
                        <BrandButton
                            onClick={handleGenerate}
                            loading={isLoading}
                            icon={<RefreshCcw size={16} />}
                        >
                            Generate
                        </BrandButton>
                        <Button
                            onClick={handlePrint}
                            variant={'outline'}
                            className="border-orion-blue text-orion-blue"
                            disabled={!hasData}
                        >
                            <Printer size={16} className="mr-2" />
                            Print
                        </Button>
                        <Button
                            onClick={handleExportExcel}
                            variant={'outline'}
                            className="border-orion-blue text-orion-blue"
                            disabled={!hasData}
                        >
                            <Download size={16} className="mr-2" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground mt-1">
                    From: {formatLongDate(new Date(startDate))}{' '}
                    {to12Hour(startTime)} &nbsp;|&nbsp; To:{' '}
                    {formatLongDate(new Date(endDate))} {to12Hour(endTime)}{' '}
                    &nbsp;|&nbsp; Staff: All
                    {includeCancelled && ' | Including Cancelled Orders'}
                </div>

                {hasData && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-lg border p-3">
                            <div className="text-muted-foreground">
                                Total Sales (Drink)
                            </div>
                            <div className="text-lg font-semibold">
                                {formatCurrency(totals.drink)}
                            </div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="text-muted-foreground">
                                Total Sales (Food)
                            </div>
                            <div className="text-lg font-semibold">
                                {formatCurrency(totals.food)}
                            </div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="text-muted-foreground">
                                Total Sales (Shift)
                            </div>
                            <div className="text-lg font-semibold">
                                {formatCurrency(totals.shift)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {hasData ? (
                <CustomTable
                    hasHeader
                    title="Item Sales (Time-wise)"
                    columns={columns}
                    data={data ?? []}
                    isPaginated
                />
            ) : (
                !isLoading && (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                        <Inbox size={40} className="mb-3 text-gray-400" />
                        <div className="font-medium text-gray-700">
                            No results found
                        </div>
                        <div className="mt-1 text-sm">
                            Select a timeframe and click Generate to see item
                            sales.
                        </div>
                    </div>
                )
            )}

            {isLoading && (
                <div className="mt-4 text-sm text-muted-foreground">
                    Loading report...
                </div>
            )}

            <div className="mt-6 text-sm">
                Report created on: {formatLongDate(new Date())}
            </div>
            <div className="mt-1 text-sm">
                Created By: {user?.fullName ?? '—'}
            </div>
        </PageWrapper>
    );
}
