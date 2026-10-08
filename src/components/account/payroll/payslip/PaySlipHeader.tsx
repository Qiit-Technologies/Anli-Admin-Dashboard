'use client';

import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Spinner } from '@heroui/react';
import { Download } from 'lucide-react';

interface PayslipHeaderProps {
    employeeName: string;
    jobDescription: string;
    paymentPeriod: string;
    dateOfJoining: string;
    paymentDate: string;
    salaryPayout: number;
    onApprovePayment: () => Promise<void>;
    onDownloadPayslip: () => void;
    isApproving: boolean;
    status: string;
}

export function PayslipHeader({
    employeeName,
    jobDescription,
    paymentPeriod,
    dateOfJoining,
    paymentDate,
    salaryPayout,
    isApproving,
    onApprovePayment,
    onDownloadPayslip,
    status,
}: PayslipHeaderProps) {
    return (
        <div className="bg-[#031323] text-white rounded-[20px] p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-0">
                {/* Info Section */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Employee Info */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-medium text-[#898282] mb-1 tracking-wide">
                                Employee Name
                            </h3>
                            <p className="text-base font-semibold text-white">
                                {employeeName}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-[#898282] mb-1 tracking-wide">
                                Date Of Joining
                            </h3>
                            <p className="text-sm text-white">
                                {dateOfJoining}
                            </p>
                        </div>
                    </div>
                    {/* Job & Payment Info */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-medium text-[#898282] mb-1 tracking-wide">
                                Job Description
                            </h3>
                            <p className="text-sm text-white">
                                {jobDescription}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-[#898282] mb-1 tracking-wide">
                                Payment Date
                            </h3>
                            <p className="text-sm text-white">{paymentDate}</p>
                        </div>
                    </div>
                    {/* Payment Period */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-medium text-[#898282] mb-1 tracking-wide">
                                Payment
                            </h3>
                            <p className="text-sm text-white">
                                {paymentPeriod}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Divider */}
                <div className="hidden lg:flex w-px mx-8 bg-[#B1BDD4] rounded-full" />
                {/* Salary & Actions */}
                <div className="flex flex-col justify-between items-start min-w-[260px] pt-6 lg:pt-0 lg:pl-8">
                    <div className="mb-6 lg:mb-8">
                        <h3 className="text-xs font-medium text-[#898282] mb-2 tracking-wide">
                            Salary Payout for May
                        </h3>
                        <p className="font-bold text-[32px] md:text-[40px] leading-[40px] md:leading-[48px] text-white tracking-widest">
                            {formatCurrency(salaryPayout)}
                        </p>
                    </div>
                    {status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <PermissionGate
                                permissions={[PERMISSIONS.APPROVE_PAYROLL]}
                                blockType="modal"
                            >
                                <Button
                                    onClick={onApprovePayment}
                                    className="bg-[#0067D5] hover:bg-blue-700 text-white w-full sm:w-auto px-6 py-2 rounded-[8px] text-base font-medium"
                                >
                                    {isApproving ? (
                                        <Spinner size="sm" color="white" />
                                    ) : null}
                                    Approve Payment
                                </Button>
                            </PermissionGate>

                            <PermissionGate
                                permissions={[
                                    PERMISSIONS.DOWNLOAD_PAYROLL_SUMMARY,
                                    PERMISSIONS.PRINT_PAYROLL_SLIP,
                                ]}
                                blockType="modal"
                            >
                                <Button
                                    onClick={onDownloadPayslip}
                                    variant="secondary"
                                    className="bg-[#2A395B] hover:bg-gray-700 text-white flex items-center gap-2 w-full sm:w-auto px-6 py-2 rounded-[8px] text-base font-medium"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Payslips
                                </Button>
                            </PermissionGate>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
