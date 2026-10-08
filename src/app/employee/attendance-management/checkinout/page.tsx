'use client';
import { getAttendanceCheckins } from '@/app/actions/attendance';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { attendanceCheckinColumns } from '@/components/employee/tables/columns/attendanceCheckin';
import useSWR from 'swr';

const CheckInOutPage = () => {
    const { data: attendanceData } = useSWR(
        '/employees/check-ins',
        getAttendanceCheckins,
    );
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Clock In/Out Management"
                    subtitle={`Manage employee clock in and out times efficiently`}
                />
            </PageHeader>
            <div>
                <CustomTable
                    columns={attendanceCheckinColumns}
                    data={attendanceData?.data ?? []}
                />
            </div>
        </PageWrapper>
    );
};

export default CheckInOutPage;
