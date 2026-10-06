import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

interface KitchenStaffReport {
    id: number;
    preparedBy: string;
    date: string;
    time: string;
    quantity: string;
    status: 'in progress' | 'done';
}

export const KitchenStaffData: KitchenStaffReport[] = [
    {
        id: 1,
        preparedBy: 'John Smith',
        date: '2023-05-15',
        time: '14:30',
        quantity: '12',
        status: 'done',
    },
    {
        id: 2,
        preparedBy: 'Sarah Johnson',
        date: '2023-05-15',
        time: '15:45',
        quantity: '8',
        status: 'in progress',
    },
];

export const kitchenStaffColumn: ColumnDef<KitchenStaffReport>[] = [
    {
        accessorKey: 'preparedBy',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Staff member who prepared the order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Prepared By <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.preparedBy}</span>,
    },
    {
        accessorKey: 'date',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Date when the order was prepared"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.date}</span>,
    },
    {
        accessorKey: 'time',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Time when the order was prepared"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Time <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.time}</span>,
    },
    {
        accessorKey: 'quantity',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Number of items prepared"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Quantity <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.quantity}</span>,
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current status of the order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Status <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <Badge
                className={cn(
                    row.original.status === 'done'
                        ? 'bg-green-200 text-green-500'
                        : 'bg-amber-200 text-amber-500',
                    'flex items-center justify-center gap-2 w-fit shadow-none rounded-full',
                )}
            >
                <div
                    className={cn(
                        row.original.status === 'done'
                            ? 'bg-green-500'
                            : 'bg-amber-500',
                        'rounded-full w-2 h-2',
                    )}
                />
                {row.original.status}
            </Badge>
        ),
    },
];
