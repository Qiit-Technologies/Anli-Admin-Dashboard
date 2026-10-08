import { formatDate } from '@/lib/helpers';
import { DineInAreaType } from '@/types/back-of-house.type';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import TableAreaActionCell from '../TableAreaActionCell';

export interface TDAreaProps {
    id: number;
    area: string;
    dineInArea: DineInAreaType;
    createdAt: string;
    number: number;
    numberOfSeats: number;
    isOccuped: boolean;
    availableSeats: number;
    status: 'not available' | 'ready';
}

export const TableAreaFilters = [
    {
        id: 'dineInArea',
        label: 'Table Type',
        options: [
            { value: 'Standard', label: 'Standard' },
            { value: 'Booth', label: 'Booth' },
            { value: 'High Top', label: 'High Top' },
            { value: 'Outdoor', label: 'Outdoor' },
        ],
    },
];

export const TableAreaColumns: ColumnDef<TDAreaProps>[] = [
    {
        accessorKey: 'createdAt',

        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="When the table was created"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Created Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>{formatDate(row.original.createdAt ?? '')}</span>
        ),
    },
    {
        accessorKey: 'dineInArea',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of dining table"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Table Type <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row?.original?.dineInArea?.name}</span>,
    },
    {
        accessorKey: 'tableNumber',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique table identifier"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Table Number <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>T - {row.original.number}</span>,
    },
    {
        accessorKey: 'numberOfSeat',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Number of seats at this table"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Numberr of Seats <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.numberOfSeats}</span>,
    },
    {
        accessorKey: 'availableSeats',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Number of seats at this table"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Seats Available <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.availableSeats}</span>,
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const table = row.original;
            return <TableAreaActionCell table={table} />;
        },
    },
];
