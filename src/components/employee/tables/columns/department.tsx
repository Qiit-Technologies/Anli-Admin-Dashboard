import { cn } from '@/lib/utils';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp } from 'lucide-react';
import Link from 'next/link';

interface Department {
    id: string;
    name: string;
    createdAt: Date;
    employees: [];
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

export const DepartmentFilters = [
    {
        id: 'status',
        label: 'Department Status',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
        ],
    },
];

export const DepartmentColumns: ColumnDef<Department>[] = [
    {
        accessorKey: 'departmentId',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique department identifier"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">
                        Department ID <CircleHelp className="w-4 h-4" />
                    </span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
        accessorKey: 'departmentName',
        header: 'Department Name',
        cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
        accessorKey: 'dateCreated',
        header: 'Date Created',
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    },
    {
        accessorKey: 'employees',
        header: 'No. of Employees',
        cell: ({ row }) => <span>{row.original.employees.length}</span>,
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
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Link
                    href={`/employee/department-management/${row.original.id}`}
                    className="text-blue-600 hover:underline"
                >
                    <button className="text-orion-blue underline">
                        View Staffs
                    </button>
                </Link>
            </div>
        ),
    },
];
