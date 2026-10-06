import { Button } from '@/components/ui/button';
import { useSimplePrint } from '@/hooks/useSimplePrint';
import { Loader2, Printer } from 'lucide-react';
import React from 'react';

interface SimplePrintButtonProps {
    orderId: number;
    printType: 'kot' | 'bot' | 'receipt';
    newItemsOnly?: boolean;
    printerName?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
    children?: React.ReactNode;
}

export function SimplePrintButton({
    orderId,
    printType,
    newItemsOnly = false,
    printerName,
    variant = 'outline',
    size = 'sm',
    children,
}: Readonly<SimplePrintButtonProps>) {
    const { printKOT, printBOT, printReceipt, isLoading } = useSimplePrint();

    const handlePrint = async () => {
        const finalPrinterName = printerName || undefined;

        switch (printType) {
            case 'kot':
                await printKOT(orderId, newItemsOnly, undefined);
                break;
            case 'bot':
                await printBOT(orderId, newItemsOnly, undefined);
                break;
            case 'receipt':
                await printReceipt(
                    orderId,
                    finalPrinterName ||
                        localStorage.getItem('printerName') ||
                        undefined,
                );
                break;
        }
    };

    const getButtonText = () => {
        if (children) return children;

        switch (printType) {
            case 'kot':
                return newItemsOnly ? 'Print New KOT' : 'Print KOT';
            case 'bot':
                return newItemsOnly ? 'Print New BOT' : 'Print BOT';
            case 'receipt':
                return 'Print Receipt';
            default:
                return 'Print';
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handlePrint}
            disabled={isLoading}
            className="flex items-center gap-2"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Printer className="h-4 w-4" />
            )}
            {getButtonText()}
        </Button>
    );
}
