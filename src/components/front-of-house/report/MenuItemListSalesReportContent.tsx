'use client';

import type {
    MenuItemListSalesItemRow,
    MenuItemListSalesReportData,
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

function ItemRow({
    item,
    className = '',
}: Readonly<{ item: MenuItemListSalesItemRow; className?: string }>) {
    return (
        <tr className={className}>
            <td className="py-1 break-words max-w-[200px]">{item.itemName}</td>
            <td className="py-1 text-right tabular-nums w-[80px]">
                {item.quantity}
            </td>
            <td className="py-1 text-right tabular-nums w-[80px]">
                {formatReceiptPercent(item.percent)}
            </td>
            <td className="py-1 text-right tabular-nums w-[120px]">
                {formatReceiptAmount(item.amount)}
            </td>
        </tr>
    );
}

interface MenuItemListSalesReportContentProps {
    readonly data: MenuItemListSalesReportData | null;
    readonly loading?: boolean;
}

export default function MenuItemListSalesReportContent({
    data,
    loading = false,
}: MenuItemListSalesReportContentProps) {
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

    return (
        <div className="py-6 max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm print:border-0 print:shadow-none">
                <div className="text-center mb-4">
                    <div className="font-semibold uppercase tracking-wide">
                        {data.businessName}
                    </div>
                    <div className="text-muted-foreground uppercase text-xs mt-0.5">
                        {data.location}
                    </div>
                    <div className="font-semibold mt-3">
                        Menu Item List Sales
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">
                        {data.periodStart}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        {data.periodEnd}
                    </div>
                </div>

                <hr className="border-dashed border-gray-300 my-3 print:my-1" />

                {data.categories.length === 0 ? (
                    <div className="text-muted-foreground text-center py-4">
                        No categories with sales in this period.
                    </div>
                ) : (
                    data.categories.map((cat) => (
                        <div key={cat.categoryName} className="mb-4 print:mb-2">
                            <div className="font-semibold mb-2">
                                {cat.categoryName}
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-muted-foreground border-b border-gray-100 text-left">
                                        <th className="font-medium pb-2">
                                            Item
                                        </th>
                                        <th className="font-medium pb-2 text-right">
                                            Qty
                                        </th>
                                        <th className="font-medium pb-2 text-right">
                                            %
                                        </th>
                                        <th className="font-medium pb-2 text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cat.items.map((item) => (
                                        <ItemRow
                                            key={`${item.itemName}-${item.amount}`}
                                            item={item}
                                        />
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-medium border-t border-dashed border-gray-300">
                                        <td className="pt-2 pb-1" colSpan={3}>
                                            TOTAL ({cat.totalQuantity})
                                        </td>
                                        <td className="pt-2 pb-1 text-right">
                                            {formatReceiptAmount(
                                                cat.totalAmount,
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            <hr className="border-dashed border-gray-300 my-3 print:my-1" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
