'use client';

import { updateReservationDates } from '@/app/actions/reservation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ReservationDateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation: {
        id: number;
        fullName: string;
        startDate: string;
        endDate: string;
        startTime?: string | null;
        endTime?: string | null;
        isCheckedIn: boolean;
    } | null;
    onUpdateComplete?: () => void;
    onSuccess?: () => void;
}

export default function ReservationDateModal({
    open,
    onOpenChange,
    reservation,
    onUpdateComplete,
    onSuccess,
}: ReservationDateModalProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [dateData, setDateData] = useState({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
    });
    const router = useRouter();

    useEffect(() => {
        if (open && reservation) {
            setDateData({
                startDate: reservation.startDate.split('T')[0],
                endDate: reservation.endDate.split('T')[0],
                startTime: reservation.startTime || '14:00',
                endTime: reservation.endTime || '12:00',
            });
        }
    }, [open, reservation]);

    // Cleanup effect when modal closes
    useEffect(() => {
        if (!open) {
            setIsUpdating(false);
            // Reset form data when modal closes
            setDateData({
                startDate: '',
                endDate: '',
                startTime: '',
                endTime: '',
            });
        }
    }, [open]);

    const handleClose = () => {
        setIsUpdating(false);
        onOpenChange(false);
    };

    const handleUpdateDates = async () => {
        if (!reservation) return;

        // Validate dates
        const startDate = new Date(dateData.startDate);
        const endDate = new Date(dateData.endDate);
        
        if (startDate >= endDate) {
            toast.error('Check-out date must be after check-in date');
            return;
        }

        // Don't allow changing check-in date if already checked in
        if (reservation.isCheckedIn && dateData.startDate !== reservation.startDate.split('T')[0]) {
            toast.error('Guest is already checked in. Only check-out date can be modified.');
            return;
        }

        setIsUpdating(true);
        try {
            const updateData = {
                startDate: dateData.startDate,
                endDate: dateData.endDate,
                startTime: dateData.startTime,
                endTime: dateData.endTime,
            };

            const result = await updateReservationDates(reservation.id.toString(), updateData);

            if (result.error) {
                throw new Error(result.error);
            }

            toast.success(`Dates updated for ${reservation.fullName}`);

            handleClose();
            onUpdateComplete?.();
            onSuccess?.();
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while updating the reservation');
        } finally {
            setIsUpdating(false);
        }
    };

    const calculateNights = () => {
        if (!dateData.startDate || !dateData.endDate) return 0;
        const start = new Date(dateData.startDate);
        const end = new Date(dateData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] w-full rounded-2xl p-0">
                <div className="pt-6 pr-6 pb-6 pl-6">
                    <DialogHeader className="relative pb-4 border-b border-[#EAECF0]">
                        <button
                            onClick={handleClose}
                            className="absolute right-0 top-0 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity z-10"
                            type="button"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </button>
                        <DialogTitle className="text-lg font-semibold text-[#101828] flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#007BFF]" />
                            Modify Reservation Dates
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#667085]">
                            Update check-in and check-out dates for this reservation.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Guest Info */}
                    <div className="mt-6 p-4 bg-[#F6FEF9] border border-[#A7F0C7] rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#A7F0C7] flex items-center justify-center">
                                <span className="text-sm font-semibold text-[#067647]">
                                    {reservation.fullName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#101828]">{reservation.fullName}</p>
                                <p className="text-xs text-[#667085]">
                                    Reservation #{reservation.id}
                                    {reservation.isCheckedIn && (
                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                            Checked In
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Date Form */}
                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate" className="text-sm font-medium text-[#344054]">
                                    Check-in Date
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={dateData.startDate}
                                    onChange={(e) => setDateData(prev => ({ ...prev, startDate: e.target.value }))}
                                    disabled={reservation.isCheckedIn}
                                    className="mt-1"
                                />
                                {reservation.isCheckedIn && (
                                    <p className="text-xs text-[#667085] mt-1">
                                        Cannot modify - guest is checked in
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="endDate" className="text-sm font-medium text-[#344054]">
                                    Check-out Date
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={dateData.endDate}
                                    onChange={(e) => setDateData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startTime" className="text-sm font-medium text-[#344054]">
                                    Check-in Time
                                </Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={dateData.startTime}
                                    onChange={(e) => setDateData(prev => ({ ...prev, startTime: e.target.value }))}
                                    disabled={reservation.isCheckedIn}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="endTime" className="text-sm font-medium text-[#344054]">
                                    Check-out Time
                                </Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={dateData.endTime}
                                    onChange={(e) => setDateData(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Duration Display */}
                        <div className="p-3 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg">
                            <p className="text-sm text-[#667085]">
                                Duration: <span className="font-medium text-[#101828]">{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</span>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1 h-12 border-[#D0D5DD] text-[#344054]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateDates}
                            disabled={isUpdating}
                            className="flex-1 h-12 bg-[#007BFF] hover:bg-[#0056B3] text-white"
                        >
                            {isUpdating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    Update Dates
                                    <Calendar className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Info Note */}
                    <p className="mt-4 text-xs text-[#667085] text-center">
                        Room availability will be automatically updated. Billing adjustments may apply for date changes.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}