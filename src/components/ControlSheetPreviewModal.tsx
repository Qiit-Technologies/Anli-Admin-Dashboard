'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getWorkPeriodControlSheet } from '@/app/actions/order';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import { useBrowserPrint } from '@/hooks/useBrowserPrint';
import { getAllBankAccounts, getPublicBankAccounts } from '@/app/actions/bank-accounts';
import { Printer, FileDown } from 'lucide-react';
import ControlSheetReport from './ControlSheetReport';
import type { BankAccount } from '@/app/actions/bank-accounts';
import { buildClientControlSheetReport } from '@/lib/control-sheet-builder';

interface ControlSheetPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    workPeriodId?: number | string;
    orders?: any[];
}

export default function ControlSheetPreviewModal({
    isOpen,
    onClose,
    workPeriodId,
    orders,
}: Readonly<ControlSheetPreviewModalProps>) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const reportRef = useRef<HTMLDivElement>(null);
    const { printInBrowser, isPrinting } = useBrowserPrint();

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        setLoading(true);
        setError(null);
        setData(null);

        if (workPeriodId) {
            getWorkPeriodControlSheet(workPeriodId).then((result: any) => {
                if (cancelled) return;
                if (result.error) {
                    setError(result.error);
                } else {
                    setData(result.data);
                }
                setLoading(false);
            });
        } else if (orders && Array.isArray(orders)) {
            const clientReport = buildClientControlSheetReport(orders);
            setData(clientReport);
            setLoading(false);
        } else {
            setError('No work period or order history data available.');
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [isOpen, workPeriodId, orders]);

    useEffect(() => {
        let cancelled = false;
        getAllBankAccounts().then((result: any) => {
            if (cancelled) return;
            if (Array.isArray(result)) {
                setBankAccounts(result);
            } else if (result && Array.isArray(result.data)) {
                setBankAccounts(result.data);
            } else {
                console.warn('Failed to load bank accounts for control sheet:', result);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const buildHtmlDocument = (innerHtml: string): string => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Restaurant Control Sheet</title>
    <style>
        @page { size: landscape; margin: 5mm; }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000; background: #fff; }
        .control-sheet-doc { padding: 4px; font-size: 8px; line-height: 1.1; }
        .control-sheet-doc table { border-collapse: collapse; width: 100%; table-layout: auto; }
        .control-sheet-doc th, .control-sheet-doc td { border: 1px solid #000; padding: 1px 2px; text-align: left; vertical-align: middle; font-size: 7.5px; }
        .control-sheet-doc th { background: #f0f0f0; font-weight: bold; text-align: center; font-size: 7.5px; }
        .control-sheet-doc td.num, .control-sheet-doc th.num { text-align: right; }
        .control-sheet-doc .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
        .control-sheet-doc .company-info { text-align: left; }
        .control-sheet-doc .report-meta { text-align: right; font-size: 8px; }
        .control-sheet-doc .title { font-size: 12px; font-weight: bold; text-align: center; margin: 2px 0; }
        .control-sheet-doc .subtitle { font-size: 9px; text-align: center; margin-bottom: 4px; }
        .control-sheet-doc .wp-details { display: flex; flex-wrap: wrap; gap: 4px; font-size: 8px; margin-bottom: 4px; }
        .control-sheet-doc .wp-details span { background: #e8e8e8; padding: 1px 3px; border-radius: 2px; }
        .control-sheet-doc .summary-section { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
        .control-sheet-doc .summary-box { border: 1px solid #000; padding: 2px 4px; min-width: 80px; }
        .control-sheet-doc .summary-box strong { display: block; font-size: 7px; text-transform: uppercase; }
        .control-sheet-doc .summary-box .value { font-size: 9px; font-weight: bold; }
        @media print {
            @page { size: landscape; margin: 5mm; }
            body { margin: 0; }
            .control-sheet-doc { padding: 2px; width: 100%; font-size: 7.5px; }
        }
    </style>
</head>
<body>
    ${innerHtml}
</body>
</html>`;
    };

    const handlePrint = async () => {
        if (!reportRef.current) return;
        const innerHtml = reportRef.current.innerHTML;
        const html = buildHtmlDocument(innerHtml);
        printInBrowser(html);
    };

    const handleExportPdf = async () => {
        if (!reportRef.current || !data) return;
        const innerHtml = reportRef.current.innerHTML;
        const html = buildHtmlDocument(innerHtml);
        const fileName = `control-sheet-${workPeriodId ? `work-period-${workPeriodId}` : 'today'}`;
        await downloadHtmlDocumentAsPdf(html, fileName);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[85vw] w-full !max-h-[100vh] !z-[999999] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                        Restaurant Control Sheet
                    </DialogTitle>
                    <div className="flex items-center gap-2 mr-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            disabled={loading || isPrinting || !data}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            {isPrinting ? 'Printing...' : 'Print'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPdf}
                            disabled={loading || !data}
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-6 bg-gray-100">
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orion-blue" />
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-20 text-red-500">
                            {error}
                        </div>
                    )}
                    {!loading && !error && data && (
                        <div ref={reportRef} className="bg-white shadow-sm">
                            <ControlSheetReport data={data} bankAccounts={bankAccounts} />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
