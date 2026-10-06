'use client';
import { getAttendanceData } from '@/app/actions/attendance';
import { getEmployeeSummary } from '@/app/actions/employee';
import { getPayrollList, getPayrollSummary } from '@/app/actions/payroll';
import { createTask, getAllEmployeeTask } from '@/app/actions/task';
import BrandButton from '@/components/common/Button';
import { StatCard } from '@/components/common/cards/StatCard';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { MetricCard } from '@/components/employee/common/cards/ChartCard';
import TaskForm, {
    Task as FormTask,
} from '@/components/employee/common/forms/task';
import { TimelineComponent } from '@/components/employee/common/TimelineComponent';
import { miniAttendanceColumns } from '@/components/employee/tables/columns/attendanceCheckin';
import { PayrollColumns } from '@/components/employee/tables/columns/payroll';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useUser } from '@/context/useUser';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const Dashboard = () => {
    const { user } = useUser();

    const { data: allEmployee, error } = useSWR(
        '/employees/dashboard/summary',
        getEmployeeSummary,
    );

    const { data: attendance } = useSWR('/attendance', getAttendanceData);

    const { data: payroll } = useSWR('/payroll/list', getPayrollList);

    const { data: payrollSmmmary } = useSWR(
        '/payroll/summary',
        getPayrollSummary,
    );

    const { data: employeeTask } = useSWR(
        '/employees/task',
        getAllEmployeeTask,
    );

    const [isOpen, setIsOpen] = useState(false);

    if (error) {
        console.error('Error fetching:', error);
    }
    const handleAddTask = async (data: FormTask) => {
        setIsOpen(false);
        try {
            const response = await createTask(data);
            if (response.message === 'Task Created Successful!') {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Task Created Successful!"
                        type="success"
                    />
                ));
                setIsOpen(false);
                return;
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.message ??
                            'Something went wrong. Please try again.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsOpen(false);
        }
    };

    const totalEmloyee = allEmployee?.data.reduce(
        (acc: any, cur: any) => acc + cur.value,
        0,
    );
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Dashboard"
                    subtitle={`Welcome ${user?.fullName}`}
                />
            </PageHeader>
            <div className="flex flex-col">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <MetricCard
                        title="Total Employee"
                        value={totalEmloyee}
                        change={10}
                        changeType="positive"
                        dataPoints={allEmployee?.data ?? []}
                    />
                    <StatCard
                        title="Total Payroll"
                        currentValue={payrollSmmmary?.data?.currentValue ?? 0}
                        percentageChange={
                            payrollSmmmary?.data?.percentageChange ?? 0
                        }
                        previousValue={payrollSmmmary?.data?.previousValue ?? 0}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TimelineComponent
                    title="Project Timeline"
                    description="Scheduled tasks and deadlines"
                    data={employeeTask?.data ?? []}
                    extend={
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                                PERMISSIONS.MANAGE_EMPLOYEE,
                            ]}
                            blockType="modal"
                        >
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <BrandButton>Add Task</BrandButton>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Task</DialogTitle>
                                    </DialogHeader>
                                    <TaskForm
                                        onSubmit={handleAddTask}
                                        mode="create"
                                    />
                                </DialogContent>
                            </Dialog>
                        </PermissionGate>
                    }
                />
                <CustomTable
                    hasHeader={false}
                    variant="default"
                    title="Attendance Checkin"
                    columns={miniAttendanceColumns}
                    data={attendance?.data ?? []}
                    pageSize={10}
                    isPaginated={false}
                    hasFilter={false}
                    fullWidth={true}
                />
            </div>
            <div>
                <CustomTable
                    hasHeader={false}
                    columns={PayrollColumns}
                    data={payroll?.data ?? []}
                />
            </div>
        </PageWrapper>
    );
};

export default Dashboard;
