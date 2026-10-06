'use client';
import { getGuestListByHotelId } from '@/app/actions/guest';
import { transferGuestFunds } from '@/app/actions/receivables';
import CustomDialog from '@/components/common/CustomDialog';
import { DatePicker } from '@/components/common/DatePicker';
import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { fetchRooms } from '@/hooks/fetcher';
import type { ROOM } from '@/types';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import type { ARAPRow } from '../common/ARAPColumns';

export const TransferBtn = ({ selected }: { selected: ARAPRow | null }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        roomFromId: '',
        toGuestId: '',
    });

    const { data: rooms = [] } = useSWR<ROOM[]>('/hotelRooms', fetchRooms);
    console.log(selected);
    const occupiedRoomOptions = Array.isArray(rooms)
        ? rooms
              .filter((r) => r.isOccupied)
              .map((r) => ({
                  value: r.id.toString(),
                  label: `${r?.guests?.[0]?.fullName ?? 'Unknown Guest'} - Room ${r?.roomNumber ?? 'N/A'} `,
              }))
        : [];
    // const availableRoomOptions = Array.isArray(rooms)
    //     ? rooms
    //           .filter((r) => !r.isOccupied)
    //           .map((r) => ({
    //               value: r.id.toString(),
    //               label: `Room ${r.roomNumber} - ${r.roomtype?.name ?? ''}`,
    //           }))
    //     : [];

    // Fetch guest list for destination selection
    const { data: guestListRes } = useSWR('guests-list', getGuestListByHotelId);
    const guestOptions = Array.isArray((guestListRes as any)?.data)
        ? ((guestListRes as any).data as any[]).map((g) => ({
              value: String(g.id ?? g.guestId ?? ''),
              label:
                  `${g.fullName ?? `${g.firstName ?? ''} ${g.lastName ?? ''}`}` +
                  `${g.roomNumber ? ` - Room ${g.roomNumber}` : ''}`,
          }))
        : [];

    // Auto-select the 'Transfer from Room' by roomId and set today’s date
    useEffect(() => {
        if (!open || !selected) return;

        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

        if (selected.roomId) {
            setFormData((prev) => ({
                ...prev,
                date: todayStr,
                roomFromId: String(selected.roomId),
            }));
        } else {
            // Still set date even if roomId is unavailable
            setFormData((prev) => ({
                ...prev,
                date: todayStr,
            }));
        }
    }, [open, selected]);

    const isFormValid = () => {
        if (!selected) return false;
        const amount = Number(formData.amount);
        const toIdNum = Number(formData.toGuestId);
        return (
            !!amount &&
            amount > 0 &&
            amount <= (selected?.balance ?? 0) &&
            !!formData.roomFromId &&
            !!formData.date &&
            !!formData.toGuestId &&
            !Number.isNaN(toIdNum) &&
            toIdNum !== Number(selected.guestId)
        );
    };

    const handleConfirm = async () => {
        if (!selected || !isFormValid()) return;
        setLoading(true);
        try {
            const res = await transferGuestFunds({
                fromGuestId: Number(selected.guestId),
                toGuestId: Number(formData.toGuestId),
                amount: Number(formData.amount || 0),
            });
            if ((res as any)?.error) {
                console.error((res as any).error);
            } else {
                await mutate('guests-list');
                setOpen(false);
                setFormData({
                    amount: '',
                    date: '',
                    roomFromId: '',
                    toGuestId: '',
                });
            }
        } catch (error: any) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleFormInput = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
                        ? 'Enter transfer details between guests'
                        : 'Select a receivable row first'
                }
                confirmText="Save"
                onConfirm={handleConfirm}
                isLoading={loading}
                maxWidth="md"
                footerType="full"
                confirmDisabled={!isFormValid()}
            >
                <form className="flex flex-col gap-4">
                    <SelectField
                        id="roomFromId"
                        name="roomFromId"
                        label="Transfer from Room"
                        value={formData.roomFromId}
                        onValueChange={(value) =>
                            handleFormInput('roomFromId', value)
                        }
                        options={occupiedRoomOptions}
                        placeholder="Select occupied room"
                    />
                    <InputField
                        readOnly={true}
                        id="balance"
                        value={
                            selected
                                ? `₦${Number(selected.balance).toLocaleString('en-NG')}`
                                : ''
                        }
                        name="balance"
                        label="Balance"
                    />
                    <InputField
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="Enter Amount"
                        label="Outstanding Amount To Transfer"
                        value={formData.amount}
                        onChange={(e) =>
                            handleFormInput('amount', e.target.value)
                        }
                    />
                    <DatePicker
                        id="date"
                        name="date"
                        label="Date"
                        value={formData.date}
                        onChange={(value) => handleFormInput('date', value)}
                    />
                    <SelectField
                        id="toGuestId"
                        name="toGuestId"
                        label="Transfer to Guest"
                        value={formData.toGuestId}
                        onValueChange={(value) =>
                            handleFormInput('toGuestId', value)
                        }
                        options={guestOptions}
                        placeholder="Select guest"
                    />
                </form>
            </CustomDialog>
        </>
    );
};
