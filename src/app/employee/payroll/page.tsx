'use client';
import { getPayrollList, getPayrollStatsByHotel } from '@/app/actions/payroll';
import BrandButton from '@/components/common/Button';
import { StatCard } from '@/components/common/cards/StatCard';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import PayrollForm from '@/components/employee/common/forms/payroll';
import { PayrollColumns } from '@/components/employee/tables/columns/payroll';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import useSWR from 'swr';

const Payroll = () => {
    const [open, setOpen] = useState(false);
    const { data: payrollStats } = useSWR(
        '/payroll/stats',
        getPayrollStatsByHotel,
    );

    const { data: payrollList } = useSWR('/payroll/list', getPayrollList);

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Payroll"
                    subtitle={`Payslip Breakdown Generator feature that explains salary calculations in layman's terms:`}
                />
                <div className="ml-auto">
                    <PermissionGate
                        permissions={[
                            PERMISSIONS.VIEW_PAYROLL_DASHBOARD,
                            PERMISSIONS.GENERATE_PAYROLL,
                            PERMISSIONS.APPROVE_PAYROLL,
                            PERMISSIONS.DISBURSE_SALARIES,
                        ]}
                        permissionType="any"
                        blockType="modal"
                    >
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <BrandButton>Generate Payroll</BrandButton>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Generate Payroll</DialogTitle>
                                    <DialogDescription>
                                        Generate a monthly, bi-weekly, or weekly
                                        payroll
                                    </DialogDescription>
                                </DialogHeader>
                                <PayrollForm onSuccess={() => setOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </PermissionGate>
                </div>
            </PageHeader>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                {payrollStats?.data.map((stat: any) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        currentValue={stat.currentValue}
                        previousValue={stat.previousValue}
                        percentageChange={stat.percentageChange}
                    />
                ))}
            </div>
            <div>
                <CustomTable
                    columns={PayrollColumns}
                    data={payrollList?.data ?? []}
                    extend={
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.VIEW_PAYROLL_DASHBOARD,
                                PERMISSIONS.GENERATE_PAYROLL,
                                PERMISSIONS.APPROVE_PAYROLL,
                                PERMISSIONS.DISBURSE_SALARIES,
                            ]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <Button variant="outline">
                                Download All Payslip
                            </Button>
                        </PermissionGate>
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default Payroll;
