'use client';

import { getCheckedInGuests } from '@/app/actions/reservation';
import {
    applyRoomRebate,
    getRoomRebateState,
    removeRoomRebate,
    type RoomRebateState,
} from '@/app/actions/room-rebate';
import BrandButton from '@/components/common/Button';
import { DatePicker } from '@/components/common/DatePicker';
import {
    InputField,
    SelectField,
    TextAreaField,
} from '@/components/common/Form';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import Toast from '@/components/toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

function formatCurrency(num?: number | string) {
    const n = Number(num ?? 0);
    try {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
        }).format(n);
    } catch {
        return `₦${n.toFixed(2)}`;
    }
}

function hasAnyRebateSignal(guest: any): boolean {
    if (!guest) return false;

    const hasRebateRate =
        guest.rebateRate !== null &&
        guest.rebateRate !== undefined &&
        guest.rebateRate !== '';
    const hasRebateComment =
        typeof guest.rebateComment === 'string' &&
        guest.rebateComment.trim().length > 0;
    const hasEffectiveDate =
        guest.rebateEffectiveDate !== null &&
        guest.rebateEffectiveDate !== undefined &&
        guest.rebateEffectiveDate !== '';
    const hasAppliedAt =
        guest.rebateAppliedAt !== null &&
        guest.rebateAppliedAt !== undefined &&
        guest.rebateAppliedAt !== '';

    return (
        hasRebateRate || hasRebateComment || hasEffectiveDate || hasAppliedAt
    );
}

type InHouseGuest = {
    id: number;
    fullName?: string;
    roomNumber?: number | string;
    room?: {
        roomNumber?: number | string;
        price?: number | string;
    } | null;
    originalPrice?: number | string;
    rebateRate?: number | string | null;
    rebateComment?: string | null;
    rebateEffectiveDate?: string | null;
    rebateAppliedAt?: string | null;
};

async function fetchInHouseGuests(): Promise<InHouseGuest[]> {
    const result = await getCheckedInGuests();
    if (result?.error) {
        throw new Error(result.error);
    }
    return Array.isArray(result?.data) ? result.data : [];
}

