'use client';

import {
    getDailySalesReport,
    getHalfDaySalesReport,
} from '@/app/actions/order';
import { useBrowserPrint } from '@/hooks/useBrowserPrint';
import { printWithQZ } from '@/hooks/useQzPrint';
import {
    formatDailySalesReportForBrowser,
    formatForQZTraySalesReport,
} from '@/lib/print';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface ReportPrintButtonProps {
    type?: 'full' | 'half';
}

export function ReportPrintButton({
    type = 'full',
}: Readonly<ReportPrintButtonProps>) {
    const [loading, setLoading] = useState(false);
    const [printMethod, setPrintMethod] = useState<'printer' | 'browser'>(
        'printer',
    );
    const { printInBrowser, isPrinting } = useBrowserPrint();

    const handlePrint = async () => {
        setLoading(true);

        try {
            let data, error;

            if (type === 'full') {
                const result = await getDailySalesReport();
                data = result.data;
                error = result.error;
            } else {
                const result = await getHalfDaySalesReport();
                data = result.data;
                error = result.error;
            }

            if (error || !data) {
                alert(error || 'No report data available.');
                return;
            }

            if (printMethod === 'printer') {
                const printerName =
                    localStorage.getItem('printerName') || undefined;
                const printData = formatForQZTraySalesReport(data, type);
                const printResult = await printWithQZ(printData, printerName);

                if (!printResult.success) {
                    alert(`Print failed: ${printResult.error}`);
                }
            } else {
                const htmlContent = formatDailySalesReportForBrowser(data);
                printInBrowser(htmlContent);
            }
        } catch (err) {
            alert('An unexpected error occurred while printing.');
            console.error('Print error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getReportButtonText = () => {
        if (type === 'full') {
            return 'Print Daily Sales Report';
        }
        return 'Print Half Day Sales Report';
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    disabled={loading || isPrinting}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    {loading || isPrinting
                        ? 'Printing...'
                        : getReportButtonText()}
                </Button>

                <select
                    value={printMethod}
                    onChange={(e) =>
                        setPrintMethod(e.target.value as 'printer' | 'browser')
                    }
                    style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                >
                    <option value="printer">Receipt Printer</option>
                    <option value="browser">Browser Print</option>
                </select>
            </div>
        </>
    );
}
