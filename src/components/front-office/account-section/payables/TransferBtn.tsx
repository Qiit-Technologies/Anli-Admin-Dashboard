/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomDialog from '@/components/common/CustomDialog';
import { InputField, SelectField } from '@/components/common/Form';

import { transferPayable } from '@/app/actions/payables';
import {
    createGuestProfile,
    linkGuestToProfile,
} from '@/app/actions/guest-profile';
import { DatePicker } from '@/components/common/DatePicker';
import { Button } from '@/components/ui/button';
import { fetchRooms } from '@/hooks/fetcher';
import type { ROOM } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import type { ARAPRow } from '../common/ARAPColumns';

function roomGuestLabel(r: ROOM): string {
    const num = r?.roomNumber ?? 'N/A';
    const name = r?.guests?.[0]?.fullName ?? 'Unknown Guest';
    return `Room ${num} - ${name}`;
}

type TransferTargetOption = {
    value: string;
    label: string;
    guestId: number;
    guestProfileId?: number;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
};

export const TransferBtn = ({ selected }: { selected: ARAPRow | null }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        toGuestSelectionId: '',
    });
    const [amountError, setAmountError] = useState('');

    const { data: rooms = [] } = useSWR<ROOM[]>('/hotelRooms', fetchRooms);

    const transferToGuestOptions = useMemo<TransferTargetOption[]>(() => {
        if (!Array.isArray(rooms)) return [];
        return rooms
            .filter((r) => r.isOccupied && Boolean(r.guests?.[0]))
            .map((r) => {
                const guest = r.guests?.[0];
                return {
                    value: String(guest?.id ?? ''),
                    label: roomGuestLabel(r),
                    guestId: Number(guest?.id ?? 0),
                    guestProfileId: guest?.guestProfile?.id
                        ? Number(guest.guestProfile.id)
                        : undefined,
                    fullName: guest?.fullName,
                    email: guest?.email,
                    phoneNumber: guest?.phoneNumber,
                };
            })
            .filter(
                (option) =>
                    option.guestId > 0 &&
                    option.guestProfileId !== Number(selected?.guestId || 0),
            );
    }, [rooms, selected?.guestId]);

    const transferToGuestSelectOptions = useMemo(
        () =>
            transferToGuestOptions.map((option) => ({
                value: option.value,
                label: option.label,
            })),
        [transferToGuestOptions],
    );

    useEffect(() => {
        if (!open || !selected) return;

        const todayStr = new Date().toLocaleDateString('en-CA');

        setFormData({
            amount: '',
            date: todayStr,
            toGuestSelectionId: '',
        });
    }, [open, selected]);

    const isFormValid = () => {
        const amountNum = Number(formData.amount.replace(/,/g, ''));
        const selectedBalance = Number(selected?.balance || 0);

        return (
            !!selected &&
            !Number.isNaN(amountNum) &&
            amountNum > 0 &&
            amountNum <= selectedBalance &&
            formData.toGuestSelectionId.trim() !== '' &&
            formData.date.trim() !== ''
        );
    };

    const ensureDestinationProfileId = async (
        option: TransferTargetOption,
    ): Promise<number> => {
        if (option.guestProfileId) {
            return option.guestProfileId;
        }

        if (
            !option.fullName?.trim() &&
            !option.email?.trim() &&
            !option.phoneNumber?.trim()
        ) {
            throw new Error(
                'Selected checked-in guest has no details to create a profile.',
            );
        }

        const profileResult = await createGuestProfile({
            fullName: option.fullName?.trim() || undefined,
            email: option.email?.trim() || undefined,
            phoneNumber: option.phoneNumber?.trim() || undefined,
        });

        if (profileResult.error || !profileResult.data) {
            throw new Error(
                profileResult.error ||
                    'Failed to create a guest profile for the selected guest.',
            );
        }

        const linkResult = await linkGuestToProfile(
            option.guestId,
            profileResult.data.id,
        );

        if (linkResult.error) {
            throw new Error(linkResult.error);
        }

        return profileResult.data.id;
    };

    const handleConfirm = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const destination = transferToGuestOptions.find(
                (option) => option.value === formData.toGuestSelectionId,
            );

            if (!destination) {
                toast.error('Please select a checked-in guest to transfer to.');
                return;
            }

            const toGuestProfileId =
                await ensureDestinationProfileId(destination);

            const payload = {
                amount: Number(formData.amount.replace(/,/g, '') || 0),
                fromGuestProfileId: Number(selected.guestId || 0),
                toGuestProfileId,
                date: formData.date,
            };
            const res = await transferPayable(
                Number(selected.guestId),
                payload,
            );
            if ((res as any)?.error) {
                toast.error(
                    typeof (res as any).error === 'string'
                        ? (res as any).error
                        : 'Transfer failed',
                );
            } else {
                toast.success('Transfer completed successfully');
                await mutate('/accounts/payables');
                setOpen(false);
                setFormData({
                    amount: '',
                    toGuestSelectionId: '',
                    date: '',
                });
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFormInput = (field: string, value: string) => {
        if (field === 'amount') {
            // Format amount with commas
            const cleanValue = value.replace(/[^\d.]/g, '');
            const numericValue = parseFloat(cleanValue) || 0;
            const formattedValue = numericValue.toLocaleString('en-US');
            setFormData((prev) => ({ ...prev, [field]: formattedValue }));

            // Validate amount against balance
            if (selected && numericValue > (selected.balance || 0)) {
                setAmountError('Amount exceeds available balance');
            } else {
                setAmountError('');
            }
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant={'outline'}
                disabled={!selected}
            >
                Transfer
            </Button>

            <CustomDialog
                open={open}
                onOpenChange={setOpen}
                title="Transfer"
                description={
                    selected
                        ? 'Transfer payable credit to another guest.'
                        : 'Select a payable row first'
                }
                confirmText="Save"
                onConfirm={handleConfirm}
                isLoading={loading}
                maxWidth="md"
                footerType="full"
                confirmDisabled={!isFormValid()}
            >
                <form className="flex flex-col gap-4">
                    <InputField
                        readOnly={true}
                        id="fromProfile"
                        name="fromProfile"
                        label="Transfer from Profile"
                        value={
                            selected?.fullName ||
                            `${selected?.firstName || ''} ${selected?.lastName || ''}`.trim()
                        }
                    />
                    <InputField
                        readOnly={true}
                        id="balance"
                        value={
                            selected?.balance !== undefined
                                ? Number(selected.balance).toLocaleString(
                                      'en-NG',
                                  )
                                : ''
                        }
                        name="balance"
                        label="Balance"
                    />
                    <div>
                        <InputField
                            id="amount"
                            name="amount"
                            label="Amount to transfer"
                            value={formData.amount}
                            onChange={(e) =>
                                handleFormInput('amount', e.target.value)
                            }
                            type="text"
                            placeholder="0.00"
                        />
                        {amountError && (
                            <p className="text-red-500 text-sm mt-1">
                                {amountError}
                            </p>
                        )}
                    </div>
                    <DatePicker
                        id="date"
                        name="date"
                        label="Date"
                        value={formData.date}
                        onChange={(value) => handleFormInput('date', value)}
                    />
                    <SelectField
                        id="toGuestSelectionId"
                        name="toGuestSelectionId"
                        label="Transfer to Checked-in Guest"
                        value={formData.toGuestSelectionId}
                        onValueChange={(value) =>
                            handleFormInput('toGuestSelectionId', value)
                        }
                        options={transferToGuestSelectOptions}
                        placeholder="Select destination guest"
                    />
                </form>
            </CustomDialog>
        </>
    );
};
