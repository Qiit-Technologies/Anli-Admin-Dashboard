'use client';

import type { RankedSellingItem, TopLowSellingItemsReportData } from './types';

function formatAmount(value: number): string {
    return value.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function RankingTable({
    title,
    items,
}: Readonly<{ title: string; items: RankedSellingItem[] }>) {
    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="font-semibold text-gray-900 mb-3">{title}</div>
            {items.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                    No items found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-muted-foreground text-left">
                                <th className="py-2 pr-2 font-medium">#</th>
                                <th className="py-2 pr-2 font-medium">Item</th>
                                <th className="py-2 pr-2 font-medium">
                                    Category
                                </th>
                                <th className="py-2 pr-2 font-medium text-right">
                                    Qty
                                </th>
                                <th className="py-2 font-medium text-right">
                                    Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr
                                    key={`${item.itemId ?? item.itemName}-${index}`}
                                    className="border-b border-gray-50"
                                >
                                    <td className="py-2 pr-2">{index + 1}</td>
                                    <td className="py-2 pr-2">
                                        {item.itemName}
                                    </td>
                                    <td className="py-2 pr-2">
                                        {item.categoryName}
                                    </td>
                                    <td className="py-2 pr-2 text-right tabular-nums">
                                        {item.quantitySold}
                                    </td>
                                    <td className="py-2 text-right tabular-nums">
                                        {formatAmount(item.revenue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

interface TopLowSellingItemsReportContentProps {
    readonly data: TopLowSellingItemsReportData | null;
}

export default function TopLowSellingItemsReportContent({
    data,
}: TopLowSellingItemsReportContentProps) {
    if (!data) return null;

    return (
        <div className="mt-4 rounded-lg border p-4 bg-white">
            <div className="text-center mb-4">
                <div className="font-semibold uppercase tracking-wide">
                    {data.businessName}
                </div>
                <div className="text-muted-foreground uppercase text-xs mt-0.5">
                    {data.location}
                </div>
                <div className="font-semibold mt-2">
                    Top & Low Selling Items Report
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                    {data.periodStart}
                </div>
                <div className="text-muted-foreground text-xs">
                    {data.periodEnd}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                        Distinct Items Sold
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                        {data.totalDistinctItemsSold}
                    </div>
                </div>
                <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                        Total Quantity Sold
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                        {data.totalQuantitySold}
                    </div>
                </div>
                <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                        Total Revenue
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                        {formatAmount(data.totalRevenue)}
                    </div>
                </div>
                <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                        Guests Count
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                        {data.totalGuestsCount}
                    </div>
                </div>
                <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                        Avg Spend / Guest
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                        {formatAmount(data.averageSpendPerGuest)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <RankingTable
                    title="Top Selling by Quantity"
                    items={data.topByQuantity}
                />
                <RankingTable
                    title="Low Selling by Quantity"
                    items={data.lowByQuantity}
                />
                <RankingTable
                    title="Top Selling by Revenue"
                    items={data.topByRevenue}
                />
                <RankingTable
                    title="Low Selling by Revenue"
                    items={data.lowByRevenue}
                />
            </div>
        </div>
    );
}
