'use client';
import { getEmployees } from '@/app/actions/employee';
import BrandButton from '@/components/common/Button';
import { CustomSheet } from '@/components/common/CustomSheet';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import EmployeeMultiStepForm from '@/components/employee/common/forms/employee';
import { EmployeeColumns } from '@/components/employee/tables/columns/employeeMgm';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';

const EmployeeManagement = () => {
    const { data: staff } = useSWR('/employees', getEmployees);
    const [opened, setOpened] = useState(false);
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Employee Management"
                    subtitle={`Manage your employees efficiently`}
                />
            </PageHeader>
            <div>
                <CustomTable
                    columns={EmployeeColumns}
                    data={staff ?? []}
                    extend={
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                                PERMISSIONS.MANAGE_EMPLOYEE,
                                PERMISSIONS.VIEW_DEPARTMENT_MANAGEMENT,
                                PERMISSIONS.VIEW_ATTENDANCE_MANAGEMENT,
                                PERMISSIONS.VIEW_ATTENDANCE_RECORDS,
                                PERMISSIONS.VIEW_EMPLOYEE_REPORTS,
                                PERMISSIONS.VIEW_SALARY_HISTORY,
                                PERMISSIONS.VIEW_TAX_AND_PENSION,
                                PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                            ]}
                            blockType="modal"
                        >
                            <CustomSheet
                                className="md:max-w-[700px]"
                                open={opened}
                                setOpen={setOpened}
                                title="Add New Employee"
                                trigger={
                                    <BrandButton
                                        icon={<Plus />}
                                        iconPosition="left"
                                    >
                                        Add New Employee
                                    </BrandButton>
                                }
                            >
                                <EmployeeMultiStepForm
                                    onClose={() => setOpened(false)}
                                />
                            </CustomSheet>
                        </PermissionGate>
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default EmployeeManagement;
