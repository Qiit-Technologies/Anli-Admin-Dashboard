'use client';

import {
    cancelBooking,
    getFacilities,
    updateBooking,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { CustomSheet } from '@/components/common/CustomSheet';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatMemberFullName } from '@/lib/membership/member-utils';
import {
    BookingStatus,
    Facility,
    MemberBooking,
} from '@/types/membership/membership';
import { format } from 'date-fns';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

interface BookingActionProps {
    booking: MemberBooking;
}

interface EditBookingFormData {
    facilityId: number;
    startTime: string;
    endTime: string;
    status: BookingStatus;
}

const BookingAction = ({ booking }: BookingActionProps) => {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');

    const [formData, setFormData] = useState<EditBookingFormData>({
        facilityId: booking.facility?.id ?? 0,
        startTime: booking.startTime
            ? format(new Date(booking.startTime), "yyyy-MM-dd'T'HH:mm")
            : '',
        endTime: booking.endTime
            ? format(new Date(booking.endTime), "yyyy-MM-dd'T'HH:mm")
            : '',
        status: booking.status,
    });

    const { data: facilitiesData } = useSWR(
        '/membership/facilities',
        getFacilities,
    );
    const facilities = facilitiesData?.data?.facilities || [];

    useEffect(() => {
        setFormData({
            facilityId: booking.facility?.id ?? 0,
            startTime: booking.startTime
                ? format(new Date(booking.startTime), "yyyy-MM-dd'T'HH:mm")
                : '',
            endTime: booking.endTime
                ? format(new Date(booking.endTime), "yyyy-MM-dd'T'HH:mm")
                : '',
            status: booking.status,
        });
    }, [booking]);

    const handleEdit = async () => {
        if (!formData.facilityId || !formData.startTime || !formData.endTime) {
            toast.custom(() => (
                <Toast
                    title="Validation Error"
                    description="Please fill in all required fields"
                    type="error"
                />
            ));
            return;
        }

        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            toast.custom(() => (
                <Toast
                    title="Validation Error"
                    description="End time must be after start time"
                    type="error"
                />
            ));
            return;
        }

        setEditLoading(true);
        try {
            const result = await updateBooking(booking.id, {
                facilityId: formData.facilityId,
                startTime: formData.startTime,
                endTime: formData.endTime,
                status: formData.status,
            });

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            result.error ||
                            'Failed to update booking. Please try again.'
                        }
                        type="error"
                    />
                ));
                return;
            }

            await mutate('/membership/booking');
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description="Booking updated successfully"
                    type="success"
                />
            ));
            setEditOpen(false);
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to update booking. Please try again."
                    type="error"
                />
            ));
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteReason.trim()) {
            toast.custom(() => (
                <Toast
                    title="Validation Error"
                    description="Please provide a reason for cancellation"
                    type="error"
                />
            ));
            return;
        }

        setDeleteLoading(true);
        try {
            const { data, error } = await cancelBooking(booking.id, {
                reason: deleteReason,
            });

            if (error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            data.message ||
                            'Failed to cancel booking. Please try again.'
                        }
                        type="error"
                    />
                ));
                return;
            }

            await mutate('/membership/booking');
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description="Booking cancelled successfully"
                    type="success"
                />
            ));
            setDeleteOpen(false);
            setDeleteReason('');
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to cancel booking. Please try again."
                    type="error"
                />
            ));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleInputChange = (
        field: keyof EditBookingFormData,
        value: string | number,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="flex items-center gap-2">
            <CustomSheet
                trigger={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                }
                title="Edit Booking"
                subTitle={`Booking for ${formatMemberFullName(booking.member)}`}
                open={editOpen}
                setOpen={setEditOpen}
            >
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                            Member Information
                        </h4>
                        <p className="text-sm text-gray-600">
                            {formatMemberFullName(booking.member)}
                        </p>
                        <p className="text-sm text-gray-600">
                            {booking.member?.email || '—'}
                        </p>
                    </div>

                    <SelectField
                        id="facility"
                        name="facility"
                        label="Facility"
                        value={formData.facilityId.toString()}
                        onValueChange={(value) =>
                            handleInputChange('facilityId', parseInt(value))
                        }
                        options={facilities.map((facility: Facility) => ({
                            value: facility.id.toString(),
                            label: facility.name,
                        }))}
                        placeholder="Select a facility"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            id="startTime"
                            name="startTime"
                            label="Start Time"
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) =>
                                handleInputChange('startTime', e.target.value)
                            }
                            required
                        />
                        <InputField
                            id="endTime"
                            name="endTime"
                            label="End Time"
                            type="datetime-local"
                            value={formData.endTime}
                            onChange={(e) =>
                                handleInputChange('endTime', e.target.value)
                            }
                            required
                        />
                    </div>

                    <SelectField
                        id="status"
                        name="status"
                        label="Status"
                        value={formData.status}
                        onValueChange={(value) =>
                            handleInputChange('status', value as BookingStatus)
                        }
                        options={[
                            {
                                value: BookingStatus.CONFIRMED,
                                label: 'Confirmed',
                            },
                            {
                                value: BookingStatus.CANCELLED,
                                label: 'Cancelled',
                            },
                            {
                                value: BookingStatus.COMPLETED,
                                label: 'Completed',
                            },
                        ]}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={() => setEditOpen(false)}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <BrandButton
                            onClick={handleEdit}
                            disabled={editLoading}
                            className="flex-1"
                        >
                            {editLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Booking'
                            )}
                        </BrandButton>
                    </div>
                </div>
            </CustomSheet>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this booking for{' '}
                            <strong>{formatMemberFullName(booking.member)}</strong>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">
                                Booking Details:
                            </p>
                            <p className="text-sm text-gray-600">
                                {booking.facility?.name ?? 'Unknown facility'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {format(new Date(booking.startTime), 'PPP p')} -{' '}
                                {format(new Date(booking.endTime), 'p')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deleteReason">
                                Reason for cancellation *
                            </Label>
                            <Textarea
                                id="deleteReason"
                                placeholder="Please provide a reason for cancelling this booking..."
                                value={deleteReason}
                                onChange={(e) =>
                                    setDeleteReason(e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDeleteOpen(false);
                                setDeleteReason('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteLoading || !deleteReason.trim()}
                        >
                            {deleteLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                'Cancel Booking'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookingAction;
