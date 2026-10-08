import {
    printOrderBOT,
    printOrderKOT,
    printOrderReceipt,
} from '@/lib/simplePrint';
import { useState } from 'react';
import { toast } from 'sonner';

export function useSimplePrint() {
    const [isLoading, setIsLoading] = useState(false);

    const printKOT = async (
        orderId: number,
        newItemsOnly: boolean = false,
        printerName?: string,
    ) => {
        setIsLoading(true);
        try {
            const result = await printOrderKOT(
                orderId,
                newItemsOnly,
                printerName,
            );

            if (result.success) {
                if (newItemsOnly) {
                    toast.success('KOT printed (latest items)');
                } else {
                    toast.success(result.message);
                }
            } else {
                if ((result as any).isNoNewItems) {
                    toast(result.message, { icon: 'ℹ️' });
                } else {
                    toast.error(result.message);
                }
            }

            return result;
        } finally {
            setIsLoading(false);
        }
    };

    const printBOT = async (
        orderId: number,
        newItemsOnly: boolean = false,
        printerName?: string,
    ) => {
        setIsLoading(true);
        try {
            const result = await printOrderBOT(
                orderId,
                newItemsOnly,
                printerName,
            );

            if (result.success) {
                if (newItemsOnly) {
                    toast.success('BOT printed (latest items)');
                } else {
                    toast.success(result.message);
                }
            } else {
                if ((result as any).isNoNewItems) {
                    toast(result.message, { icon: 'ℹ️' });
                } else {
                    toast.error(result.message);
                }
            }

            return result;
        } finally {
            setIsLoading(false);
        }
    };

    const printReceipt = async (orderId: number, printerName?: string) => {
        setIsLoading(true);
        try {
            const result = await printOrderReceipt(orderId, printerName);

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }

            return result;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        printKOT,
        printBOT,
        printReceipt,
        isLoading,
    };
}
