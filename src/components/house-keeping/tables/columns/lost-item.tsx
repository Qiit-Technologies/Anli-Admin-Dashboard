import { updateLostIemStatus } from '@/app/actions/houseKeeping';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ILostItem } from '@/types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDown, CircleHelp } from 'lucide-react';
import CustomButtonControl from '../components/CustomButtonControl';
import DateRenderer from '../components/DateRenderer';

export const lostItemFilters = [
    {
        id: 'guestContacted',
        label: 'Guest Contacted',
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' },
        ],
    },
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

export const lostItemColumn: ColumnDef<ILostItem>[] = [
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
        accessorKey: 'name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the lost item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Item Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const itemName = row.original.name;
            return (
                <div className="capitalize flex flex-col">
                    <span className="text-muted-foreground">{itemName}</span>
                </div>
            );
        },
    },
    {
        id: 'room',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Room where the item was found"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Found In <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span>
                {row.original.room?.roomNumber ??
                    (row.original as any).roomNumber ??
                    'N/A'}{' '}
                ({row.original.room?.roomtype?.name ?? 'Unknown Type'})
            </span>
        ),
    },
    {
        id: 'reportedBy',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Person who reported the lost item"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
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
        accessorKey: 'guestContacted',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Has the guest been contacted?"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Guest Contacted <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Date when the item was found"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Date Found <CircleHelp className="w-4 h-4" />
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
            const handleUpdateLostItem = async (id: number) => {
                try {
                    await updateLostIemStatus(id, 'CLAIMED');
                    return { success: true };
                } catch (error: any) {
                    console.error('Error updating lost item:', error);
                    throw error;
                }
            };
            return (
                <div className="flex items-center gap-2">
                    <CustomButtonControl
                        title={'Claim'}
                        disabled={row.original.status === 'CLAIMED'}
                        onClick={() => handleUpdateLostItem(row.original.id)}
                        mutateKey="/housekeeping/lost-item"
                    />
                </div>
            );
        },
    },
];
