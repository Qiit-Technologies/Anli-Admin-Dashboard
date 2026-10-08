'use client';

import {
    getAllBankAccounts,
    type BankAccount,
} from '@/app/actions/bank-accounts';
import AmountInput from '@/components/common/AmountInput';
import { DatePicker } from '@/components/common/DatePicker';
import {
    InputField,
    SelectField,
    TextAreaField,
} from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import { amountRawToNumber } from '@/lib/amount-format';
import { submitAccountFunding } from '@/lib/internal-accounts/funding';
import { formatBankAccountLabel } from '@/lib/utils';
import {
    AddFundsFormValues,
    APPROVAL_REQUIRED_OPTIONS,
    FUNDING_SOURCE_OPTIONS,
    InternalAccount,
} from '@/types/internal-accounts';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import InternalAccountModalShell from './InternalAccountModalShell';

interface AddFundsModalProps {
    open: boolean;
    onOpenChange: (_isOpen: boolean) => void;
    account: InternalAccount | null;
    onSuccess?: () => void;
    submitting?: boolean;
    onSubmit?: (_values: AddFundsFormValues) => Promise<void>;
}

function todayIsoDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function AddFundsModal({
    open,
    onOpenChange,
    account,
    onSuccess,
    submitting: externalSubmitting = false,
    onSubmit,
}: Readonly<AddFundsModalProps>) {
    const { user } = useUser();
    const [amountRaw, setAmountRaw] = useState('');
    const [fundingDate, setFundingDate] = useState(todayIsoDate());
    const [accountReceivedInto, setAccountReceivedInto] = useState('');
    const [approvalRequired, setApprovalRequired] = useState('no');
    const [fundingSource, setFundingSource] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [internalSubmitting, setInternalSubmitting] = useState(false);

    const { data: bankAccounts = [] } = useSWR(
        open ? '/accounts' : null,
        getAllBankAccounts,
    );

    const bankAccountOptions = useMemo(
        () =>
            (bankAccounts as BankAccount[]).map((bankAccount) => ({
                label: formatBankAccountLabel(bankAccount),
                value:
                    bankAccount.accountNumber?.toString() ||
                    String(bankAccount.id),
            })),
        [bankAccounts],
    );

    const submitting = externalSubmitting || internalSubmitting;

    useEffect(() => {
        if (!open) return;

        setAmountRaw('');
        setFundingDate(todayIsoDate());
        setAccountReceivedInto('');
        setApprovalRequired(account?.approvalRequired ? 'yes' : 'no');
        setFundingSource('');
        setDescription('');
        setError('');
    }, [open, account]);

    const resetAndClose = () => {
        onOpenChange(false);
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!account) {
            setError('No account selected.');
            return;
        }

        const amount = amountRawToNumber(amountRaw);
        if (amount <= 0) {
            setError('Please enter a valid amount greater than zero.');
            return;
        }
        if (!fundingDate) {
            setError('Funding date is required.');
            return;
        }
        if (!accountReceivedInto) {
            setError('Select the account funds were received into.');
            return;
        }
        if (!fundingSource) {
            setError('Select a funding source.');
            return;
        }
        if (!description.trim()) {
            setError('Description / reason is required.');
            return;
        }

        const values: AddFundsFormValues = {
            amount,
            fundingDate,
            accountReceivedInto,
            approvalRequired: approvalRequired as 'yes' | 'no',
            fundingSource,
            description: description.trim(),
        };

        try {
            if (onSubmit) {
                await onSubmit(values);
            } else {
                setInternalSubmitting(true);
                const initiatedBy =
                    user?.fullName || account.responsiblePerson || 'Admin';
                const result = await submitAccountFunding(
                    account,
                    values,
                    initiatedBy,
                );
                setInternalSubmitting(false);

                if (result.error) {
                    throw new Error(result.error);
                }
            }

            onSuccess?.();
            resetAndClose();
        } catch (err: unknown) {
            setInternalSubmitting(false);
            setError(
                err instanceof Error ? err.message : 'Failed to add funds.',
            );
        }
    };

    if (!account) return null;

    return (
        <InternalAccountModalShell
            open={open}
            onOpenChange={onOpenChange}
            title="Add funding"
        >
            <form onSubmit={handleFormSubmit} className="px-6 pb-6 pt-5">
                {error && (
                    <p className="mb-4 rounded-md bg-destructive/10 p-2 text-center text-xs text-destructive">
                        {error}
                    </p>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                        id="accountName"
                        name="accountName"
                        label="Account Name"
                        value={account.accountName}
                        readOnly
                    />

                    <AmountInput
                        label="Funding Amount"
                        value={amountRaw}
                        onChange={setAmountRaw}
                        placeholder="₦2,000,000"
                        required
                    />

                    <DatePicker
                        id="fundingDate"
                        name="fundingDate"
                        label="Funding Date"
                        value={fundingDate}
                        onChange={setFundingDate}
                        placeholder="DD-MM-YY"
                        required
                    />

                    <SelectField
                        id="accountReceivedInto"
                        name="accountReceivedInto"
                        label="Account Received into"
                        placeholder="Enter bank name"
                        options={bankAccountOptions}
                        value={accountReceivedInto}
                        onValueChange={setAccountReceivedInto}
                        required
                    />

                    <SelectField
                        id="approvalRequired"
                        name="approvalRequired"
                        label="Approval Required"
                        placeholder="Select Approval"
                        options={APPROVAL_REQUIRED_OPTIONS}
                        value={approvalRequired}
                        onValueChange={setApprovalRequired}
                        required
                    />

                    <SelectField
                        id="fundingSource"
                        name="fundingSource"
                        label="Funding Source"
                        placeholder="Eg. Bank Transfer"
                        options={FUNDING_SOURCE_OPTIONS}
                        value={fundingSource}
                        onValueChange={setFundingSource}
                        required
                    />

                    <div className="md:col-span-2">
                        <TextAreaField
                            id="description"
                            name="description"
                            label="Descriptions / Reason"
                            placeholder="e.g. Chairman funded business operations."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            required
                        />
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1 rounded-[10px] border-border bg-white text-sm font-semibold text-[#304050] hover:bg-slate-50"
                        onClick={resetAndClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="h-11 flex-1 rounded-[10px] bg-orion-blue text-sm font-semibold text-white hover:bg-orion-blue/90"
                        disabled={submitting}
                    >
                        {submitting ? 'Adding...' : 'Add funds'}
                    </Button>
                </div>
            </form>
        </InternalAccountModalShell>
    );
}
