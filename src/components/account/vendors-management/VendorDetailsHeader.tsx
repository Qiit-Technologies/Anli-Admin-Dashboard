'use client';

import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';

interface VendorDetailHeaderProps {
    vendorName: string;
    numberOfTransactions: number;
    lastTransactionDate: string;
    totalPurchaseValue: number;
    onDownloadPayslips: () => void;
}

export function VendorDetailHeader({
    vendorName,
    numberOfTransactions,
    lastTransactionDate,
    totalPurchaseValue,
    onDownloadPayslips,
}: VendorDetailHeaderProps) {
    return (
        <div className="bg-slate-800 text-white rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div>
                    <h3 className="text-sm text-gray-300 mb-1">Vendors name</h3>
                    <p className="text-lg font-semibold">{vendorName}</p>
                </div>
                <div>
                    <h3 className="text-sm text-gray-300 mb-1">
                        Number of Transactions
                    </h3>
                    <p className="text-lg font-semibold">
                        {numberOfTransactions}
                    </p>
                </div>
                <div>
                    <h3 className="text-sm text-gray-300 mb-1">
                        Last Transaction Date
                    </h3>
                    <p className="text-lg font-semibold">
                        {lastTransactionDate}
                    </p>
                </div>
                <div className="flex flex-col lg:items-end">
                    <div className="mb-4">
                        <h3 className="text-sm text-gray-300 mb-1">
                            Total Purchase Value
                        </h3>
                        <p className="text-2xl font-bold">
                            {formatCurrency(totalPurchaseValue)}
                        </p>
                    </div>
                    <PermissionGate
                        permissions={[
                            PERMISSIONS.DOWNLOAD_PAYROLL_SUMMARY,
                            PERMISSIONS.PRINT_PAYROLL_SLIP,
                        ]}
                        blockType="modal"
                    >
                        <Button
                            onClick={onDownloadPayslips}
                            variant="secondary"
                            className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download Payslips
                        </Button>
                    </PermissionGate>
                </div>
            </div>
        </div>
    );
}
