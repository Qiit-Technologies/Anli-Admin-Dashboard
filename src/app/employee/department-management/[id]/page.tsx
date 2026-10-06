'use client';
import { getDepartmentById } from '@/app/actions/department';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { DepartmentEmployeeColumns } from '@/components/employee/tables/columns/departmentEmployee';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const DepartmentStaffs = () => {
    const { id } = useParams();
    const { data: departmentStaffs } = useSWR(
        id ? `/departments/${id}` : null,
        () => getDepartmentById(String(id)),
    );

    if (!id) {
        return <div>Error: Department ID is required</div>;
    }

    return (
        <PageWrapper>
            <div>
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href="/employee/department-management"
                    >
                        Back
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        {departmentStaffs?.data.name}
                    </BreadcrumbItem>
                </Breadcrumbs>
            </div>
            <PageHeader>
                <PageHeadertitle
                    title={`${departmentStaffs?.data.name} Department`}
                    subtitle={`We currently have ${departmentStaffs?.data.employees ? departmentStaffs?.data?.employees?.length : 0} employees in this ${departmentStaffs?.data.name} department.`}
                />
            </PageHeader>
            <div>
                <CustomTable
                    columns={DepartmentEmployeeColumns}
                    data={departmentStaffs?.data?.employees ?? []}
                />
            </div>
        </PageWrapper>
    );
};

export default DepartmentStaffs;
