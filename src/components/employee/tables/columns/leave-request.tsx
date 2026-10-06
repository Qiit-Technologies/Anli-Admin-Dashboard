import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import ViewRequest from '../ViewRequest';

interface LeaveRequest {
    requestId: string;
    employeeName: string;
    employeeImage: string;
    reason: string;
    department: string;
    jobTitle: string;
    startTime: string;
    endTime: string;
    requestDate: string;
    expectedReturnDate: string;
    status: 'Request Granted' | 'Request Denied' | 'Pending';
}

const statusStyles = {
    'Request Granted': {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    'Request Denied': {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    Pending: {
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
        text: 'text-yellow-600',
    },
};

export const LeaveRequestFilters = [
    {
        id: 'status',
        label: 'Request Status',
        options: [
            { value: 'Request Granted', label: 'Granted' },
            { value: 'Request Denied', label: 'Denied' },
            { value: 'Pending', label: 'Pending' },
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

export const LeaveRequestColumns: ColumnDef<LeaveRequest>[] = [
    {
        accessorKey: 'employeeName',
        header: 'Employee Name',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Image
                    alt={row.original.employeeName}
                    src={row.original.employeeImage}
                    width={32}
                    height={32}
                    className="rounded-full"
                />
                <span>{row.original.employeeName}</span>
            </div>
        ),
    },
    {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => <span>{row.original.department}</span>,
    },
    {
        accessorKey: 'jobTitle',
        header: 'Job Title',
        cell: ({ row }) => <span>{row.original.jobTitle}</span>,
    },
    {
        accessorKey: 'requestDate',
        header: 'Request Date',
        cell: ({ row }) => {
            const date = new Date(row.original.requestDate);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        },
    },
    {
        accessorKey: 'expectedReturnDate',
        header: 'Expected Return',
        cell: ({ row }) => {
            const date = new Date(row.original.expectedReturnDate);
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
            const status = row.original.status;
            return (
                <div
                    className={cn(
                        statusStyles[status]?.bg || 'bg-gray-100',
                        'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
                    )}
                >
                    <div
                        className={cn(
                            statusStyles[status]?.dot || 'bg-gray-500',
                            'w-2 h-2 rounded-full',
                        )}
                    />
                    <span
                        className={cn(
                            statusStyles[status]?.text || 'text-gray-600',
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
                <ViewRequest request={row.original} />
            </div>
        ),
    },
];

export const sampleLeaveRequestData: LeaveRequest[] = [
    {
        requestId: 'LR001',
        employeeName: 'John Doe',
        employeeImage: 'https://avatar.iran.liara.run/public/boy',
        department: 'Engineering',
        jobTitle: 'Senior Developer',
        startTime: '2024-03-01',
        endTime: '2024-03-15',
        requestDate: '2024-02-15',
        expectedReturnDate: '2024-03-16',
        status: 'Pending',
        reason: 'Annual leave for family vacation in Bali. Will be available via email for urgent matters.',
    },
    {
        requestId: 'LR002',
        employeeName: 'Jane Smith',
        employeeImage: 'https://avatar.iran.liara.run/public/girl',
        department: 'Design',
        jobTitle: 'UI Designer',
        startTime: '2024-03-10',
        endTime: '2024-03-20',
        requestDate: '2024-02-20',
        expectedReturnDate: '2024-03-21',
        status: 'Request Granted',
        reason: 'Medical procedure requiring 10 days recovery period. Documentation attached in HR portal.',
    },
    {
        requestId: 'LR003',
        employeeName: 'Mike Johnson',
        employeeImage: 'https://avatar.iran.liara.run/public/boy',
        department: 'Marketing',
        jobTitle: 'Marketing Manager',
        startTime: '2024-03-05',
        endTime: '2024-03-12',
        requestDate: '2024-02-25',
        expectedReturnDate: '2024-03-13',
        status: 'Request Denied',
        reason: 'Professional development - attending Digital Marketing Summit in Singapore.',
    },
];
