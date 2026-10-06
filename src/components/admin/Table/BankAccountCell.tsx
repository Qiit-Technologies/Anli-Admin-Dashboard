import { AccountMngtActionCell } from '@/components/account/accountMgtActionCell';
import { ScopedAccount } from '@/components/front-of-house/types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

const statusStyles = {
    Deactivate: {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
    Activate: {
        bg: '#EBFFEE',
        text: '#02542D',
    },
};

export const BankAccountCell: ColumnDef<ScopedAccount>[] = [
    {
        accessorKey: 'accountName',
        header: 'Account Name',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.accountName}
            </span>
        ),
    },
    {
        accessorKey: 'bankName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of order (e.g., Dinner, Lunch)"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Bank <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                {row.original.bankName}
            </span>
        ),
    },
    {
        accessorKey: 'balance',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the customer"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Balance <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original?.balance}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: () => <div className="text-center pr-3">Status</div>,
        cell: ({ row }) => {
            const status =
                row.original.isActive === true ? 'Activate' : 'Deactivate';
            return (
                <div className="flex items-center justify-center w-full">
                    <div
                        className={`w-fit px-3 py-1 rounded-full`}
                        style={{ background: statusStyles[status]?.bg }}
                    >
                        <span
                            className={`text-xs caption-top`}
                            style={{ color: statusStyles[status]?.text }}
                        >
                            {status}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'action',
        header: () => <div className="text-center pr-3">Action</div>,
        cell: ({ row }) => <AccountMngtActionCell account={row.original} />,
    },
];
