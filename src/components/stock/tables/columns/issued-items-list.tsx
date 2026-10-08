import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, CircleHelp, Printer } from 'lucide-react';
import Link from 'next/link';

type IssuedLine = {
    id?: number;
    name: string;
    unitOfMeasurement?: string;
    quantity: number;
};

type IssuedItemProps = {
    id: string | number;
    issueNo?: string;
    requestNumber?: string;
    date: string;
    itemName: string;
    itemCount?: number;
    quantity: number;
    department: string;
    requestedBy: string;
    unitOfMeasurement: string;
    issuingOfficer: string;
    status: string;
    item?: IssuedLine[];
};

export const issuedItemsFilters = [
    {
        id: 'department',
        label: 'Department',
        options: [
            { value: 'Housekeeping', label: 'Housekeeping' },
            { value: 'Kitchen', label: 'Kitchen' },
            { value: 'Stock', label: 'Stock' },
        ],
    },
];

const statusStyles = {
    APPROVED: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    approved: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
};

const printIssueVoucher = (row: IssuedItemProps) => {
    const lines = row.item ?? [];
    const issueNo = row.issueNo || row.requestNumber || String(row.id);
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Stock Issue Voucher - ${issueNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            .meta { margin: 16px 0; font-size: 13px; }
            .meta div { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 13px; text-align: left; }
            th { background: #f5f5f5; }
            .signatures { margin-top: 48px; display: flex; justify-content: space-between; }
            .sig { width: 40%; border-top: 1px solid #333; padding-top: 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Stock Issue Voucher</h1>
          <p>Issue No: <strong>${issueNo}</strong></p>
          <div class="meta">
            <div><strong>Date Issued:</strong> ${row.date}</div>
            <div><strong>Department:</strong> ${row.department}</div>
            <div><strong>Requested By:</strong> ${row.requestedBy}</div>
            <div><strong>Issuing Officer:</strong> ${row.issuingOfficer}</div>
            <div><strong>Status:</strong> ${row.status}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Name</th>
                <th>UoM</th>
                <th>Qty Issued</th>
              </tr>
            </thead>
            <tbody>
              ${
                  lines.length
                      ? lines
                            .map(
                                (line, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${line.name}</td>
                  <td>${line.unitOfMeasurement || '—'}</td>
                  <td>${line.quantity}</td>
                </tr>`,
                            )
                            .join('')
                      : `<tr><td colspan="4">${row.itemName} — Qty ${row.quantity}</td></tr>`
              }
            </tbody>
          </table>
          <div class="signatures">
            <div class="sig">Requested By</div>
            <div class="sig">Issuing Officer</div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
};

export const issuedItemsColumn: ColumnDef<IssuedItemProps>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="w-fit h-full flex items-center">
                <Checkbox
                    className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="w-full h-full flex items-center">
                <Checkbox
                    className="shadow-none border-gray-300 data-[state=checked]:bg-brand"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'issueNo',
        header: 'Issue No.',
        cell: ({ row }) => (
            <span className="font-medium tabular-nums">
                {row.original.issueNo ||
                    row.original.requestNumber ||
                    `#${row.original.id}`}
            </span>
        ),
    },
    {
        accessorKey: 'date',
        header: 'Date Issued',
        cell: ({ row }) => <span>{row.original.date}</span>,
    },
    {
        accessorKey: 'department',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Department"
                    showArrow={true}
                >
                    <button className="flex items-center gap-2">
                        Department <ArrowDown className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.department}</span>,
    },
    {
        accessorKey: 'requestedBy',
        header: 'Requested By',
        cell: ({ row }) => <span>{row.original.requestedBy}</span>,
    },
    {
        accessorKey: 'issuingOfficer',
        header: 'Issuing Officer',
        cell: ({ row }) => <span>{row.original.issuingOfficer}</span>,
    },
    {
        accessorKey: 'itemCount',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Number of items in this issue transaction"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        No. of Items <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>
                {row.original.itemCount ??
                    row.original.item?.length ??
                    1}{' '}
                item
                {(row.original.itemCount ?? row.original.item?.length ?? 1) === 1
                    ? ''
                    : 's'}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = String(row.original.status || 'APPROVED');
            const style =
                statusStyles[status as keyof typeof statusStyles] ||
                statusStyles.APPROVED;
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${style.bg} ${style.text}`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {status}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const data = row.original;

            return (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/stock/issued-stock/${data.id}`}
                        className="font-normal hover:underline"
                    >
                        View
                    </Link>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-8 px-2"
                        onClick={() => printIssueVoucher(data)}
                        title="Print voucher"
                    >
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                </div>
            );
        },
    },
];
