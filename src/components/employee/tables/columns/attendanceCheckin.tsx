import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

interface AttendanceCheckin {
    employeeId: string;
    employeeName: string;
    employeeImage: string;
    jobTitle?: string;
    checkinTime: Date;
    checkoutTime: Date | null;
    status: 'present' | 'absent' | 'late';
    hoursWorked?: number;
    department: string;
}

const statusStyles = {
    present: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    absent: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
    late: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
};

export const AttendanceFilters = [
    {
        id: 'status',
        label: 'Attendance Status',
        options: [
            { value: 'present', label: 'Present' },
            { value: 'absent', label: 'Absent' },
            { value: 'late', label: 'Late' },
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

export const AttendanceColumns: ColumnDef<AttendanceCheckin>[] = [
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
        accessorKey: 'checkinTime',
        header: 'Check-in Time',
        cell: ({ row }) => {
            const time = new Date(row.original.checkinTime);
            return time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        accessorKey: 'checkoutTime',
        header: 'Check-out Time',
        cell: ({ row }) => {
            const time = row.original.checkoutTime;
            return time
                ? time.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                  })
                : '-';
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

export const miniAttendanceColumns: ColumnDef<AttendanceCheckin>[] = [
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
        accessorKey: 'checkinTime',
        header: 'Check-in Time',
        cell: ({ row }) => {
            const time = new Date(row.original.checkinTime);
            return time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => <span>{row.original.department}</span>,
    },
];

export const attendanceCheckinColumns: ColumnDef<AttendanceCheckin>[] = [
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
        cell: ({ row }) => <span>{row.original.jobTitle || 'N/A'}</span>,
    },
    {
        accessorKey: 'checkinTime',
        header: 'Check-in Time',
        cell: ({ row }) => {
            const time = new Date(row.original.checkinTime);
            return time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        accessorKey: 'checkoutTime',
        header: 'Check-out Time',
        cell: ({ row }) => {
            const time = row.original.checkoutTime;
            return time
                ? time.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                  })
                : '-';
        },
    },
    {
        accessorKey: 'hoursWorked',
        header: 'Hours Worked',
        cell: ({ row }) => {
            const hours = row.original.hoursWorked;
            return hours !== undefined ? `${hours} hrs` : '-';
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

export const sampleAttendanceData: AttendanceCheckin[] = [
    {
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        employeeImage: 'https://avatar.iran.liara.run/public/boy',
        jobTitle: 'Senior Developer',
        department: 'Engineering',
        checkinTime: new Date('2023-06-08T09:00:00'),
        checkoutTime: new Date('2023-06-08T17:00:00'),
        status: 'present',
        hoursWorked: 8,
    },
    {
        employeeId: 'EMP002',
        employeeName: 'Jane Smith',
        employeeImage: 'https://avatar.iran.liara.run/public/girl',
        jobTitle: 'UI/UX Designer',
        department: 'Design',
        checkinTime: new Date('2023-06-08T09:30:00'),
        checkoutTime: new Date('2023-06-08T17:30:00'),
        status: 'late',
        hoursWorked: 8,
    },
    {
        employeeId: 'EMP003',
        employeeName: 'Mike Johnson',
        employeeImage: 'https://avatar.iran.liara.run/public/boy',
        jobTitle: 'Marketing Specialist',
        department: 'Marketing',
        checkinTime: new Date('2023-06-08T00:00:00'),
        checkoutTime: null,
        hoursWorked: undefined,
        status: 'absent',
    },
];
