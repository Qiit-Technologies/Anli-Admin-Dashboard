'use client';

import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { Bell, Download, Search } from 'lucide-react';

interface PayrollDetailHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onDownloadAll: () => void;
}

export function PayrollDetailHeader({
    searchValue,
    onSearchChange,
    onDownloadAll,
}: PayrollDetailHeaderProps) {
    return (
        <div className="space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-gray-300"
                >
                    <Bell className="h-4 w-4" />
                </Button>
            </div>

            {/* Title Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {/* Payroll Summary For {payrollRef}– {period} */}
                    </h1>
                    <p className="text-sm text-gray-600">
                        Payslip Breakdown Generator feature that explains salary
                        calculations in layman&apos;s terms:
                    </p>
                </div>
                <PermissionGate
                    permissions={[PERMISSIONS.PRINT_PAYROLL_SLIP]}
                    blockType="modal"
                >
                    <Button
                        onClick={onDownloadAll}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        Download All Payslips
                    </Button>
                </PermissionGate>
            </div>
        </div>
    );
}
