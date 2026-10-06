import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import POTemplate from './POTemplate';
import { Printer, Download } from 'lucide-react';

interface POPrintModalProps {
    open: boolean;
    onClose: () => void;
    purchaseOrder: any;
    items: any[];
    company: any;
}

const POPrintModal: React.FC<POPrintModalProps> = ({
    open,
    onClose,
    purchaseOrder,
    items,
    company,
}) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Company ${company?.name || 'Company'}</title>
                            <style>
                                * {
                                    box-sizing: border-box;
                                }
                                body { 
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                                    margin: 0; 
                                    padding: 20px;
                                    background: white;
                                    color: #333;
                                    line-height: 1.6;
                                }
                                .invoice-container {
                                    max-width: 800px;
                                    margin: 0 auto;
                                    background: white;
                                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                                    border-radius: 8px;
                                    overflow: hidden;
                                }
                                table { 
                                    width: 100%; 
                                    border-collapse: collapse; 
                                    margin: 20px 0;
                                    border-radius: 6px;
                                    overflow: hidden;
                                }
                                th, td { 
                                    border: 1px solid #e1e5e9; 
                                    padding: 16px; 
                                    text-align: left; 
                                }
                                th { 
                                    background-color: #f8fafc; 
                                    font-weight: 600;
                                    color: #374151;
                                    border-bottom: 2px solid #e1e5e9;
                                }
                                td {
                                    background-color: white;
                                }
                                .header { 
                                    display: flex; 
                                    justify-content: space-between; 
                                    align-items: center;
                                    margin-bottom: 30px; 
                                    padding: 20px;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    color: white;
                                }
                                .details-grid { 
                                    display: grid; 
                                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                                    gap: 20px; 
                                    margin: 30px 20px;
                                }
                                .detail-box { 
                                    border: 1px solid #e1e5e9; 
                                    padding: 20px; 
                                    border-radius: 8px; 
                                    background: #f8fafc;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                                }
                                .detail-box h3 {
                                    margin: 0 0 10px 0;
                                    color: #374151;
                                    font-size: 14px;
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                }
                                .detail-box p {
                                    margin: 0;
                                    color: #6b7280;
                                    font-size: 16px;
                                }
                                .summary-grid { 
                                    display: grid; 
                                    grid-template-columns: 1fr 1fr; 
                                    gap: 40px; 
                                    margin: 30px 20px;
                                    padding: 20px;
                                    background: #f8fafc;
                                    border-radius: 8px;
                                }
                                .total { 
                                    font-size: 20px; 
                                    font-weight: 700; 
                                    border-top: 2px solid #e1e5e9; 
                                    padding-top: 15px; 
                                    color: #1f2937;
                                }
                                .invoice-title {
                                    font-size: 28px;
                                    font-weight: 700;
                                    margin: 0;
                                }
                                .invoice-subtitle {
                                    font-size: 16px;
                                    opacity: 0.9;
                                    margin: 5px 0 0 0;
                                }
                                @media print {
                                    body { 
                                        margin: 0; 
                                        padding: 0;
                                    }
                                    .invoice-container {
                                        box-shadow: none;
                                        border-radius: 0;
                                    }
                                    .no-print { 
                                        display: none; 
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            ${printRef.current.innerHTML}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const handleDownloadPDF = () => {
        // TODO: Implement PDF download functionality using a library like jsPDF or react-to-pdf
        // console.log('Download PDF functionality to be implemented');
        handlePrint();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[95vh] p-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-200">
                    <DialogTitle className="flex items-center justify-between">
                        <span className="text-xl font-semibold">
                            Purchase Order
                        </span>
                        <div className="flex gap-3">
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                size="sm"
                                className="no-print hover:bg-blue-50 hover:border-blue-200"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                            <Button
                                onClick={handleDownloadPDF}
                                variant="outline"
                                size="sm"
                                className="no-print hover:bg-green-50 hover:border-green-200"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <div
                        ref={printRef}
                        className="invoice-container bg-white rounded-lg shadow-lg"
                    >
                        <POTemplate
                            company={company}
                            purchaseOrder={purchaseOrder}
                            items={items}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default POPrintModal;
