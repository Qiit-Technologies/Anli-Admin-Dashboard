'use client';
import {
    getPayrollById,
    verifyAndDisbursePayroll,
} from '@/app/actions/payroll';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { EmployeePayrollColumns } from '@/components/employee/tables/columns/employeePayroll';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
// import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import useHotel from '@/hooks/useHotel';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import { CreditCard } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
// import { useState } from 'react';
// import toast from 'react-hot-toast';
import { MdPayment } from 'react-icons/md';
import useSWR from 'swr';

declare global {
    interface Window {
        PaystackPop?: any;
    }
}

const PayrollPage = () => {
    const hotel = useHotel();
    const [paystackReady, setPaystackReady] = useState(false);

    // const [error, setError] = useState<string | null>(null);
    // const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();
    const { data: payroll } = useSWR(
        id ? `/payroll/${id}/employees` : null,
        () => getPayrollById(id),
    );

    const firstEntry = payroll?.data?.[0];

    const rawDate = firstEntry?.date;
    const payrollDate = rawDate ? new Date(rawDate) : null;

    const dayName = payrollDate
        ? payrollDate.toLocaleDateString('en-US', { weekday: 'long' })
        : '';

    const formattedDate = payrollDate
        ? payrollDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';

    const monthYear = payrollDate
        ? payrollDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
          })
        : '';

    const totalNetPay = payroll?.data?.reduce(
        (sum: number, entry: any) => sum + (entry.netPay || 0),
        0,
    );

    const handleReimbursement = async () => {
        // try {
        //     const response = await reimbursePayroll();
        //     if (response) {
        //         if (response.message === 'Reimbursement Successful!') {
        //             toast.custom(() => (
        //                 <Toast
        //                     title="Success!"
        //                     description={response.message}
        //                     type="success"
        //                 />
        //             ));
        //             setIsLoading(false);
        //         } else {
        //             toast.custom(() => (
        //                 <Toast
        //                     title="Error!"
        //                     description={response.message}
        //                     type="error"
        //                 />
        //             ));
        //         }
        //     }
        // } catch (err: unknown) {
        //     if (err instanceof Error) {
        //         setError(err.message);
        //     } else {
        //         setError('An unexpected error occurred');
        //     }
        // } finally {
        //     setIsLoading(false);
        // }
    };
    const handlePayNowDisbursement = async () => {
        if (!paystackReady) {
            alert('Paystack is still loading. Try again shortly.');
            return;
        }

        if (!payroll || !hotel.organization?.owner?.email) return;

        const totalAmount = payroll?.data?.reduce(
            (sum: number, entry: any) => sum + (entry.netPay || 0),
            0,
        );

        const paystack = (window as any).PaystackPop;

        const handler = paystack?.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            email: hotel.organization?.owner.email,
            amount: totalAmount * 100,
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
                verifyAndDisbursePayroll(response.reference, id)
                    .then((verify) => {
                        if (
                            verify.message ===
                            'Payroll Payment Verified and Disbursed Successful!'
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
                        console.error('Error in callback:', error);
                        toast.error(
                            'An error occurred during payroll disbursement.',
                        );
                    });
            },

            onClose: function () {
                console.log('Payment closed');
            },
        });

        handler.openIframe();
    };

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

    if (!id) {
        return <div>Error: Payroll Id Required</div>;
    }
    return (
        <PageWrapper>
            <PageHeader>
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href={`/employee/payroll`}
                    >
                        Back
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        {`Payroll Summary`}
                    </BreadcrumbItem>
                </Breadcrumbs>
            </PageHeader>
            <div>
                <PageHeader>
                    <div>
                        <PageHeadertitle
                            title={`Payroll Summary for ${id} - ${monthYear}`}
                            subtitle={`${dayName}, ${formattedDate}`}
                        />
                        <div className="text-sm text-gray-600 mt-1">
                            Total Net Pay: ₦{totalNetPay?.toLocaleString()}
                        </div>
                    </div>
                    <PermissionGate
                        permissions={[PERMISSIONS.PRINT_PAYROLL_SLIP]}
                        blockType="modal"
                    >
                        <Button className="ml-auto" variant={'outline'}>
                            Download All Payslip
                        </Button>
                    </PermissionGate>
                </PageHeader>
            </div>
            <div>
                <CustomTable
                    columns={EmployeePayrollColumns}
                    data={payroll?.data ?? []}
                    extend={
                        <PermissionGate
                            permissions={[PERMISSIONS.GENERATE_PAYROLL]}
                            blockType="modal"
                        >
                            {hotel?.organization?.disbursementType ===
                            'SEND_TO_ACCOUNT' ? (
                                <BrandButton
                                    icon={<CreditCard />}
                                    iconPosition="right"
                                    onClick={handleReimbursement}
                                >
                                    Send for disbursement
                                </BrandButton>
                            ) : (
                                <BrandButton
                                    icon={<MdPayment />}
                                    iconPosition="left"
                                    onClick={handlePayNowDisbursement}
                                    disabled={!paystackReady}
                                >
                                    Pay Now
                                </BrandButton>
                            )}
                        </PermissionGate>
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default PayrollPage;
