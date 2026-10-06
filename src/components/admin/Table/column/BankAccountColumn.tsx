import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ScopedAccount } from '@/components/front-of-house/types';
import { AccountMngtActionCell } from '@/components/account/accountMgtActionCell';

export const BankAccountColumn: ColumnDef<ScopedAccount>[] = [
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique identifier for the item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">ID</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
        accessorKey: 'accountName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Nam on the Bank Account"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Account Name
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.accountName}</span>
        ),
    },
    {
        accessorKey: 'accountNumber',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Account Number on the Bank Account"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Account Number
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.accountNumber}</span>,
    },
    {
        accessorKey: 'bankName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Bank Name on the Bank Account"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Bank Name</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.bankName}</span>,
    },
    {
        accessorKey: 'isPayroll',
        header: () => <span>Payroll</span>,
        cell: ({ row }) => <span>{row.original.isPayroll ? 'Yes' : 'No'}</span>,
    },
    {
        accessorKey: 'department',
        header: () => <span>Department</span>,
        cell: ({ row }) => (
            <span>
                {row.original.module || row.original.department?.name || 'N/A'}
            </span>
        ),
    },
    {
        id: 'actions',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Actions"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Actions</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <AccountMngtActionCell account={row.original} />,
    },
];
