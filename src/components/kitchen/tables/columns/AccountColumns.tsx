import { ScopedPayroll } from '@/components/front-of-house/types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

const statusStyles = {
    pending: {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
    completed: {
        bg: '#EBFFEE',
        text: '#02542D',
    },
};

export const AccountOverviewColumns: ColumnDef<ScopedPayroll>[] = [
    {
        accessorKey: 'transactionTime',
        header: 'Transaction Time',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.transactionTime}
            </span>
        ),
    },
    {
        accessorKey: 'transactionType',
        header: 'Transaction Type',
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.transactionType}
            </span>
        ),
    },
    {
        accessorKey: 'amount',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Transaction Amount"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Amount <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#101828] text-center">
                {row.original.amount}
            </span>
        ),
    },
    {
        accessorKey: 'module',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Module/Department"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Module <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original?.module}
            </span>
        ),
    },
    {
        accessorKey: 'date',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Transaction Date"
                    showArrow={true}
                >
                    <span className="flex items-center justify-center gap-2">
                        Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col items-center justify-center">
                <div className="text-[#101828]">{row.original?.date}</div>
                <div className="text-sm font-normal leading-5">
                    {row.original?.time}
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: () => <div className="text-center pr-3">Status</div>,
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div className="flex items-center justify-center w-full">
                    <div
                        className={`w-fit px-3 py-1 rounded-full`}
                        style={{
                            background:
                                // @ts-expect-error styles
                                statusStyles[
                                    status?.toString().toLocaleLowerCase()
                                ]?.bg,
                        }}
                    >
                        <span
                            className={`text-xs caption-top`}
                            style={{
                                // @ts-expect-error styles
                                color: statusStyles[
                                    status?.toString().toLocaleLowerCase()
                                ]?.text,
                            }}
                        >
                            {status}
                        </span>
                    </div>
                </div>
            );
        },
    },
];
