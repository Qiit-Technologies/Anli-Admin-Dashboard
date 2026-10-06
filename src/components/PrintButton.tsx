'use client';
import { printWithQZ } from '@/hooks/useQzPrint';
import { formatForQZTray, PrintOrderData } from '@/lib/print';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface PrintButtonProps {
    printType: 'receipt' | 'kot' | 'bot';
    order: PrintOrderData;
}

export function PrintButton({
    order,
    printType = 'receipt',
}: Readonly<PrintButtonProps>) {
    const [loading, setLoading] = useState(false);

    const handlePrint = async () => {
        setLoading(true);
        const receipt = formatForQZTray(order, printType);

        const printerName = localStorage.getItem('printerName') || undefined;

        const result = await printWithQZ(receipt, printerName);
        setLoading(false);

        if (!result.success) {
            alert(`Print failed: ${result.error}`);
        }
    };

    let printButtonText;

    switch (printType) {
        case 'kot':
            printButtonText = 'Print KOT';
            break;
        case 'bot':
            printButtonText = 'Print Bot';
            break;
        default:
            printButtonText = 'Print Receipt';
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
