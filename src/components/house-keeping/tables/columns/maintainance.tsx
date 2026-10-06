import { updateMaintenance } from '@/app/actions/houseKeeping';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { IMaintenance } from '@/types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, CircleHelp } from 'lucide-react';
import CustomButtonControl from '../components/CustomButtonControl';
import DateRenderer from '../components/DateRenderer';

const getTimerStatus = (row: IMaintenance) => {
    if (row.status === 'COMPLETED') return 'Completed';
    if (!row.expectedResolutionAt) return 'Not set';
    const now = new Date().getTime();
    const due = new Date(row.expectedResolutionAt).getTime();
    if (Number.isNaN(due)) return 'Not set';
    return due >= now ? 'In time' : 'Overdue';
};

export const maintainanceFilters = [
    {
        id: 'urgency',
        label: 'Urgency',
        options: [
            { value: 'urgent', label: 'Urgent' },
            { value: 'normal', label: 'Normal' },
            { value: 'low', label: 'Low' },
        ],
    },
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'completed', label: 'Completed' },
            { value: 'inprogress', label: 'In Progress' },
            { value: 'cancelled', label: 'Cancelled' },
        ],
    },
];

const statusStyles = {
    inprogress: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    completed: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
        bgVariant: 'bg-orion-blue/15',
        textVariant: 'text-orion-blue',
    },
    cancelled: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

const urgencyStyles = {
    MEDIUM: {
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
        text: 'text-yellow-600',
    },
    LOW: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
        bgVariant: 'bg-orion-blue/15',
        textVariant: 'text-orion-blue',
    },
    CRITICAL: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    HIGH: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
};

export const maintainanceColumn: ColumnDef<IMaintenance>[] = [
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
        accessorKey: 'room.roomNumber',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Room Number"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Room <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>
                {row.original.room?.roomNumber ??
                    (row.original as any).roomNumber ??
                    'N/A'}
            </span>
        ),
    },
    {
        accessorKey: 'room.roomtype.name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Room Type"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        Room Type <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>
                {row.original.room?.roomtype?.name ??
                    (row.original as any).roomTypeName ??
                    'Unknown Type'}
            </span>
        ),
    },
    {
        accessorKey: 'issueType',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Type of maintenance issue - Plumbing | Electrical | Furniture | etc"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        Issue Type <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'description',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Detailed description of the maintenance issue"
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
        accessorKey: 'reportedBy.fullName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Person who reported the maintenance issue"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2  whitespace-nowrap">
                        Reported By <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>{row.original.reportedBy?.fullName ?? 'N/A'}</span>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Date when the issue was reported"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        Reported Date <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            return (
                <DateRenderer
                    row={{
                        original: {
                            createdAt: row.original.createdAt.toString(),
                        },
                    }}
                />
            );
        },
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current status - Completed | In Progress | Cancelled"
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
    {
        accessorKey: 'expectedResolutionAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Expected date and time to resolve this maintenance task"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        Expected Resolution <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            if (!row.original.expectedResolutionAt) return <span>N/A</span>;
            return (
                <DateRenderer
                    row={{
                        original: {
                            createdAt: row.original.expectedResolutionAt,
                        },
                    }}
                />
            );
        },
    },
    {
        id: 'timerStatus',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current timer state for maintenance resolution"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        Timer Status <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const status = getTimerStatus(row.original);
            const classes =
                status === 'Overdue'
                    ? 'text-red-600 bg-red-100'
                    : status === 'In time'
                      ? 'text-green-600 bg-green-100'
                      : 'text-gray-600 bg-gray-100';

            return (
                <span className={cn('px-3 py-1 rounded-full text-xs', classes)}>
                    {status}
                </span>
            );
        },
    },
    {
        accessorKey: 'urgency',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Priority level - Urgent | Normal | Low"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Urgency <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const urgency = row.original.urgency;
            return (
                <div
                    className={cn(
                        urgencyStyles[urgency as keyof typeof urgencyStyles]
                            ?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <span
                        className={cn(
                            urgencyStyles[urgency as keyof typeof urgencyStyles]
                                ?.text || 'text-gray-600',
                            'text-xs caption-top',
                        )}
                    >
                        {urgency}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Actions - move room from under maintenance"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Actions <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const handleCompleteMaintenance = async (id: number) => {
                try {
                    await updateMaintenance(id, 'COMPLETED');
                    return { success: true };
                } catch (error: any) {
                    console.error('Error updating maintenance:', error);
                    throw error;
                }
            };
            return (
                <div className="flex items-center gap-2">
                    <CustomButtonControl
                        title={
                            row.original.status === 'COMPLETED'
                                ? 'Completed'
                                : 'Mark Complete'
                        }
                        disabled={row.original.status === 'COMPLETED'}
                        onClick={() =>
                            handleCompleteMaintenance(row.original.id)
                        }
                        mutateKey="/housekeeping/maintenance"
                    />
                </div>
            );
        },
    },
];
