import { ScopedEmployeePayroll } from '@/components/front-of-house/types';
import { Button } from '@/components/ui/button';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { formatCurrency } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Eye, Info, MoreVertical, X } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import RejectPayroll from '@/components/account/rejectPayroll';

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
interface Props {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    isLoading: boolean;
    selectedEmployees: any[];
    setSelectedEmployees: Dispatch<SetStateAction<string[]>>;
    handleSelectAll: (checked: boolean) => void;
    handleSelectEmployee: (employeeId: string, checked: boolean) => void;
    handleViewEmployee: (employeeId: string) => void;
    handleApproveEmployee: (employeeId: string) => void;
    handleRejectEmployee: (employeeId: string, reason: string) => void;
}

export const PayrollEmployeeColumns = ({
    isOpen,
    onOpen,
    onClose,
    isLoading,
    selectedEmployees,
    handleSelectAll,
    handleSelectEmployee,
    handleViewEmployee,
    handleApproveEmployee,
    handleRejectEmployee,
}: Props): ColumnDef<ScopedEmployeePayroll>[] => {
    const ActionComp = ({ row }: any) => {
        const [reason, setReason] = useState('');

        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => handleViewEmployee(row.original.id)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        {row.original.status === 'pending' && (
                            <>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleApproveEmployee(row.original)
                                    }
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onOpen}>
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <RejectPayroll
                    isLoading={isLoading}
                    reason={reason}
                    setReason={setReason}
                    onReject={() =>
                        handleRejectEmployee(row.original.id, reason)
                    }
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onClose={onClose}
                />
            </>
        );
    };

    return [
        {
            accessorKey: 'id',
            header: ({ table }) => (
                <div className="w-fit">
                    <input
                        type="checkbox"
                        checked={
                            selectedEmployees.length ===
                            table.getRowModel().rows.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#111827] text-center">
                    <input
                        type="checkbox"
                        checked={selectedEmployees.includes(row.original.id)}
                        onChange={(e) =>
                            handleSelectEmployee(
                                row.original.id,
                                e.target.checked,
                            )
                        }
                        className="rounded border-gray-300"
                    />
                </span>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Employee Name',
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#111827] text-center">
                    <div className="flex items-center gap-3">
                        <EmployeeAvatar
                            src={row.original.employeeImage}
                            name={row.original.employeeName}
                        />
                        <span className="text-sm font-medium text-gray-900">
                            {row.original.employeeName}
                        </span>
                    </div>
                </span>
            ),
        },
        {
            accessorKey: 'role',
            header: () => (
                <div className="w-fit">
                    <div className="flex items-center gap-1 text-sm font-normal leading-5 text-[#111827] text-center">
                        User Role
                        <Info className="h-3 w-3 text-gray-400" />
                    </div>
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-center">
                    {row.original.jobTitle}
                </span>
            ),
        },
        {
            accessorKey: 'basePay',
            header: () => (
                <div className="w-fit">
                    <div className="flex items-center gap-1 text-sm font-normal leading-5 text-[#111827] text-center">
                        Base Pay
                        <Info className="h-3 w-3 text-gray-400" />
                    </div>
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-[#111827]">
                    {formatCurrency(row.original.netPay)}
                </span>
            ),
        },
        {
            accessorKey: 'deductions',
            header: () => (
                <div className="w-fit">
                    <div className="flex items-center gap-1 text-sm font-normal leading-5 text-[#111827] text-center">
                        Deductions
                        <Info className="h-3 w-3 text-gray-400" />
                    </div>
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-center">
                    {formatCurrency(row.original.deductions)}
                </span>
            ),
        },

        {
            accessorKey: 'netSalary',
            header: () => (
                <div className="w-fit">
                    <div className="flex items-center gap-1 text-sm font-normal leading-5 text-[#111827] text-center">
                        Net Salary
                        <Info className="h-3 w-3 text-gray-400" />
                    </div>
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-sm font-normal leading-5 text-center">
                    {formatCurrency(row.original.netPay)}
                </span>
            ),
        },

        {
            accessorKey: 'paymentStatus',
            header: () => (
                <div className="w-fit">
                    <div className="flex items-center gap-1 text-sm font-normal leading-5 text-[#111827] text-center">
                        Status
                        <svg
                            className="h-3 w-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
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
                            {row.original.status}
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
};
