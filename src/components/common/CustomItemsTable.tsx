import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { ScrollBar } from '../ui/scroll-area';
import CustomItemTable from './table/CustomItemTable';

interface ItemsTableProps {
    title?: string;
    items: any[];
    showTotal?: boolean;
    totalLabel?: string;
    totalValue?: number;
    className?: string;
    emptyMessage?: string;
    columns?: ColumnDef<any>[];
}

export const CustomItemsTable: React.FC<ItemsTableProps> = ({
    title,
    items,
    showTotal = false,
    totalLabel = 'Total',
    totalValue,
    className = '',
    emptyMessage = 'No items added',
    columns,
}) => {
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
                        <ScrollArea className="max-h-[300px] overflow-y-auto">
                            <CustomItemTable
                                columns={columns ?? []}
                                data={items}
                            />
                            <ScrollBar
                                orientation="vertical"
                                className="!block"
                            />
                        </ScrollArea>
                        {showTotal && (
                            <div className="flex justify-between py-4 bg-white font-semibold">
                                <span>{totalLabel}</span>
                                <span>NGN {totalValue}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
