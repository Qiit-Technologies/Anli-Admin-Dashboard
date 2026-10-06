import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';

interface Shift {
    shiftName: string;
    shiftId: number;
    employeeName: string;
    employeeImage: string;
    department: string;
    jobTitle: string;
    startTime: string;
    endTime: string;
    workStatus: 'active' | 'in-active';
    periods?: string[];
}

const statusStyles = {
    active: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    'in-active': {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const ShiftFilters = [
    {
        id: 'workStatus',
        label: 'Work Status',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'in-active', label: 'Inactive' },
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

/**{
    "shiftName": "afternoon",
    "shiftId": 1,
    "employeeName": "ogochi oke",
    "department": "N/A",
    "jobTitle": "N/A",
    "employeeImage": "https://avatar.iran.liara.run/public/girl",
    "startTime": "12:00:00",
    "endTime": "04:00:00",
    "workStatus": "active"
} */

export const ShiftColumns: ColumnDef<Shift>[] = [
    {
        accessorKey: 'employeeName',
        header: 'Employee Name',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Image
                    alt={`${row.original.employeeName} image`}
                    src={
                        row.original.employeeImage ??
                        'https://placehold.co/600x400/000000/FFFFFF.png'
                    }
                    width={32}
                    height={32}
                    className="rounded-full"
                />
                <span>{row.original.employeeName}</span>
            </div>
        ),
    },
    // {
    //     accessorKey: 'department',
    //     header: 'Department',
    //     cell: ({ row }) => <span>{row.original.department}</span>,
    // },
    // {
    //     accessorKey: 'jobTitle',
    //     header: 'Job Title',
    //     cell: ({ row }) => <span>{row.original.jobTitle}</span>,
    // },
    {
        accessorKey: 'periods',
        header: 'Days',
        cell: ({ row }) => (
            <span>
                {row.original.periods?.map((day: string) => (
                    <p key={day}>{day}</p>
                ))}
            </span>
        ),
    },

    {
        accessorKey: 'startTime',
        header: 'Start Time',
        cell: ({ row }) => {
            const time = new Date(`2000-01-01T${row.original.startTime}`);
            return time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        accessorKey: 'endTime',
        header: 'End Time',
        cell: ({ row }) => {
            const time = new Date(`2000-01-01T${row.original.endTime}`);
            return time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        },
    },
    {
        accessorKey: 'workStatus',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.workStatus.toLowerCase();
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

export const sampleShiftData: Shift[] = [
    {
        shiftName: 'Morning Shift',
        shiftId: 1,
        employeeName: 'John Doe',
        department: 'Engineering',
        jobTitle: 'Senior Developer',
        employeeImage: 'https://avatar.iran.liara.run/public/girl',
        startTime: '09:00',
        endTime: '17:00',
        workStatus: 'active',
    },
    {
        shiftName: 'Evening Shift',
        shiftId: 2,
        employeeName: 'Jane Smith',
        department: 'Design',
        jobTitle: 'UI Designer',
        employeeImage: 'https://avatar.iran.liara.run/public/girl',
        startTime: '17:00',
        endTime: '01:00',
        workStatus: 'active',
    },
    {
        shiftName: 'Night Shift',
        shiftId: 3,
        employeeName: 'Mike Johnson',
        department: 'Marketing',
        employeeImage: 'https://avatar.iran.liara.run/public/girl',
        jobTitle: 'Marketing Manager',
        startTime: '01:00',
        endTime: '09:00',
        workStatus: 'in-active',
    },
];
