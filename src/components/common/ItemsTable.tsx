import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { ScrollBar } from '../ui/scroll-area';
import { ItemOrderColumnsNoAction } from './table/column/ItemOrder';
import CustomItemTable from './table/CustomItemTable';

interface Item {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    isReady?: boolean;
}

interface ItemsTableProps {
    title?: string;
    items: Item[];
    showTotal?: boolean;
    totalLabel?: string;
    totalValue?: number;
    className?: string;
    emptyMessage?: string;
    columns?: ColumnDef<Item>[];
    currencyPrefix?: string;
    breakdownRows?: { label: string; value: number | string }[];
    subtotalLabel?: string;
    subtotalValue?: number;
    vatLabel?: string;
    vatRate?: number;
    vatValue?: number;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
    title,
    items,
    showTotal = false,
    totalLabel = 'Total',
    totalValue,
    className = '',
    emptyMessage = 'No items added',
    columns,
    currencyPrefix = 'NGN ',
    breakdownRows,
    subtotalLabel = 'Subtotal',
    subtotalValue,
    vatLabel = 'VAT',
    vatRate,
    vatValue,
}) => {
    const formatAmount = (value?: number | string) => {
        const numericValue = Number(value ?? 0);
        const formatted = Math.abs(numericValue).toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return `${numericValue < 0 ? '-' : ''}${currencyPrefix}${formatted}`;
    };

    const rowsToRender = [
        ...(subtotalValue !== undefined
            ? [{ label: subtotalLabel, value: subtotalValue }]
            : []),
        ...(vatValue !== undefined
            ? [
                  {
                      label:
                          vatRate !== undefined
                              ? `${vatLabel} (${vatRate.toFixed(2)}%)`
                              : vatLabel,
                      value: vatValue,
                  },
              ]
            : []),
        ...(breakdownRows ?? []),
    ];

    return (
        <div className={`mt-4 rounded-lg p-4 border ${className}`}>
            {title && <h1 className="text-lg font-semibold mb-4">{title}</h1>}
            <div className="mt-4">
                {items?.length === 0 ? (
                    <div className="text-center min-h-20 flex items-center justify-center text-sm text-muted-foreground">
                        <div>{emptyMessage}</div>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="max-h-[clamp(220px,36vh,420px)] overflow-y-auto">
                            <CustomItemTable
                                columns={columns ?? ItemOrderColumnsNoAction}
                                data={items}
                            />
                            <ScrollBar
                                orientation="vertical"
                                className="!block"
                            />
                        </ScrollArea>
                        {showTotal && (
                            <div className="mt-4">
                                <div className="max-h-[140px] overflow-y-auto pr-1">
                                    {rowsToRender.map((row) => (
                                        <div
                                            key={row.label}
                                            className="flex justify-between py-1 text-sm text-gray-600"
                                        >
                                            <span>{row.label}</span>
                                            <span>
                                                {formatAmount(row.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="sticky bottom-0 flex justify-between py-4 bg-white font-semibold border-t border-gray-100 mt-2">
                                    <span>{totalLabel}</span>
                                    <span>{formatAmount(totalValue)}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
