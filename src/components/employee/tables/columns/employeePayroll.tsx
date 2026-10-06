import { cn, formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import PayrollAction from '../PayrollAction';
interface EmployeePayroll {
    id: string;
    employeeId: string;
    paymentId: string;
    employeeName: string;
    employeeImage: string;
    jobTitle: string;
    date: string;
    salary: number;
    deductions: number;
    netPay: number;
    status: 'paid' | 'pending' | 'failed';
}

const statusStyles = {
    paid: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    pending: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    failed: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

export const EmployeePayrollFilters = [
    {
        id: 'status',
        label: 'Payment Status',
        options: [
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
        ],
    },
    {
        id: 'jobTitle',
        label: 'Job Title',
        options: [
            { value: 'developer', label: 'Developer' },
            { value: 'designer', label: 'Designer' },
            { value: 'manager', label: 'Manager' },
        ],
    },
];

export const EmployeePayrollColumns: ColumnDef<EmployeePayroll>[] = [
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
        accessorKey: 'jobTitle',
        header: 'Job Title',
        cell: ({ row }) => <span>{row.original.jobTitle}</span>,
    },
    {
        accessorKey: 'date',
        header: 'Payment Date',
        cell: ({ row }) => {
            const date = new Date(row.original.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            return <span>{formattedDate}</span>;
        },
    },
    {
        accessorKey: 'salary',
        header: 'Base Pay',
        cell: ({ row }) => <span>{formatCurrency(row.original.salary)}</span>,
    },
    {
        accessorKey: 'deductions',
        header: 'Deductions',
        cell: ({ row }) => (
            <span>{formatCurrency(row.original.deductions)}</span>
        ),
    },
    {
        accessorKey: 'netPay',
        header: 'Net Salary',
        cell: ({ row }) => <span>{formatCurrency(row.original.netPay)}</span>,
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
                            'text-xs capitalize',
                        )}
                    >
                        {status}
                    </span>
                </div>
            );
        },
    },
    {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => <PayrollAction payroll={row.original} />,
    },
];
