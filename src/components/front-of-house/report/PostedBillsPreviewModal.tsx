'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPostedRoomBills } from '@/app/actions/order';
import { downloadHtmlDocumentAsPdf } from '@/lib/download-html-pdf';
import { useBrowserPrint } from '@/hooks/useBrowserPrint';
import { Printer, FileDown } from 'lucide-react';
import PostedBillsRegisterReport from './PostedBillsRegisterReport';

interface PostedBillsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessDate?: string;
  workPeriodId?: number;
  data?: any[] | null;
  onOpenChange?: (open: boolean) => void;
}

export default function PostedBillsPreviewModal({
  isOpen,
  onClose,
  businessDate,
  workPeriodId,
  data: externalData,
  onOpenChange,
}: Readonly<PostedBillsPreviewModalProps>) {
  const [data, setData] = useState<any>(externalData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { printInBrowser, isPrinting } = useBrowserPrint();

  useEffect(() => {
    if (!isOpen) return;

    if (externalData !== undefined) {
      setData(externalData);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    getPostedRoomBills({
      businessDate,
      workPeriodId,
    }).then((result: any) => {
      if (cancelled) return;
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, businessDate, workPeriodId, externalData]);

  const buildHtmlDocument = (innerHtml: string): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Posted Room Bills Register</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000; background: #fff; }
        .report-doc { padding: 16px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 3px 6px; text-align: left; vertical-align: top; font-size: 10px; }
        th { background: #f0f0f0; font-weight: bold; text-align: center; }
        td.num, th.num { text-align: right; }
        .header-section { text-align: center; margin-bottom: 12px; }
        .report-title { font-size: 16px; font-weight: bold; margin: 8px 0; }
        .report-meta { font-size: 10px; color: #555; margin-top: 4px; }
        .footer { margin-top: 16px; font-size: 10px; color: #555; text-align: center; }
        @media print {
            body { margin: 0; }
            .report-doc { padding: 8px; }
            .no-print { display: none; }
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
    const fileName = `posted-room-bills-${businessDate || 'all'}-wp-${workPeriodId || 'all'}`;
    await downloadHtmlDocumentAsPdf(html, fileName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange ?? onClose}>
      <DialogContent className="max-w-[85vw] !z-[9999] w-full max-h-[98vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            Posted Room Bills Register
          </DialogTitle>
          <div className="flex items-center mr-6 gap-2">
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
              <PostedBillsRegisterReport
                data={data}
                businessName={data?.[0]?.hotel?.printoutName || data?.[0]?.hotel?.name || ''}
                businessAddress={data?.[0]?.hotel?.printoutAddress || data?.[0]?.hotel?.address || ''}
                businessPhone={data?.[0]?.hotel?.printoutPhone || data?.[0]?.hotel?.contactPhone || ''}
                businessDate={businessDate || 'All Dates'}
                workPeriodId={workPeriodId || 'All'}
                generatedAt={new Date().toLocaleString()}
                generatedBy="Current User"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}