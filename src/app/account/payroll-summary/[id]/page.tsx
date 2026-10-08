'use client';

import {
    getPayrollById,
    rejectEmployeePayroll,
    verifyAndDisbursePayroll,
    verifyAndPayEmployee,
} from '@/app/actions/payroll';
import { PayrollDetailHeader } from '@/components/account/payroll/PayrollDetailsHeader';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { PayrollEmployeeColumns } from '@/components/kitchen/tables/columns/PayrollEmployeeColumns';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import Toast from '@/components/toast';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import useHotel from '@/hooks/useHotel';
import { Spinner, useDisclosure } from '@heroui/react';
import { Filter } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const breadcrumbItems = [
    { label: 'Back', href: `/account/payroll-summary` },
    { label: 'Employee' },
];

export default function PayrollSummaryPage() {
    const { id } = useParams();
    const [searchValue, setSearchValue] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [paystackReady, setPaystackReady] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const hotel = useHotel();
    const [refetchkey, setRefetchkey] = useState('');
    const {
        isOpen: isCreateModalOpen,
        onOpen: onCreateModalOpen,
        onClose: onCreateModalClose,
    } = useDisclosure();

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

    const router = useRouter();

    const { data: payrollData, isLoading } = useSWR(
        [`/payroll/employees?payrollId=${Number(id)}`, refetchkey],
        () => getPayrollById(id),
    );

    const employees = payrollData?.data;
    const handleSelectAll = (checked: boolean) => {
        setSelectedEmployees(
            checked ? employees.map((emp: any) => emp.id) : [],
        );
    };

    const handleSelectEmployee = (employeeId: string, checked: boolean) => {
        setSelectedEmployees((prev) =>
            checked
                ? [...prev, employeeId]
                : prev.filter((id) => id !== employeeId),
        );
    };

    const handleViewEmployee = (employeeId: string) => {
        router.push(`/account/payroll-summary/${id}/employee/${employeeId}`);
    };

    const handlePayNowDisbursement = async () => {
        setActionLoading(true);
        if (!paystackReady) {
            alert('Paystack is still loading. Try again shortly.');
            return;
        }

        if (!payrollData || !hotel.organization?.owner?.email) return;

        // Only include employees who are not already paid
        const unpaidEmployees = payrollData?.data?.filter(
            (employee: any) => employee.status !== 'paid',
        );

        if (!unpaidEmployees || unpaidEmployees.length === 0) {
            toast.custom(() => (
                <Toast
                    title="Info"
                    description="All employees have already been paid!"
                    type="info"
                />
            ));
            setActionLoading(false);
            return;
        }

        const totalAmount = unpaidEmployees.reduce(
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
                    })
                    .finally(() => {
                        setRefetchkey(
                            Math.random().toString(36).substring(2, 10),
                        );
                        setActionLoading(false);
                    });
            },

            onClose: function () {
                console.log('Payment closed');
            },
        });

        handler.openIframe();
    };

    const handleRejectPayroll = useCallback(
        async (employeeId: string, reason: string) => {
            try {
                setActionLoading(true);
                const response = await rejectEmployeePayroll(
                    employeeId?.split('_')?.[1],
                    reason,
                );

                if (response.data) {
                    if (response.data.error && response.data.message)
                        toast.custom(() => (
                            <Toast
                                title="Error"
                                description={`${response.data.message}`}
                                type="error"
                            />
                        ));
                    else if (!response.data.error)
                        toast.custom(() => (
                            <Toast
                                title="Success!"
                                description={`Employee payroll rejected!`}
                                type="success"
                            />
                        ));
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error"
                            description={`Failed to process. Please try again.`}
                            type="error"
                        />
                    ));
                }
                setRefetchkey(Math.random().toString(36).substring(2, 10));
                setActionLoading(false);
                onCreateModalClose();
            } catch (error: any) {
                setActionLoading(false);
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Failed to process. Please try again.`}
                        type="error"
                    />
                ));
            }
        },
        [id],
    );

    const handleEmployeePayroll = async (employee: any) => {
        setActionLoading(true);
        if (!paystackReady) {
            alert('Paystack is still loading. Try again shortly.');
            return;
        }

        if (!hotel.organization?.owner?.email) return;

        const paystack = (window as any).PaystackPop;

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
                        console.error('Error in callback:', error);
                        toast.error(
                            'An error occurred during payroll disbursement.',
                        );
                    })
                    .finally(() => {
                        setRefetchkey(
                            Math.random().toString(36).substring(2, 10),
                        );
                        setActionLoading(false);
                    });
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
                {isLoading ? (
                    <div className="fixed inset-0 flex justify-center items-center w-full h-screen">
                        <Spinner />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Breadcrumb items={breadcrumbItems} />

                        <PayrollDetailHeader
                            searchValue={searchValue}
                            onSearchChange={setSearchValue}
                            onDownloadAll={() => {}}
                        />
                        <div className="space-y-4 border border-[rgba(234,236,240,1)] p-5 bg-white rounded-lg">
                            {/* Search and Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="relative flex-1 max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchValue}
                                        onChange={(e) =>
                                            setSearchValue(e.target.value)
                                        }
                                        className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        // onClick={onFiltersClick}
                                        className="flex items-center gap-2 bg-transparent"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Filters
                                    </Button>
                                    <PermissionGate
                                        permissions={[
                                            PERMISSIONS.APPROVE_PAYROLL,
                                            PERMISSIONS.DISBURSE_SALARIES,
                                        ]}
                                        blockType="modal"
                                    >
                                        <Button
                                            onClick={handlePayNowDisbursement}
                                            className="bg-blue-600 hover:bg-blue-700 text-white bg-[rgba(0,123,255,1)]"
                                        >
                                            {(() => {
                                                const unpaidCount =
                                                    employees?.filter(
                                                        (emp: any) =>
                                                            emp.status !==
                                                            'paid',
                                                    ).length || 0;
                                                return unpaidCount > 0
                                                    ? `Approve All (${unpaidCount} unpaid)`
                                                    : 'All Paid';
                                            })()}
                                        </Button>
                                    </PermissionGate>
                                </div>
                            </div>
                            <CustomTable
                                variant="none"
                                hasHeader={false}
                                data={employees || []}
                                columns={() =>
                                    PayrollEmployeeColumns({
                                        isOpen: isCreateModalOpen,
                                        onOpen: onCreateModalOpen,
                                        onClose: onCreateModalClose,
                                        isLoading: actionLoading,
                                        selectedEmployees,
                                        setSelectedEmployees,
                                        handleSelectAll,
                                        handleSelectEmployee,
                                        handleViewEmployee,
                                        handleApproveEmployee: (employee) =>
                                            handleEmployeePayroll(employee),
                                        handleRejectEmployee: (id, reason) =>
                                            handleRejectPayroll(id, reason),
                                    })
                                }
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
