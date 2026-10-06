/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
    getAllBankAccounts,
    type BankAccount,
} from '@/app/actions/bank-accounts';
import {
    refundPayable,
    type RefundPayablePayload,
} from '@/app/actions/payables';
import CustomDialog from '@/components/common/CustomDialog';
import { DatePicker } from '@/components/common/DatePicker';
import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { formatBankAccountLabel } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';
import type { ARAPRow } from '../common/ARAPColumns';

function formatRefundRoomDisplay(selected: ARAPRow | null): string {
    if (!selected) return '';
    const num = selected.roomNumber;
    const typeName = selected.roomTypeName;
    if (num != null && String(num).trim() !== '' && typeName) {
        return `Room ${num} – ${typeName}`;
    }
    if (num != null && String(num).trim() !== '') {
        return `Room ${num}`;
    }
    return 'No room on file';
}

export const RefundBtn = ({ selected }: { selected: ARAPRow | null }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        reason: '',
        payment_method: '',
        hotel_account: '',
        date: '',
        roomId: '',
    });

    const roomDisplay = useMemo(
        () => formatRefundRoomDisplay(selected),
        [selected],
    );

    useEffect(() => {
        if (!open) return;
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const isoDate = `${yyyy}-${mm}-${dd}`;

        setFormData((prev) => ({
            ...prev,
            date: prev.date || isoDate,
            roomId: selected?.roomId != null ? String(selected.roomId) : '',
        }));
    }, [open, selected?.roomId]);

    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const bankAccountOptions = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );

    const isFormValid = () => {
        const amountNum = Number(formData.amount);
        return (
            !!selected &&
            !Number.isNaN(amountNum) &&
            amountNum > 0 &&
            amountNum <= (selected?.balance ?? 0) &&
            formData.payment_method.trim() !== '' &&
            formData.hotel_account.trim() !== '' &&
            formData.reason.trim() !== '' &&
            formData.date.trim() !== ''
        );
    };

    const handleConfirm = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const selectedAccountLabel =
                bankAccountOptions.find(
                    (option) => option.value === formData.hotel_account,
                )?.label ?? formData.hotel_account;

            const payload: RefundPayablePayload = {
                amount: Number(formData.amount || 0),
                paymentMethod: formData.payment_method,
                hotelAccount: selectedAccountLabel,
                date: formData.date,
                reason: formData.reason,
            };
            if (formData.roomId.trim() !== '') {
                payload.roomId = Number(formData.roomId);
            }
            const res = await refundPayable(Number(selected.guestId), payload);
            if ((res as any)?.error) {
                toast.error(
                    typeof (res as any).error === 'string'
                        ? (res as any).error
                        : 'Refund failed',
                );
            } else {
                toast.success('Refund processed successfully');
                await mutate('/accounts/payables');
                setOpen(false);
                setFormData({
                    name: '',
                    amount: '',
                    reason: '',
                    payment_method: '',
                    hotel_account: '',
                    date: '',
                    roomId: '',
                });
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Refund failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFormInput = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const transferOptions = [
        { value: 'transfer', label: 'Transfer' },
        { value: 'cash', label: 'Cash' },
    ];

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                disabled={!selected}
            >
                Refund
            </Button>
            <CustomDialog
                open={open}
                onOpenChange={setOpen}
                title="Refund"
                description={
                    selected
                        ? 'Enter the following details to Refund balance'
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
                        id="name"
                        label="Guest Name"
                        name="name"
                        value={
                            selected
                                ? `${selected.firstName} ${selected.lastName}`
                                : ''
                        }
                        readOnly={true}
                    />
                    <InputField
                        id="roomDisplay"
                        label="Room"
                        name="roomDisplay"
                        value={roomDisplay}
                        readOnly={true}
                    />
                    <DatePicker
                        id="date"
                        name="date"
                        label="Date"
                        value={formData.date}
                        onChange={(value) => handleFormInput('date', value)}
                    />
                    <InputField
                        id="balance"
                        label="Current Credit Balance"
                        name="balance"
                        value={
                            selected
                                ? `₦${Number(selected.balance).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                : ''
                        }
                        readOnly={true}
                    />
                    <InputField
                        id="amount"
                        label="Refund amount"
                        name="amount"
                        value={formData.amount}
                        placeholder="Enter Refund Amount"
                        type="number"
                        onChange={(e) =>
                            handleFormInput('amount', e.target.value)
                        }
                    />
                    <InputField
                        id="newBalance"
                        label="New Credit Balance"
                        name="newBalance"
                        value={
                            selected
                                ? `₦${Math.max(0, Number(selected.balance) - Number(formData.amount || 0)).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                : ''
                        }
                        readOnly={true}
                    />
                    <SelectField
                        id="payment_method"
                        name="payment_method"
                        label="Payment method"
                        required={true}
                        options={transferOptions}
                        value={formData.payment_method}
                        onValueChange={(value) =>
                            handleFormInput('payment_method', value)
                        }
                    />
                    <SelectField
                        id="hotel_account"
                        name="hotel_account"
                        label="Refund from (Hotel Account)"
                        required={true}
                        options={bankAccountOptions}
                        value={formData.hotel_account}
                        onValueChange={(value) =>
                            handleFormInput('hotel_account', value)
                        }
                    />
                    <InputField
                        id="reason"
                        label="Reason for refund"
                        name="reason"
                        value={formData.reason}
                        placeholder="Enter reason for refund"
                        onChange={(e) =>
                            handleFormInput('reason', e.target.value)
                        }
                    />
                </form>
            </CustomDialog>
        </>
    );
};
