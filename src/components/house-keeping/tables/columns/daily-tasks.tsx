import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { IDailyTask } from '@/types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, CircleHelp } from 'lucide-react';
import DateRenderer from '../components/DateRenderer';

const statusStyles = {
    unclaimed: {
        bg: 'bg-yellow-50',
        dot: 'bg-yellow-400',
        text: 'text-yellow-600',
    },
    claimed: {
        bg: 'bg-emerald-50',
        dot: 'bg-emerald-400',
        text: 'text-emerald-600',
    },
    inprogress: {
        bg: 'bg-orange-50',
        dot: 'bg-orange-400',
        text: 'text-orange-600',
    },
};

export const dailyTasksFilters = [
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'unclaimed', label: 'Unclaimed' },
            { value: 'claimed', label: 'Claimed' },
            { value: 'inprogress', label: 'In Progress' },
        ],
    },
];

export const dailyTasksColumn: ColumnDef<IDailyTask>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="w-fit h-full flex items-center bg-red">
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
            <div className="w-full h-full flex items-center bg-red">
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
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Task ID"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        ID <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'housekeeper.fullName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the housekeeper"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Housekeeper <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'rooms',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Rooms assigned to the housekeeper"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2 w-40 truncate">
                        Assigned Rooms <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const rooms = row.original.rooms;
            return (
                <div className="text-sm text-muted-foreground w-40 truncate">
                    {rooms.map((room) => room).join(', ')}
                </div>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Task date"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <DateRenderer
                row={{
                    original: { createdAt: row.original.createdAt.toString() },
                }}
            />
        ),
    },
    {
        accessorKey: 'description',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Task description"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Description <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const description = row.original.description;
            return (
                <Tooltip className="rounded-md p-4" content={description}>
                    <div
                        className="text-sm text-muted-foreground w-40 truncate"
                        title={description}
                    >
                        {description}
                    </div>
                </Tooltip>
            );
        },
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Status: Unclaimed | Claimed | In Progress"
                    showArrow={true}
                >
                    <button className="flex items-center gap-2">
                        Status <ArrowDown className="w-4 h-4" />
                    </button>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div
                    className={cn(
                        statusStyles[
                            status.toLowerCase() as keyof typeof statusStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
                            ]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[
                                status.toLowerCase() as keyof typeof statusStyles
                            ]?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
];
