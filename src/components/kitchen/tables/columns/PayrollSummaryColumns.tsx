import { ScopedPayroll } from '@/components/front-of-house/types';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Info } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';

const statusStyles: any = {
    pending: {
        bg: '#FFF7F0',
        text: '#D55D00',
    },
    paid: {
        bg: '#EBFFEE',
        text: '#02542D',
    },
};

export const PayrollSummaryColumns: ColumnDef<ScopedPayroll>[] = [
    {
        accessorKey: 'referenceId',
        header: () => (
            <div className="w-fit">
                <div className="flex items-center gap-1">
                    Payroll Ref
                    <Info className="h-3 w-3 text-gray-400" />
                </div>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#111827] text-center">
                {row.original.referenceId}
            </span>
        ),
    },
    {
        accessorKey: 'period',
        header: () => (
            <div className="w-fit">
                <div className="flex items-center gap-1">
                    Period
                    <Info className="h-3 w-3 text-gray-400" />
                </div>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#111827] text-center">
                {row.original.period}
            </span>
        ),
    },
    {
        accessorKey: 'numberOfStaff',
        header: () => (
            <div className="w-fit">
                <div className="flex items-center gap-1 font-normal leading-5 text-[#111827] text-center">
                    No. of Staff
                    <Info className="h-3 w-3 text-gray-400" />
                </div>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-center">
                {row.original.numberOfStaff}
            </span>
        ),
    },
    {
        accessorKey: 'totalAmount',
        header: () => (
            <div className="w-fit">
                <div className="flex items-center gap-1">
                    Amount
                    <Info className="h-3 w-3 text-gray-400" />
                </div>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#111827]">
                {formatCurrency(row.original.totalAmount)}
            </span>
        ),
    },
    {
        accessorKey: 'paymentStatus',
        header: () => (
            <div className="w-fit">
                <div className="flex items-center gap-1">
                    Payment Status
                    <Info className="h-3 w-3 text-gray-400" />
                </div>
            </div>
        ),
        cell: ({ row }) => (
            <span className="text-sm font-normal leading-5 text-[#111827] text-center">
                <div
                    className={`w-fit px-3 py-1 rounded-full font-semibold`}
                    style={{
                        background:
                            statusStyles[row.original.paymentStatus]?.bg,
                    }}
                >
                    <span
                        className={`text-xs caption-top`}
                        style={{
                            color: statusStyles[row.original.paymentStatus]
                                ?.text,
                        }}
                    >
                        {row.original.paymentStatus}
                    </span>
                </div>
            </span>
        ),
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <ActionComp row={row} />,
    },
];

const ActionComp = ({ row }: any) => {
    const router = useRouter();
    const handleRowClick = (id: string) => {
        router.push(`/account/payroll-summary/${id}`);
    };

    return (
        <span className="text-sm font-normal leading-5 text-[#111827]">
            <PermissionGate
                permissions={[
                    PERMISSIONS.VIEW_ALL_PAGE,
                    PERMISSIONS.VIEW_PAYROLL_SUMMARY,
                ]}
                blockType="modal"
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row.original.id);
                    }}
                >
                    View
                </Button>
            </PermissionGate>
        </span>
    );
};
