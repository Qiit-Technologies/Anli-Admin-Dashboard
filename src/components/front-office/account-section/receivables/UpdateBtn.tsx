/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomDialog from '@/components/common/CustomDialog';
import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import type { ARAPRow } from '../common/ARAPColumns';
import { payReceivableAction } from '@/app/actions/receivables';
import { mutate } from 'swr';
import useSWR from 'swr';
import {
    getAllBankAccounts,
    type BankAccount,
} from '@/app/actions/bank-accounts';
import { formatBankAccountLabel } from '@/lib/utils';
import { DatePicker } from '@/components/common/DatePicker';

export const UpdateBtn = ({ selected }: { selected: ARAPRow | null }) => {
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const bankAccountOptions = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        receivingAccount: '',
    });

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
        }));
    }, [open]);

    const isFormValid = () => {
        if (!selected) return false;
        const amount = Number(formData.amount);
        return (
            !!amount &&
            amount > 0 &&
            amount <= (selected?.balance ?? 0) &&
            !!formData.date &&
            !!formData.receivingAccount
        );
    };

    const handleFormInput = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleConfirm = async () => {
        if (!selected) return;
        const amount = Number(formData.amount);
        if (!amount || amount <= 0) return;
        if (amount > selected.balance) return;
        setLoading(true);
        try {
            const res = await payReceivableAction(selected.accountId ?? selected.guestId ?? 0, amount);
            if ((res as any)?.error) {
                console.error((res as any).error);
            } else {
                await mutate('/accounts/receivables');
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
            setOpen(false);
            setFormData({
                amount: '',
                date: '',
                receivingAccount: '',
            });
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="w-full"
                disabled={!selected}
            >
                Update
            </Button>
            <CustomDialog
                open={open}
                onOpenChange={setOpen}
                title="Update"
                description={
                    selected
                        ? `Outstanding: ₦${selected.balance}`
                        : 'Select a receivable row first'
                }
                confirmText="Done"
                onConfirm={handleConfirm}
                isLoading={loading}
                maxWidth="md"
                footerType="full"
                confirmDisabled={!isFormValid()}
            >
                <form className="flex flex-col gap-4">
                    <InputField
                        id="userName"
                        name="userName"
                        type="text"
                        label="Guest Name"
                        value={selected?.fullName || (selected ? `${selected.firstName} ${selected.lastName}`.trim() : '')}
                        readOnly
                    />
                    <InputField
                        id="lastRoomBooked"
                        name="lastRoomBooked"
                        type="text"
                        label="Last Room Booked"
                        value={selected?.roomNumber ? String(selected.roomNumber) : 'No room'}
                        readOnly
                    />
                    <DatePicker
                        id="date"
                        name="date"
                        label="Date"
                        value={formData.date}
                        onChange={(value) => handleFormInput('date', value)}
                    />
                    <SelectField
                        id="receivingAccount"
                        name="receivingAccount"
                        label="Account paid into"
                        value={formData.receivingAccount}
                        onValueChange={(value) =>
                            handleFormInput('receivingAccount', value)
                        }
                        options={bankAccountOptions}
                        placeholder="Select bank account"
                    />
                    <InputField
                        id="amount"
                        name="amount"
                        type="number"
                        placeholder="Enter Amount"
                        label="Amount to apply"
                        value={formData.amount}
                        onChange={(e) =>
                            handleFormInput('amount', e.target.value)
                        }
                    />
                    <InputField
                        id="balance"
                        name="balance"
                        type="text"
                        label="New Balance"
                        value={
                            selected
                                ? `₦${Math.max(0, Number(selected.balance) - Number(formData.amount || 0)).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                : ''
                        }
                        readOnly
                    />
                </form>
            </CustomDialog>
        </>
    );
};
