'use client';
import { useState } from 'react';

export function useBrowserPrint() {
    const [isPrinting, setIsPrinting] = useState(false);

    const printInBrowser = (htmlContent: string) => {
        setIsPrinting(true);

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                setIsPrinting(false);
            };
        } else {
            setIsPrinting(false);
            alert('Popup was blocked. Please allow popups for this site.');
        }
    };

    return { printInBrowser, isPrinting };
}
