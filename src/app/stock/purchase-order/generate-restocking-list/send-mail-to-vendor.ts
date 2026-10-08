import { Item } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const SendEmailToVendor = async (items: Item[]) => {
    try {
        const doc = new jsPDF();

        doc.text('Restocking List', 14, 15);

        const headers = [['#', 'Item Name', 'Quantity', 'Unit']];

        const rows =
            items?.map((item, index) => [
                index + 1,
                item.itemName,
                item.quantity,
                item.unitOfMeasurement,
            ]) || [];

        autoTable(doc, {
            head: headers,
            body: rows,
            startY: 20,
            theme: 'striped',
        });

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        await downloadPDF(pdfUrl);

        openEmailClient();
    } catch (error: any) {
        console.error('Error generating or sending email:', error);
    }
};

const downloadPDF = async (pdfUrl: string) => {
    return new Promise<void>((resolve) => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'restocking_list.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
    });
};

const openEmailClient = async () => {
    const vendorEmail = 'vendor@example.com';
    const subject = encodeURIComponent('Restocking List');
    const body = encodeURIComponent(
        'Please find attached the restocking list.\n\nNote: Attach the downloaded file manually.',
    );

    window.location.href = `mailto:${vendorEmail}?subject=${subject}&body=${body}`;
};
