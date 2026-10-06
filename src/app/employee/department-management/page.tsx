'use client';
import { getDepartments, getDepartmentStats } from '@/app/actions/department';
import BrandButton from '@/components/common/Button';
import { StatCard } from '@/components/common/cards/StatCard';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import DepartmentForm from '@/components/employee/common/forms/department';
import { DepartmentColumns } from '@/components/employee/tables/columns/department';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import useSWR from 'swr';

const DepartmentManagement = () => {
    const { data: departments } = useSWR('/departments', getDepartments);
    const { data: departmentStats } = useSWR(
        '/departments/stats',
        getDepartmentStats,
    );

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Department Management"
                    subtitle={`List of all departments in the organization`}
                />
            </PageHeader>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {departmentStats?.data?.map((stat: any) => (
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
                    columns={DepartmentColumns}
                    data={departments ?? []}
                    extend={
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                                PERMISSIONS.MANAGE_EMPLOYEE,
                                PERMISSIONS.VIEW_DEPARTMENT_MANAGEMENT,
                            ]}
                            blockType="modal"
                        >
                            <Dialog>
                                <DialogTrigger asChild>
                                    <BrandButton
                                        icon={<Plus />}
                                        iconPosition="left"
                                    >
                                        Create Department
                                    </BrandButton>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogTitle className="sr-only">
                                        Create Department
                                    </DialogTitle>
                                    <DepartmentForm />
                                </DialogContent>
                            </Dialog>
                        </PermissionGate>
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default DepartmentManagement;
