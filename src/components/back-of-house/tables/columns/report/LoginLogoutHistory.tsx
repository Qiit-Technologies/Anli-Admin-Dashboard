import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';

interface LoginLogoutHistory {
    id: number;
    staffName: string;
    date: string; // table header: login date
    time: string; // table header: login time
    shiftDuration: string;
    status: 'offline' | 'online';
}

export const LoginLogoutData: LoginLogoutHistory[] = [
    {
        id: 1,
        staffName: 'John Smith',
        date: '2023-05-15',
        time: '08:30',
        shiftDuration: '8h 15m',
        status: 'offline',
    },
    {
        id: 2,
        staffName: 'Sarah Johnson',
        date: '2023-05-15',
        time: '09:00',
        shiftDuration: '7h 45m',
        status: 'online',
    },
];

export const loginLogoutColumn: ColumnDef<LoginLogoutHistory>[] = [
    {
        accessorKey: 'staffName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Name of the staff member"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Staff Name <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.staffName}</span>,
    },
    {
        accessorKey: 'date',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Date of login"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Login Date <CircleHelp className="w-4 h-4" />
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
                    content="Time of login"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Login Time <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.time}</span>,
    },
    {
        accessorKey: 'shiftDuration',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Duration of the staff shift"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Shift Duration <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.shiftDuration}</span>,
    },
    {
        accessorKey: 'status',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Current login status"
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
                    row.original.status === 'online'
                        ? 'bg-green-200 text-green-500'
                        : 'bg-red-200 text-red-500',
                    'flex items-center justify-center gap-2 w-fit shadow-none rounded-full',
                )}
            >
                <div
                    className={cn(
                        row.original.status === 'online'
                            ? 'bg-green-500'
                            : 'bg-red-500',
                        'rounded-full w-2 h-2',
                    )}
                />
                {row.original.status}
            </Badge>
        ),
    },
];
