'use client';

import { ReviewLeaveRequest } from '@/app/actions/employee';
import BrandButton from '@/components/common/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { mutate } from 'swr';
import { useUser } from '@/context/useUser';

interface LeaveRequest {
    requestId: string;
    employeeName: string;
    employeeImage: string;
    department: string;
    jobTitle: string;
    startTime: string;
    endTime: string;
    requestDate: string;
    expectedReturnDate: string;
    reason: string;
    status: 'Request Granted' | 'Request Denied' | 'Pending';
}

const ViewRequest = ({ request }: { request: LeaveRequest }) => {
    const [openShiftDialog, setOpenShiftDialog] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { user } = useUser();

    const handleSubmit = async (formData: any) => {
        setLoading(true);
        try {
            const response = await ReviewLeaveRequest(
                request.requestId?.toString()?.slice(2),
                formData,
            );
            if (response.message === 'Leave reaquest updated Successful!') {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Leave reaquest updated successfully!"
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

    return (
        <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
            <DialogTrigger asChild>
                <button className="text-muted-foreground hover:underline">
                    View
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Leave Request Details</DialogTitle>
                    <DialogDescription>
                        More information about the leave request
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 border rounded-lg p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium">Requested By</p>
                            <p className="text-sm text-muted-foreground">
                                {request.employeeName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Department</p>
                            <p className="text-sm text-muted-foreground">
                                {request.department}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Status</p>
                            <p className="text-sm text-muted-foreground">
                                {request.status}
                            </p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Reason</p>
                        <p className="text-sm text-muted-foreground">
                            {request.reason}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium">Request Date</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(
                                    request.requestDate,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                Expected Return
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(
                                    request.expectedReturnDate,
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Start Time</p>
                            <p className="text-sm text-muted-foreground">
                                {request.startTime}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">End Time</p>
                            <p className="text-sm text-muted-foreground">
                                {request.endTime}
                            </p>
                        </div>
                    </div>

                    {request.status == 'Pending' && (
                        <div className="flex w-full gap-2">
                            <BrandButton
                                loading={isLoading}
                                onClick={() =>
                                    handleSubmit({
                                        reviewer: user?.id,
                                        status: 'approved',
                                    })
                                }
                            >
                                Approve Request
                            </BrandButton>
                            <BrandButton
                                loading={isLoading}
                                className="border-orion-blue text-orion-blue bg-white hover:bg-white"
                                onClick={() =>
                                    handleSubmit({
                                        reviewer: user?.id,
                                        status: 'rejected',
                                    })
                                }
                            >
                                Reject Request
                            </BrandButton>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewRequest;
