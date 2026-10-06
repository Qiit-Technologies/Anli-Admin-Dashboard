import { cn } from '@/lib/utils';
import { Role } from '@/types/staff.types';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface employeeMgm {
    id: number;
    employeeId: string;
    paymentId: string;
    fullName: string;
    profileImage: string;
    email: string;
    jobTitle: string;
    department: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    createdAt: string;
    salary: number;
    status: 'online' | 'offline' | 'on leave';
    roles: Role;
    isActive?: boolean;
}

const statusStyles = {
    active: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    inActive: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    'on leave': {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
};

export const EmployeeFilters = [
    {
        id: 'status',
        label: 'Employee Status',
        options: [
            { value: 'online', label: 'Online' },
            { value: 'offline', label: 'Offline' },
            { value: 'on leave', label: 'On Leave' },
        ],
    },
    {
        id: 'type',
        label: 'Employment Type',
        options: [
            { value: 'Full-time', label: 'Full Time' },
            { value: 'Part-time', label: 'Part Time' },
            { value: 'Contract', label: 'Contract' },
        ],
    },
    {
        id: 'department',
        label: 'Department',
        options: [
            { value: 'engineering', label: 'Engineering' },
            { value: 'design', label: 'Design' },
            { value: 'marketing', label: 'Marketing' },
        ],
    },
];

export const EmployeeColumns: ColumnDef<employeeMgm>[] = [
    {
        accessorKey: 'employeeName',
        header: 'Employee Name',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Image
                    alt={row.original.fullName}
                    src={
                        row.original.profileImage
                            ? row.original.profileImage
                            : '/user1.jpg'
                    }
                    width={32}
                    height={32}
                    className="rounded-full"
                />
                <span>{row.original.fullName}</span>
            </div>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span>{row.original.email ?? ''}</span>,
    },
    {
        accessorKey: 'jobTitle',
        header: 'Job Title',
        cell: ({ row }) => <span>{row.original.roles.name ?? ''}</span>,
        // cell: ({ row }) => <span>{row.original?.roles?.department ?? ''}</span>,
    },
    {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => <span>{row.original?.roles?.department ?? ''}</span>,
    },
    {
        accessorKey: 'type',
        header: 'Employment Type',
        cell: ({ row }) => <span>{row.original.type ?? ''}</span>,
    },
    {
        accessorKey: 'date',
        header: 'Join Date',
        cell: ({ row }) => (
            <span>
                {format(parseISO(row.original.createdAt), 'yyyy-MM-dd')};
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.isActive ? 'active' : 'inActive';
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
                    href={`/employee/employee-management/${row.original.id}`}
                    className="text-blue-600 hover:underline"
                >
                    <button className="text-muted-foreground hover:underline">
                        View
                    </button>
                </Link>
            </div>
        ),
    },
];
