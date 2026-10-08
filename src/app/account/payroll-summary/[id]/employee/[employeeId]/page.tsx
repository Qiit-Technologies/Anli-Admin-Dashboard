'use client';

import { use, useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { PayslipHeader } from '@/components/account/payroll/payslip/PaySlipHeader';
import { SalaryBreakdown } from '@/components/account/payroll/payslip/SalaryBreakdown';
import { TaxesContributions } from '@/components/account/payroll/payslip/TaxesContribution';
import { Deductions } from '@/components/account/payroll/payslip/Deduction';
import { SummaryCards } from '@/components/account/payroll/payslip/SummaryCards';
import { usePayslipDetail } from '@/hooks/usePayslipDetails';
import useSWR from 'swr';
import {
    getEmployeePayrollDetails,
    verifyAndPayEmployee,
} from '@/app/actions/payroll';
import { Spinner } from '@heroui/react';
import type { Deduction } from '@/types/payslip';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import useHotel from '@/hooks/useHotel';

interface PayslipDetailPageProps {
    params: Promise<{ id: string; employeeId: string }>;
}

export default function PayslipDetailPage({ params }: PayslipDetailPageProps) {
    const { id, employeeId } = use(params);
    const [isLoading, setIsLoading] = useState(false);
    const hotel = useHotel();
    const [paystackReady, setPaystackReady] = useState(false);
    const [refetchkey, setRefetchkey] = useState('');

    // Remove 'pay_' prefix from employeeId
    const cleanEmployeeId = employeeId.replace('pay_', '');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => {
            setPaystackReady(true);
            console.log('✅ Paystack script loaded');
        };
        script.onerror = () => {
            console.error('❌ Failed to load Paystack script');
        };
        document.body.appendChild(script);
    }, []);

    const {
        data: payrollData,
        isLoading: payrollDataLoading,
        error,
    } = useSWR(
        [`/payroll/${cleanEmployeeId}/employee/payslip`, refetchkey],
        () => getEmployeePayrollDetails(cleanEmployeeId),
    );

    const employee = payrollData?.data;
    console.log('employee', employee);

    const { handleDownloadPayslip } = usePayslipDetail(id, employeeId);

    const breadcrumbItems = [
        { label: 'Back', href: `/account/payroll-summary/${id}` },
        { label: 'Payslip' },
    ];

    const handleApprovePayment = async () => {
        if (!paystackReady) {
            alert('Paystack is still loading. Try again shortly.');
            return;
        }

        if (!hotel.organization?.owner?.email) return;

        const paystack = (window as any).PaystackPop;

        setIsLoading(true);
        const handler = paystack?.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            email: hotel.organization?.owner.email,
            amount: Number(employee?.netPay) * 100,
            currency: 'NGN',
            reference: `REF-${id}-${Date.now()}`,
            payment_channels: ['card'],
            metadata: {
                custom_fields: [
                    {
                        display_name: hotel.organization.name,
                        variable_name: hotel.organization.id,
                        value: hotel.organization.id,
                    },
                ],
            },
            callback: function (response: { reference: string }) {
                // Call your async logic inside here
                verifyAndPayEmployee(
                    response.reference,
                    employee.id?.split('_')?.[1],
                )
                    .then((verify) => {
                        setIsLoading(false);
                        if (
                            verify.message
                            // 'Payroll Payment Verified and Paid Successful!'
                        ) {
                            toast.custom(() => (
                                <Toast
                                    title="Success!"
                                    description={verify.message}
                                    type="success"
                                />
                            ));
                        } else {
                            toast.custom(() => (
                                <Toast
                                    title="Error!"
                                    description={verify.message}
                                    type="error"
                                />
                            ));
                        }
                    })
                    .catch((error: any) => {
                        setIsLoading(false);

                        console.error('Error in callback:', error);
                        toast.error(
                            'An error occurred during payroll disbursement.',
                        );
                    })
                    .finally(() =>
                        setRefetchkey(
                            Math.random().toString(36).substring(2, 10),
                        ),
                    );
            },

            onClose: function () {
                console.log('Payment closed');
            },
        });

        handler.openIframe();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-none px-4 sm:px-6 lg:px-8 py-8">
                {payrollDataLoading ? (
                    <div className="fixed inset-0 flex justify-center items-center w-full h-screen">
                        <Spinner />
                    </div>
                ) : error ? (
                    <div className="fixed inset-0 flex justify-center items-center w-full h-screen">
                        <p className="font-bold text-3xl">An error occurred</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Breadcrumb items={breadcrumbItems} />

                        <PayslipHeader
                            employeeName={employee?.fullName}
                            jobDescription={employee?.jobDescription}
                            paymentPeriod={employee?.salaryPeriod}
                            dateOfJoining={employee?.dateOfJoining}
                            paymentDate={employee?.paymentDate}
                            salaryPayout={employee?.netSalary}
                            onApprovePayment={handleApprovePayment}
                            isApproving={isLoading}
                            onDownloadPayslip={handleDownloadPayslip}
                            status={employee?.status}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <SalaryBreakdown
                                    title="Final Net Salary"
                                    items={employee?.finalBreakdown}
                                />
                            </div>
                            <div className="space-y-6">
                                <TaxesContributions
                                    contributions={
                                        employee?.taxesAndContributions
                                    }
                                />
                                <Deductions deductions={employee?.deductions} />
                            </div>
                        </div>

                        <SummaryCards
                            totalEarnings={employee?.grossSalary}
                            totalDeductions={employee?.deductions?.reduce(
                                (sum: number, item: Deduction) =>
                                    sum + item.value,
                                0,
                            )}
                            finalPayout={employee?.finalBreakdown?.reduce(
                                (sum: number, item: Deduction) =>
                                    sum + item.value,
                                0,
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
