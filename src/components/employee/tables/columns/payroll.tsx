import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';

interface Payroll {
    id: number;
    referenceId: string;
    period: string;
    numberOfStaff: number;
    totalAmount: number;
    paymentStatus: 'paid' | 'pending' | 'failed';
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

export const PayrollFilters = [
    {
        id: 'paymentStatus',
        label: 'Payment Status',
        options: [
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
        ],
    },
];

export const PayrollColumns: ColumnDef<Payroll>[] = [
    {
        accessorKey: 'referenceId',
        header: 'Reference ID',
        cell: ({ row }) => <span>{row.original.referenceId}</span>,
    },
    {
        accessorKey: 'period',
        header: 'Period',
        cell: ({ row }) => {
            const date = new Date(row.original.period);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            return <span>{formattedDate}</span>;
        },
    },
    {
        accessorKey: 'numberOfStaff',
        header: 'No of Staff',
        cell: ({ row }) => <span>{row.original.numberOfStaff}</span>,
    },
    {
        accessorKey: 'totalAmount',
        header: 'Amount',
        cell: ({ row }) => (
            <span>{formatCurrency(row.original.totalAmount)}</span>
        ),
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment Status',
        cell: ({ row }) => {
            const status = row.original.paymentStatus.toLowerCase();
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
        cell: ({ row }) => {
            const payrollId = row.original.id;
            return (
                <PermissionGate
                    permissions={[PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT]}
                    blockType="modal"
                >
                    <Link href={`/employee/payroll/${payrollId}`}>
                        <Button
                            className="text-muted-foreground"
                            variant={'link'}
                        >
                            View
                        </Button>
                    </Link>
                </PermissionGate>
            );
        },
    },
];

export const dummyPayrollData: Payroll[] = [
    {
        id: 1,
        referenceId: 'PR-2025-001',
        period: '2025-06-01',
        numberOfStaff: 25,
        totalAmount: 187500.0,
        paymentStatus: 'paid',
    },
    {
        id: 2,
        referenceId: 'PR-2025-002',
        period: '2025-05-15',
        numberOfStaff: 18,
        totalAmount: 142800.0,
        paymentStatus: 'pending',
    },
    {
        id: 3,
        referenceId: 'PR-2025-003',
        period: '2025-05-01',
        numberOfStaff: 32,
        totalAmount: 254600.0,
        paymentStatus: 'paid',
    },
    {
        id: 4,
        referenceId: 'PR-2025-004',
        period: '2025-04-15',
        numberOfStaff: 12,
        totalAmount: 89400.0,
        paymentStatus: 'failed',
    },
    {
        id: 5,
        referenceId: 'PR-2025-005',
        period: '2025-04-01',
        numberOfStaff: 28,
        totalAmount: 218750.0,
        paymentStatus: 'pending',
    },
];
