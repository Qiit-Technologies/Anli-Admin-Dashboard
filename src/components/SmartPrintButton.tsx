'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSimplePrint } from '@/hooks/useSimplePrint';
import { AlertCircle, Loader2, Printer } from 'lucide-react';
import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { ScopedOrder } from './front-of-house/types';
import { splitOrderItemsByType } from './front-of-house/utils';
import Toast from './toast';

interface SmartPrintButtonProps {
    order: ScopedOrder;
    printType: 'kot' | 'bot';
    newItemsOnly?: boolean;
    printerName?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
    children?: React.ReactNode;
}

export function SmartPrintButton({
    order,
    printType,
    newItemsOnly = false,
    printerName,
    variant = 'outline',
    size = 'sm',
    children,
}: Readonly<SmartPrintButtonProps>) {
    const { printKOT, printBOT, isLoading } = useSimplePrint();

    const itemAnalysis = useMemo(() => {
        const { foodItems, drinkItems } = splitOrderItemsByType(
            order.items as any,
        );

        const relevantItems = printType === 'kot' ? foodItems : drinkItems;
        const newItems = relevantItems.filter(
            (item) => item.isNewlyAdded && !item.lastPrintedAt,
        );

        const sortedItems = relevantItems
            .filter((item) => item.isNewlyAdded)
            .sort((a, b) => {
                const aTime = new Date(
                    a.lastPrintedAt || a.menuItem?.createdAt || 0,
                ).getTime();
                const bTime = new Date(
                    b.lastPrintedAt || b.menuItem?.createdAt || 0,
                ).getTime();
                return bTime - aTime;
            });

        const lastAddedItems =
            sortedItems.length > 0 ? sortedItems : relevantItems.slice(-1); // Fallback to last item
        const allItems = relevantItems;

        return {
            hasItems: allItems.length > 0,
            hasNewItems: newItems.length > 0,
            hasLastAddedItems: lastAddedItems.length > 0,
            newItemsCount: newItems.length,
            lastAddedItemsCount: lastAddedItems.length,
            totalItemsCount: allItems.length,
            newItems,
            lastAddedItems,
            allItems,
        };
    }, [order.items, printType]);

    const handlePrint = async () => {
        if (!itemAnalysis.hasItems) {
            toast.custom(() => (
                <Toast
                    title="No Items"
                    description={`This order has no ${printType === 'kot' ? 'food' : 'drink'} items.`}
                    type="info"
                />
            ));
            return;
        }

        let shouldPrintNewOnly = newItemsOnly;
        if (newItemsOnly && !itemAnalysis.hasNewItems) {
            toast.custom(() => (
                <Toast
                    title="Nothing new to print"
                    description={`No new ${printType === 'kot' ? 'food' : 'drink'} items. Use Print All to reprint.`}
                    type="info"
                />
            ));
            return;
        }

        const finalPrinterName = printerName || undefined;

        try {
            if (printType === 'kot') {
                await printKOT(order.id, shouldPrintNewOnly, finalPrinterName);
            } else {
                await printBOT(order.id, shouldPrintNewOnly, finalPrinterName);
            }
        } catch (error: any) {
            console.error('Print error:', error);
        }
    };

    const getButtonText = () => {
        if (children) return children;

        const itemType = printType === 'kot' ? 'KOT' : 'BOT';

        if (newItemsOnly) {
            if (itemAnalysis.hasNewItems) {
                return `Print ${itemType} (${itemAnalysis.newItemsCount} new)`;
            } else if (itemAnalysis.hasLastAddedItems) {
                return `Print ${itemType} (${itemAnalysis.lastAddedItemsCount} last)`;
            } else {
                return `Print ${itemType}`;
            }
        }

        return `Print All ${itemType} (${itemAnalysis.totalItemsCount})`;
    };

    const getButtonState = () => {
        if (!itemAnalysis.hasItems) {
            return {
                disabled: true,
                variant: 'ghost' as const,
                title: `No ${printType === 'kot' ? 'food' : 'drink'} items in this order`,
            };
        }

        return {
            disabled: false,
            variant: variant,
            title: undefined,
        };
    };

    const buttonState = getButtonState();

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={buttonState.variant}
                size={size}
                onClick={handlePrint}
                disabled={isLoading || buttonState.disabled}
                className="flex items-center gap-2"
                title={buttonState.title}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : buttonState.disabled ? (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                ) : (
                    <Printer className="h-4 w-4" />
                )}
                {getButtonText()}
            </Button>

            {newItemsOnly && (
                <Badge
                    variant={itemAnalysis.hasNewItems ? 'default' : 'secondary'}
                    className="text-xs"
                >
                    {itemAnalysis.hasNewItems
                        ? `${itemAnalysis.newItemsCount} new`
                        : itemAnalysis.hasLastAddedItems
                          ? `${itemAnalysis.lastAddedItemsCount} last`
                          : 'No items'}
                </Badge>
            )}
        </div>
    );
}
