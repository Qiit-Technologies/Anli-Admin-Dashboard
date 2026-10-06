'use client';
import { Button } from '@/components/ui/button';
import type {
    ARAPRow,
    ARAPType,
} from '@/components/front-office/account-section/common/ARAPColumns';
import { useBrowserPrint } from '@/hooks/useBrowserPrint';
import { Printer } from 'lucide-react';
import { useMemo } from 'react';

interface PrintBtnProps {
    rows?: ARAPRow[];
    type?: ARAPType;
}

export const PrintBtn = ({
    rows = [],
    type = 'receivables',
}: Readonly<PrintBtnProps>) => {
    const { printInBrowser, isPrinting } = useBrowserPrint();

    const summary = useMemo(() => {
        const total = rows.reduce(
            (acc, r) => acc + (Number(r.balance) || 0),
            0,
        );
        return { count: rows.length, total };
    }, [rows]);

    const buildHtml = () => {
        const title =
            type === 'receivables' ? 'Account Receivable' : 'Account Payable';
        const now = new Date();
        const dateStr = now.toLocaleString();

        const head = `
            <style>
              body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
              h1 { margin: 0 0 4px; font-size: 20px; }
              .meta { margin-bottom: 16px; color: #555; font-size: 12px; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #f3f6f9; }
              tfoot td { font-weight: bold; }
              .negative { color: #b91c1c; }
              .positive { color: #065f46; }
              @media print {
                .no-print { display: none; }
              }
            </style>
        `;

        const headers = [
            'Acc No',
            'Design',
            'Surname',
            'Firstname',
            'Address',
            'Creation Date',
            'Balance',
            'Phone',
            'Sex',
            'Created By',
            'Guest Type',
        ];

        const rowsHtml = rows
            .map((r) => {
                const dateObj = new Date(r.createdAt);
                const date = dateObj.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                });
                const time = dateObj.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });
                const balanceStr =
                    (type === 'receivables' ? '-' : '') +
                    new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                    }).format(Number(r.balance || 0));
                const balanceClass =
                    type === 'receivables' ? 'negative' : 'positive';
                return `
                  <tr>
                    <td>${r.accountNumber}</td>
                    <td>${r.title ?? ''}</td>
                    <td>${r.lastName}</td>
                    <td>${r.firstName}</td>
                    <td>${r.address}</td>
                    <td>
                      <div>${date}</div>
                      <div style="color:#666; font-size:11px;">${time}</div>
                    </td>
                    <td class="${balanceClass}">${balanceStr}</td>
                    <td>${r.phoneNumber}</td>
                    <td class="capitalize">${r.gender}</td>
                    <td>${r.createdBy}</td>
                    <td>${r.guestType}</td>
                  </tr>
                `;
            })
            .join('');

        const totalsStr = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(summary.total);

        const html = `
          <html>
            <head>
              <title>${title}</title>
              ${head}
            </head>
            <body>
              <h1>${title}</h1>
              <div class="meta">Printed: ${dateStr} • Rows: ${summary.count} • Total: ${type === 'receivables' ? '-' : ''}${totalsStr}</div>
              <table>
                <thead>
                  <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
              <div class="no-print" style="margin-top:16px;">
                <button onclick="window.print()">Print</button>
              </div>
            </body>
          </html>
        `;

        return html;
    };

    const handlePrint = () => {
        const html = buildHtml();
        printInBrowser(html);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={isPrinting}
        >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? 'Printing...' : 'Print'}
        </Button>
    );
};