export default function RoomRebatingPage() {
    const { data: inHouseGuests, isLoading } = useSWR<InHouseGuest[]>(
        '/room-rebating/checked-in-guests',
        fetchInHouseGuests,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            fallbackData: [],
        },
    );
    const guests = inHouseGuests ?? [];

    const roomOptions = useMemo(() => {
        return guests.map((guest) => {
            const roomNumber =
                guest.room?.roomNumber ?? guest.roomNumber ?? 'N/A';
            return {
                value: String(guest.id),
                label: `${guest.fullName || 'Guest'} - Room ${roomNumber}`,
            };
        });
    }, [guests]);

    const [selectedGuestId, setSelectedGuestId] = useState<string>('');
    const selectedGuest = useMemo(() => {
        if (!selectedGuestId) return undefined;
        return guests.find((g) => String(g.id) === String(selectedGuestId));
    }, [guests, selectedGuestId]);

    const [date, setDate] = useState<string>(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });
    const [currentRate, setCurrentRate] = useState<string>('');
    const [newRate, setNewRate] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const [removeReason, setRemoveReason] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);

    const rebateStateKey = selectedGuestId
        ? `/room-rebating/rebate-state/${selectedGuestId}`
        : null;
    const { data: rebateState, isLoading: rebateStateLoading } =
        useSWR<RoomRebateState | null>(
            rebateStateKey,
            async () => {
                const id = Number(selectedGuestId);
                if (!Number.isFinite(id) || id <= 0) return null;

                const result = await getRoomRebateState(id);
                if (result?.error) {
                    throw new Error(result.error);
                }

                return (result?.data as RoomRebateState) ?? null;
            },
            {
                revalidateOnFocus: false,
                shouldRetryOnError: false,
                fallbackData: null,
            },
        );

    const activeRebateRateRaw =
        rebateState?.rebateRate ?? selectedGuest?.rebateRate;
    const hasActiveRebate =
        rebateState?.hasActiveRebate ?? hasAnyRebateSignal(selectedGuest);
    const activeRebateRate = Number(activeRebateRateRaw ?? 0);

    useEffect(() => {
        if (selectedGuest) {
            const priceNumber = Number(
                selectedGuest.room?.price ?? selectedGuest.originalPrice ?? 0,
            );
            setCurrentRate(formatCurrency(priceNumber));
            setNewRate(
                formatCurrency(
                    hasActiveRebate ? activeRebateRate : priceNumber,
                ),
            );
        } else {
            setCurrentRate('');
            setNewRate('');
        }
        setRemoveReason('');
    }, [selectedGuest, hasActiveRebate, activeRebateRate]);

    const handleApplyRebating = async () => {
        if (!selectedGuest?.id) {
            toast.error('Please select a room with a checked-in guest');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please provide a comment explaining the rebate');
            return;
        }

        const newRateNumber = Number(newRate.replace(/[^0-9.]/g, ''));
        if (isNaN(newRateNumber) || newRateNumber < 0) {
            toast.error('Please enter a valid new rate');
            return;
        }

        setLoading(true);
        try {
            const result = await applyRoomRebate({
                guestId: selectedGuest.id,
                newRate: newRateNumber,
                effectiveDate: date,
                comment: comment.trim(),
            });

            if (result.error) {
                await mutate('/room-rebating/checked-in-guests');
                if (rebateStateKey) {
                    await mutate(rebateStateKey);
                }
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        type="error"
                        description={result.error}
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        type="success"
                        description={
                            result.message ||
                            'Room rebate applied successfully!'
                        }
                    />
                ));
                await mutate('/room-rebating/checked-in-guests');
                if (rebateStateKey) {
                    await mutate(rebateStateKey);
                }
                // Reset form
                setDate(new Date().toISOString().split('T')[0]);
                setComment('');
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    type="error"
                    description="An unexpected error occurred"
                />
            ));
            console.error('Error applying rebate:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRebating = () => {
        if (!selectedGuest?.id) {
            toast.error('Please select a room with a checked-in guest');
            return;
        }
        if (!hasActiveRebate) {
            toast.error('No active rebate found for selected guest');
            return;
        }
        if (!removeReason.trim()) {
            toast.error('Please provide a reason for removing rebate');
            return;
        }
        setRemoveConfirmOpen(true);
    };

    const confirmRemoveRebating = async () => {
        if (!selectedGuest?.id) {
            toast.error('Please select a room with a checked-in guest');
            return;
        }
        setRemoveConfirmOpen(false);
        setLoading(true);
        try {
            const result = await removeRoomRebate({
                guestId: selectedGuest.id,
                reason: removeReason.trim(),
            });

            if (result.error) {
                if (rebateStateKey) {
                    await mutate(rebateStateKey);
                }
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        type="error"
                        description={result.error}
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        type="success"
                        description={
                            result.message ||
                            'Room rebate removed successfully!'
                        }
                    />
                ));
                await mutate('/room-rebating/checked-in-guests');
                if (rebateStateKey) {
                    await mutate(rebateStateKey);
                }
                setSelectedGuestId('');
                setCurrentRate('');
                setNewRate('');
                setComment('');
                setRemoveReason('');
                setDate(new Date().toISOString().split('T')[0]);
            }
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    type="error"
                    description="An unexpected error occurred"
                />
            ));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Room Rebating"
                    subtitle="Adjust a guest's current room rate for the rest of their stay"
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="w-full">
                    <Card className="w-full max-w-[640px] mx-auto bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                        <div className="flex flex-col gap-4">
                            {/* Room Number */}
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">
                                    Room Number
                                </label>
                                <SelectField
                                    id="roomNumber"
                                    name="roomNumber"
                                    label=""
                                    value={selectedGuestId}
                                    onValueChange={(v) => setSelectedGuestId(v)}
                                    options={roomOptions}
                                    placeholder={
                                        isLoading || rebateStateLoading
                                            ? 'Loading checked-in guests...'
                                            : roomOptions.length === 0
                                              ? 'No checked-in guests'
                                              : 'Select guest/room'
                                    }
                                    className="h-10 bg-white border-gray-300 text-gray-800"
                                    disabled={loading}
                                />
                            </div>

                            {/* Date */}
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">
                                    Date
                                </label>
                                <div className="flex-1">
                                    <DatePicker
                                        id="rebateDate"
                                        name="rebateDate"
                                        value={date}
                                        onChange={setDate}
                                        disabled={loading}
                                        className="bg-white border-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Current Rate */}
                            <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                <label className="text-sm text-gray-600">
                                    Current Rate
                                </label>
                                <InputField
                                    id="currentRate"
                                    name="currentRate"
                                    label=""
                                    placeholder="₦0.00"
                                    value={currentRate}
                                    readOnly
                                    className="bg-gray-50 border-gray-300 h-10"
                                />
                            </div>

                            {!hasActiveRebate && (
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <label className="text-sm text-gray-600">
                                        New Rate
                                    </label>
                                    <InputField
                                        id="newRate"
                                        name="newRate"
                                        label=""
                                        placeholder="₦0.00"
                                        value={newRate}
                                        onChange={(e) =>
                                            setNewRate(e.target.value)
                                        }
                                        onBlur={(e) => {
                                            const raw = e.target.value;
                                            const amount = Number(
                                                raw.replace(/[^0-9.]/g, ''),
                                            );
                                            setNewRate(
                                                formatCurrency(
                                                    isNaN(amount) ? 0 : amount,
                                                ),
                                            );
                                        }}
                                        className="bg-white border-gray-300 h-10"
                                        disabled={loading || !selectedGuestId}
                                    />
                                </div>
                            )}

                            {hasActiveRebate && (
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <label className="text-sm text-gray-600">
                                        Active Rebate
                                    </label>
                                    <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                        Rebated nightly rate:{' '}
                                        <span className="font-medium">
                                            {formatCurrency(activeRebateRate)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!hasActiveRebate && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                                    <label className="text-sm text-gray-600 mt-2">
                                        Comment
                                    </label>
                                    <TextAreaField
                                        id="comment"
                                        name="comment"
                                        label=""
                                        placeholder="Add a note (e.g., Manager asked to do so)"
                                        value={comment}
                                        onChange={(e) =>
                                            setComment(e.target.value)
                                        }
                                        rows={4}
                                        className="bg-white border-gray-300 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {hasActiveRebate && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                                    <span />
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                        This guest already has an active room
                                        rebate. Remove it first before applying
                                        a new rebate.
                                    </p>
                                </div>
                            )}

                            {hasActiveRebate && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                                    <label className="text-sm text-gray-600 mt-2">
                                        Remove Reason
                                    </label>
                                    <TextAreaField
                                        id="removeReason"
                                        name="removeReason"
                                        label=""
                                        placeholder="Why should this rebate be removed?"
                                        value={removeReason}
                                        onChange={(e) =>
                                            setRemoveReason(e.target.value)
                                        }
                                        rows={3}
                                        className="bg-white border-gray-300 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {!hasActiveRebate && (
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <span />
                                    <BrandButton
                                        type="button"
                                        fullWidth
                                        onClick={handleApplyRebating}
                                        disabled={
                                            loading ||
                                            !selectedGuestId ||
                                            !comment.trim()
                                        }
                                    >
                                        {loading
                                            ? 'Applying...'
                                            : 'Apply Rebating'}
                                    </BrandButton>
                                </div>
                            )}

                            {hasActiveRebate && (
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <span />
                                    <BrandButton
                                        type="button"
                                        fullWidth
                                        onClick={handleRemoveRebating}
                                        disabled={
                                            loading || !removeReason.trim()
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {loading
                                            ? 'Removing...'
                                            : 'Remove Rebate'}
                                    </BrandButton>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </PageWrapper>
            <AlertDialog
                open={removeConfirmOpen}
                onOpenChange={setRemoveConfirmOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove active rebate?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the rebate for the selected
                            in-house guest and revert to the room&apos;s normal
                            rate.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => void confirmRemoveRebating()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Remove rebate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
