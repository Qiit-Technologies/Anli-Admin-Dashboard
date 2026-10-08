'use client';
import { getLeaveRequests } from '@/app/actions/employee';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { LeaveRequestColumns } from '@/components/employee/tables/columns/leave-request';
import useSWR, { mutate } from 'swr';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import LeaveForm from '@/components/employee/common/forms/leave';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { CreateLeaveRequest } from '@/app/actions/employee';
import { useUser } from '@/context/useUser';

const LeaveIntegration = () => {
    const [openShiftDialog, setOpenShiftDialog] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { user } = useUser();

    const { data: leaveRequests } = useSWR(
        'employees/leave-request',
        getLeaveRequests,
    );

    const handleSubmit = async (formData: any) => {
        if (!user?.id) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="User session not found. Please log in again."
                    type="error"
                />
            ));
            return;
        }
        setLoading(true);
        try {
            const response = await CreateLeaveRequest(user.id, formData);
            console.log('response', response);
            if (response.message === 'Leave reaquest created Successful!') {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Leave reaquest created successfully!"
                        type="success"
                    />
                ));
                mutate('employees/leave-request');
                setOpenShiftDialog(false);
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
            setLoading(false);
        }
    };

    const onCancel = () => setOpenShiftDialog(false);

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Leave Integration"
                    subtitle={`Manage leave requests`}
                />
                <Dialog
                    open={openShiftDialog}
                    onOpenChange={setOpenShiftDialog}
                >
                    <DialogTrigger asChild>
                        <BrandButton className="ml-auto">
                            Create Leave Request
                        </BrandButton>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle className="sr-only">
                            Create Leave Request
                        </DialogTitle>
                        <LeaveForm
                            isLoading={isLoading}
                            onSubmit={handleSubmit}
                            onCancel={onCancel}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>
            <div>
                <CustomTable
                    columns={LeaveRequestColumns}
                    data={leaveRequests?.data ?? []}
                />
            </div>
        </PageWrapper>
    );
};

export default LeaveIntegration;
