'use client';

import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmployeeAvatar } from '@/components/ui/employee-avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/lib/utils';
import type { EmployeePayroll } from '@/types/employee-payroll';
import { Check, Eye, Filter, Info, MoreVertical, X } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';

interface EmployeePayrollTableProps {
    employees: EmployeePayroll[];
    searchValue: string;
    onSearchChange: (value: string) => void;
    onApproveAll: () => void;
    onFiltersClick: () => void;
    payrollId: string;
}

export function EmployeePayrollTable({
    employees,
    searchValue,
    onSearchChange,
    onApproveAll,
    onFiltersClick,
    payrollId,
}: EmployeePayrollTableProps) {
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const router = useRouter();

    const handleSelectAll = (checked: boolean) => {
        setSelectedEmployees(checked ? employees.map((emp) => emp.id) : []);
    };

    const handleSelectEmployee = (employeeId: string, checked: boolean) => {
        setSelectedEmployees((prev) =>
            checked
                ? [...prev, employeeId]
                : prev.filter((id) => id !== employeeId),
        );
    };

    const handleViewEmployee = (employeeId: string) => {
        router.push(
            `/account/payroll-summary/${payrollId}/employee/${employeeId}`,
        );
    };

    const handleApproveEmployee = (employeeId: string) => {
        // TODO: Implement approve logic
        console.log('Approve employee:', employeeId);
    };

    const handleRejectEmployee = (employeeId: string) => {
        // TODO: Implement reject logic
        console.log('Reject employee:', employeeId);
    };

    return (
        <div className="space-y-4 border border-[rgba(234,236,240,1)] p-5 bg-white rounded-lg">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={onFiltersClick}
                        className="flex items-center gap-2 bg-transparent"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                    <Button
                        onClick={onApproveAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white bg-[rgba(0,123,255,1)]"
                    >
                        Approve All payment
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedEmployees.length ===
                                                employees.length
                                            }
                                            onChange={(e) =>
                                                handleSelectAll(
                                                    e.target.checked,
                                                )
                                            }
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            User Role
                                            <Info className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            Base Pay
                                            <Info className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            Deductions
                                            <Info className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            Net Salary
                                            <Info className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
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
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1">
                                            Action
                                            <Info className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmployees.includes(
                                                    employee.id,
                                                )}
                                                onChange={(e) =>
                                                    handleSelectEmployee(
                                                        employee.id,
                                                        e.target.checked,
                                                    )
                                                }
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <EmployeeAvatar
                                                    src={employee.avatar}
                                                    name={employee.name}
                                                />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {employee.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {employee.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(employee.basePay)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(
                                                employee.deductions,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(employee.netSalary)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge
                                                status={employee.status}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleViewEmployee(
                                                                employee.id,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    <PermissionGate
                                                        permissions={[
                                                            PERMISSIONS.APPROVE_PAYROLL,
                                                        ]}
                                                        blockType="hide"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleApproveEmployee(
                                                                    employee.id,
                                                                )
                                                            }
                                                        >
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    </PermissionGate>
                                                    <PermissionGate
                                                        permissions={[
                                                            PERMISSIONS.APPROVE_PAYROLL,
                                                        ]}
                                                        blockType="hide"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRejectEmployee(
                                                                    employee.id,
                                                                )
                                                            }
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    </PermissionGate>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile/Tablet Grid */}
                <div className="lg:hidden">
                    <div className="hide-scrollbar overflow-x-auto">
                        <div className="grid grid-cols-8 gap-4 p-4 bg-gray-50 border-b border-gray-200 min-w-[900px]">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedEmployees.length ===
                                        employees.length
                                    }
                                    onChange={(e) =>
                                        handleSelectAll(e.target.checked)
                                    }
                                    className="rounded border-gray-300"
                                />
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee Name
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Role
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Base Pay
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Deductions
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Salary
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200 min-w-[900px]">
                            {employees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="grid grid-cols-8 gap-4 p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(
                                                employee.id,
                                            )}
                                            onChange={(e) =>
                                                handleSelectEmployee(
                                                    employee.id,
                                                    e.target.checked,
                                                )
                                            }
                                            className="rounded border-gray-300"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <EmployeeAvatar
                                            src={employee.avatar}
                                            name={employee.name}
                                            size="sm"
                                        />
                                        <span className="text-sm font-medium text-gray-900 truncate">
                                            {employee.name}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {employee.role}
                                    </div>
                                    <div className="text-sm text-gray-900">
                                        {formatCurrency(employee.basePay)}
                                    </div>
                                    <div className="text-sm text-gray-900">
                                        {formatCurrency(employee.deductions)}
                                    </div>
                                    <div className="text-sm text-gray-900">
                                        {formatCurrency(employee.netSalary)}
                                    </div>
                                    <div>
                                        <StatusBadge status={employee.status} />
                                    </div>
                                    <div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleViewEmployee(
                                                            employee.id,
                                                        )
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleApproveEmployee(
                                                            employee.id,
                                                        )
                                                    }
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Approve
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleRejectEmployee(
                                                            employee.id,
                                                        )
                                                    }
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Reject
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
