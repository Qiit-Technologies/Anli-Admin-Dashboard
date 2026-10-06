'use client';

import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency } from '@/lib/utils';
import type { Vendor } from '@/types/vendor';
import { format } from 'date-fns';
import { Info } from 'lucide-react';

interface VendorTableProps {
    vendors: Vendor[];
    onViewVendor: (vendorId: string) => void;
}

export function VendorTable({
    vendors,
    onViewVendor,
    statusFilter,
    setStatusFilter,
}: VendorTableProps & {
    statusFilter?: string;
    setStatusFilter?: (status: string) => void;
}) {
    // Collect all unique statuses from vendors for the filter dropdown
    const allStatuses = Array.from(
        new Set((vendors || []).map((v) => v.status).filter(Boolean)),
    );
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Status Filter Dropdown */}
            {setStatusFilter && (
                <div className="p-4 flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                        Filter by Status:
                    </label>
                    <select
                        className="border rounded px-2 py-1"
                        value={statusFilter || ''}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        {allStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* Desktop Table */}
            <div className="hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendors
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Purchase Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        Number of Transactions
                                        <Info className="h-3 w-3 text-gray-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        Last Transaction Date
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
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vendors.map((vendor) => (
                                <tr
                                    key={vendor.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onViewVendor(vendor.id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {vendor.vendorName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {vendor.emailAddress}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(
                                            vendor.totalPurchaseValue ?? 0,
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {vendor.numberOfTransactions ?? 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {vendor.lastTransactionDate &&
                                            !isNaN(
                                                new Date(
                                                    vendor.lastTransactionDate,
                                                ).getTime(),
                                            )
                                                ? format(
                                                      new Date(
                                                          vendor.lastTransactionDate,
                                                      ),
                                                      'PPpp',
                                                  )
                                                : '—'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge
                                            status={vendor.status ?? ''}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <PermissionGate
                                            permissions={[
                                                PERMISSIONS.VENDORS_MANAGEMENT,
                                            ]}
                                            blockType="modal"
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewVendor(vendor.id);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                View
                                            </Button>
                                        </PermissionGate>
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
                    <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200 min-w-[900px]">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendors
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Purchase Value
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Number of Transactions
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Transaction Date
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200 min-w-[900px]">
                        {vendors.map((vendor) => (
                            <div
                                key={vendor.id}
                                className="grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => onViewVendor(vendor.id)}
                            >
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {vendor.vendorName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {vendor.emailAddress}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-900">
                                    {formatCurrency(
                                        vendor.totalPurchaseValue ?? 0,
                                    )}
                                </div>
                                <div className="text-sm text-gray-900">
                                    {vendor.numberOfTransactions ?? 0}
                                </div>
                                <div>
                                    <div className="text-sm text-gray-900">
                                        {
                                            vendor.lastTransactionDate?.split(
                                                ' ',
                                            )[0]
                                        }
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {
                                            vendor.lastTransactionDate?.split(
                                                ' ',
                                            )[1]
                                        }
                                    </div>
                                </div>
                                <div>
                                    <StatusBadge status={vendor.status} />
                                </div>
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewVendor(vendor.id);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        View
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
