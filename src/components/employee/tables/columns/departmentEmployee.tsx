import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import Image from 'next/image';

interface DepartmentEmployee {
    id: string;
    fullName: string;
    profileImage: string;
    startDate: Date;
    jobTitle: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    status: 'active' | 'inactive';
}

const statusStyles = {
    active: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    inactive: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const DepartmentEmployeeFilters = [
    {
        id: 'status',
        label: 'Employee Status',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
        ],
    },
    {
        id: 'type',
        label: 'Work Type',
        options: [
            { value: 'Full-time', label: 'Full Time' },
            { value: 'Part-time', label: 'Part Time' },
            { value: 'Contract', label: 'Contract' },
        ],
    },
];

export const DepartmentEmployeeColumns: ColumnDef<DepartmentEmployee>[] = [
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique employee identifier"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Employee ID <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
        accessorKey: 'fullName',
        header: 'Employee Name',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Image
                    alt={row.original.fullName}
                    src={row.original.profileImage}
                    width={32}
                    height={32}
                    className="rounded-full"
                />
                <span>{row.original.fullName}</span>
            </div>
        ),
    },
    {
        accessorKey: 'jobTitle',
        header: 'Role/Position',
        cell: ({ row }) => <span>{row.original.jobTitle}</span>,
    },
    {
        accessorKey: 'type',
        header: 'Work Type',
        cell: ({ row }) => <span>{row.original.type}</span>,
    },
    {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => {
            const date = new Date(row.original.startDate);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status.toLowerCase();
            return (
                <div
                    className={cn(
                        statusStyles[status as keyof typeof statusStyles]?.bg ||
                            'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[status as keyof typeof statusStyles]
                                ?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[status as keyof typeof statusStyles]
                                ?.text || 'text-gray-600',
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
