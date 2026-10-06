import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { CleaningRequestType } from '@/types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, CircleHelp } from 'lucide-react';
import AssigneeSelect from '../components/AssigneeSelect';
import DateRenderer from '../components/DateRenderer';

export const cleaningRequestFilters = [
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
    normal: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    low: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
        bgVariant: 'bg-orion-blue/15',
        textVariant: 'text-orion-blue',
    },
    urgent: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const cleaningRequestColumn: ColumnDef<CleaningRequestType>[] = [
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
        accessorKey: 'requestedBy',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Who is making this cleaning request"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Requested By
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const requestedBy = row.original.requestedBy?.fullName ?? 'N/A';
            return <span>{requestedBy}</span>;
        },
    },
    {
        accessorKey: 'room.isOccupied',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Whether the room is currently occupied"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Occupancy Status
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const isRoomOccupied = row.original.room?.isOccupied;
            return (
                <span>
                    {isRoomOccupied === true ? 'In house' : 'CheckedOut'}
                </span>
            );
        },
    },
    {
        accessorKey: 'room.roomNumber',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content=" Room Number "
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Room</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const roomNumber = row.original.room?.roomNumber ?? (row.original as any).roomNumber ?? 'N/A';
            return <span>{roomNumber}</span>;
        },
    },
    {
        accessorKey: 'urgency',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content=" Urgency - High | Medium | Low"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Urgency</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const urgency = row.original.urgency;
            return (
                <div
                    className={cn(
                        urgencyStyles[
                            urgency.toLowerCase() as keyof typeof urgencyStyles
                        ]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <span
                        className={cn(
                            urgencyStyles[
                                urgency.toLowerCase() as keyof typeof urgencyStyles
                            ]?.text || 'text-gray-600',
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
        accessorKey: 'createdAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content=" When was the request made "
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Time</span>
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
        accessorKey: 'assignedTo',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content=" Who is assigned to this request "
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Assigned To</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <AssigneeSelect row={row} />,
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Request Status - Pending | Processing | Attended to | Failed"
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
        accessorKey: 'roomCondition',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Room Condition - Clean | Dirty"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Room Condition <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const roomCondition = row.original.roomCondition;
            return (
                <Tooltip className="rounded-md p-4" content={roomCondition}>
                    <div
                        className="text-sm text-muted-foreground w-40 truncate"
                        title={roomCondition}
                    >
                        {roomCondition}
                    </div>
                </Tooltip>
            );
        },
    },
];

export const cleaningRequestColumnTrimmed: ColumnDef<CleaningRequestType>[] = [
    {
        accessorKey: 'requestedBy',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Who is making this cleaning request"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Requested By
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const requestedBy = row.original.requestedBy?.fullName ?? 'N/A';
            return <span>{requestedBy}</span>;
        },
    },
    {
        accessorKey: 'room.roomNumber',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content=" Room Number "
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Room</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const roomNumber = row.original.room?.roomNumber ?? (row.original as any).roomNumber ?? 'N/A';
            return <span>{roomNumber}</span>;
        },
    },
    {
        accessorKey: 'createdAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content=" When was the request made "
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Time</span>
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
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Request Status - Pending | Processing | Attended to | Failed"
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
