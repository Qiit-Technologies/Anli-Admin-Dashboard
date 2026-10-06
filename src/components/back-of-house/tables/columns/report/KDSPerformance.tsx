import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

interface KDSPerformance {
    id: number;
    cancelledBy: string;
    reason: string;
    value: string;
}

export const kdsColumn: ColumnDef<KDSPerformance>[] = [
    {
        accessorKey: 'cancelledBy',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Who cancelled the Order"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Cancelled By <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.cancelledBy}</span>,
    },
    {
        accessorKey: 'reason',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Reason it was cancelled"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Reason <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.reason}</span>,
    },
    {
        accessorKey: 'value',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Cancelled Item monetary value"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        value and quantity of cancelled items{' '}
                        <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.value}</span>,
    },
];
