'use client';
import { printToIP } from '@/app/actions/print';
import {
    formatBOT,
    formatKOT,
    formatReceipt,
    PrintOrderData,
} from '@/lib/print';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface IPPrintButtonProps {
    printType: 'receipt' | 'kot' | 'bot';
    order: PrintOrderData;
}

export function IPPrintButton({
    order,
    printType = 'receipt',
}: Readonly<IPPrintButtonProps>) {
    const [loading, setLoading] = useState(false);

    const handlePrint = async () => {
        setLoading(true);

        try {
            let printData: string;
            switch (printType) {
                case 'kot':
                    printData = formatKOT(order);
                    break;
                case 'bot':
                    printData = formatBOT(order);
                    break;
                default:
                    printData = formatReceipt(order);
                    break;
            }

            const result = await printToIP(printData, printType);

            if (result.error) {
                alert(`Print failed: ${result.error}`);
            } else {
                console.log('Print successful');
            }
        } catch (error: any) {
            alert(
                `Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        } finally {
            setLoading(false);
        }
    };

    let printButtonText;
    switch (printType) {
        case 'kot':
            printButtonText = 'Print KOT (IP)';
            break;
        case 'bot':
            printButtonText = 'Print Bot (IP)';
            break;
        default:
            printButtonText = 'Print Receipt (IP)';
            break;
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={loading}
        >
            <Printer className="mr-2 h-4 w-4" />
            {loading ? 'Printing...' : printButtonText}
        </Button>
    );
}
