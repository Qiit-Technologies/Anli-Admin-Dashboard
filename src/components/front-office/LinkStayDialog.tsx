'use client';

import { useState, useEffect } from 'react';
import CustomDialog from '@/components/common/CustomDialog';
import { SearchableSelect } from '@/components/common/Form';
import { linkGuestToProfile } from '@/app/actions/guest-profile';
import { getAllReservations } from '@/app/actions/reservation';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

interface LinkStayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    profileId: number;
    profileName: string;
}

export function LinkStayDialog({
    open,
    onOpenChange,
    onSuccess,
    profileId,
    profileName,
}: LinkStayDialogProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingStays, setFetchingStays] = useState(false);
    const [stays, setStays] = useState<any[]>([]);
    const [selectedStayId, setSelectedStayId] = useState<string>('');

    useEffect(() => {
        if (open) {
            fetchStays();
        }
    }, [open]);

    const fetchStays = async () => {
        setFetchingStays(true);
        try {
            // Fetch ALL stays (Upcoming, Current, and Past)
            // The backend has been updated to return everything if no filters are provided
            const result = await getAllReservations();

            if (result?.data) {
                const allStays = result.data;
                // Remove duplicates and sort by start date (newest first)
                const uniqueStays = Array.from(
                    new Map(allStays.map((s: any) => [s.id, s])).values(),
                );
                uniqueStays.sort(
                    (a: any, b: any) =>
                        new Date(b.startDate).getTime() -
                        new Date(a.startDate).getTime(),
                );
                setStays(uniqueStays);
            }
        } catch (error: any) {
            console.error('Error fetching stays:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to fetch existing stays"
                    type="error"
                />
            ));
        } finally {
            setFetchingStays(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedStayId) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please select a stay to link"
                    type="error"
                />
            ));
            return;
        }

        setLoading(true);
        try {
            const result = await linkGuestToProfile(
                parseInt(selectedStayId),
                profileId,
            );

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            result.error ?? 'Failed to link stay to profile'
                        }
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Stay linked to profile successfully"
                        type="success"
                    />
                ));
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            console.error('Error linking stay:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to link stay to profile"
                    type="error"
                />
            ));
        } finally {
            setLoading(false);
        }
    };

    const stayOptions = stays.map((stay) => {
        const status = stay.isCheckedOut
            ? 'Past'
            : stay.isCheckedIn
              ? 'Current'
              : 'Upcoming';
        return {
            value: stay.id.toString(),
            label: `[${status}] ${stay.fullName || 'No Name'} (${stay.bookingCode || 'No Code'}) - Room ${stay.roomNumber || 'N/A'} [${stay.startDate}]`,
        };
    });

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Link Stay to Profile"
            description={`Select an existing stay (reservation) to link to ${profileName}'s profile.`}
            confirmText="Link Stay"
            cancelText="Cancel"
            onConfirm={handleConfirm}
            isLoading={loading}
            confirmDisabled={!selectedStayId || loading}
            maxWidth="2xl"
        >
            <div className="space-y-4 py-4">
                <SearchableSelect
                    label="Select Stay / Reservation"
                    id="stay"
                    options={stayOptions}
                    value={selectedStayId}
                    onValueChange={setSelectedStayId}
                    placeholder={
                        fetchingStays
                            ? 'Loading stays...'
                            : 'Search for a stay (name, code, room...)'
                    }
                    className="w-full"
                />

                {stays.length === 0 && !fetchingStays && (
                    <p className="text-sm text-gray-500 italic">
                        No stays found to link.
                    </p>
                )}
            </div>
        </CustomDialog>
    );
}
