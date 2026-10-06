import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Renders a full HTML document string to a multi-page A4 PDF and triggers download.
 * Scripts in the document are ignored; use for print-ready HTML only.
 */
export async function downloadHtmlDocumentAsPdf(
    html: string,
    fileName: string,
): Promise<void> {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
        'position:fixed;left:-10000px;top:0;width:800px;min-height:200px;border:0;overflow:hidden;background:#fff';
    document.body.appendChild(iframe);

    try {
        const doc = iframe.contentDocument;
        if (!doc) {
            throw new Error('Could not access print document');
        }

        const sanitized = html.replace(
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            '',
        );

        doc.open();
        doc.write(sanitized);
        doc.close();

        await new Promise<void>((resolve) => {
            const done = () => resolve();
            if (doc.readyState === 'complete') {
                requestAnimationFrame(done);
            } else {
                iframe.onload = () => requestAnimationFrame(done);
            }
        });

        const body = doc.body;
        const captureEl =
            (doc.querySelector('.confirmation-doc') as HTMLElement | null) ??
            body;

        const canvas = await html2canvas(captureEl, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: captureEl.scrollWidth,
            windowHeight: captureEl.scrollHeight,
        });

        // PNG keeps small text sharp; JPEG was noticeably soft at 0.92.
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(fileName);
    } finally {
        document.body.removeChild(iframe);
    }
}
