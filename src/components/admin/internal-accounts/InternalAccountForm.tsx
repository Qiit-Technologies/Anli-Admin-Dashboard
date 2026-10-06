'use client';

import { getNextAccountCode } from '@/app/actions/internal-accounts';
import {
    FormField,
    InputField,
    SelectField,
    TextAreaField,
} from '@/components/common/Form';
import AmountInput from '@/components/common/AmountInput';
import { Button } from '@/components/ui/button';
import { amountRawToNumber } from '@/lib/amount-format';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';
import { cn } from '@/lib/utils';
import {
    APPROVAL_REQUIRED_OPTIONS,
    INTERNAL_ACCOUNT_TYPE_OPTIONS,
    InternalAccountFormDraft,
    InternalAccountType,
} from '@/types/internal-accounts';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface InternalAccountFormProps {
    defaultValues?: Partial<InternalAccountFormDraft>;
    onSubmit: (draft: InternalAccountFormDraft) => void;
    submitLabel?: string;
}

function getDefaultApprovalRequired(
    value: boolean | undefined,
): 'yes' | 'no' | '' {
    if (value === true) return 'yes';
    if (value === false) return 'no';
    return '';
}

function isValidEmailAddress(email: string): boolean {
    const normalizedEmail = email.trim();
    const atIndex = normalizedEmail.indexOf('@');
    const dotIndex = normalizedEmail.lastIndexOf('.');
    return (
        atIndex > 0 &&
        dotIndex > atIndex + 1 &&
        dotIndex < normalizedEmail.length - 1
    );
}

export default function InternalAccountForm({
    defaultValues,
    onSubmit,
    submitLabel = 'Continue',
}: Readonly<InternalAccountFormProps>) {
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const [accountCode, setAccountCode] = useState(
        defaultValues?.accountCode ?? '',
    );
    const [accountName, setAccountName] = useState(
        defaultValues?.accountName ?? '',
    );
    const [owner, setOwner] = useState(defaultValues?.owner ?? '');
    const [contactEmail, setContactEmail] = useState(
        defaultValues?.contactEmail ?? '',
    );
    const [contactPhone, setContactPhone] = useState(
        defaultValues?.contactPhone ?? '',
    );
    const [accountType, setAccountType] = useState(
        defaultValues?.accountType ?? '',
    );
    const [approvalRequired, setApprovalRequired] = useState(
        getDefaultApprovalRequired(defaultValues?.approvalRequired),
    );
    const [openingBalanceRaw, setOpeningBalanceRaw] = useState(
        defaultValues?.openingBalance
            ? String(defaultValues.openingBalance)
            : '',
    );
    const [description, setDescription] = useState(
        defaultValues?.description ?? '',
    );
    const [fundingSourceNote, setFundingSourceNote] = useState(
        defaultValues?.fundingSourceNote ?? '',
    );
    const [referenceNumber, setReferenceNumber] = useState(
        defaultValues?.referenceNumber ?? '',
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!defaultValues?.accountCode) {
            getNextAccountCode().then((code) => setAccountCode(code));
        }
    }, [defaultValues?.accountCode]);

    const openingBalance = useMemo(
        () => amountRawToNumber(openingBalanceRaw),
        [openingBalanceRaw],
    );

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!accountName.trim()) {
            nextErrors.accountName = 'Account name is required';
        }
        if (!owner.trim()) {
            nextErrors.owner = 'Owner is required';
        }
        if (!contactEmail.trim()) {
            nextErrors.contactEmail = 'Contact email is required';
        } else if (!isValidEmailAddress(contactEmail)) {
            nextErrors.contactEmail = 'Enter a valid email address';
        }
        if (!accountType) {
            nextErrors.accountType = 'Select an account type';
        }
        if (!approvalRequired) {
            nextErrors.approvalRequired = 'Select approval requirement';
        }
        if (!contactPhone.trim()) {
            nextErrors.contactPhone = 'Contact phone is required';
        }
        if (openingBalance < 0) {
            nextErrors.openingBalance = 'Opening balance cannot be negative';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return;

        onSubmit({
            accountCode,
            accountName: accountName.trim(),
            owner: owner.trim(),
            contactEmail: contactEmail.trim(),
            contactPhone: contactPhone.trim(),
            accountType: accountType as InternalAccountType,
            approvalRequired: approvalRequired === 'yes',
            openingBalance:
                openingBalanceRaw.trim() === '' ? 0 : openingBalance,
            description: description.trim() || undefined,
            fundingSourceNote: fundingSourceNote.trim() || undefined,
            referenceNumber: referenceNumber.trim() || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="rounded-lg border bg-card">
                        <div className="border-b p-4">
                            <h2 className="text-sm font-semibold">
                                Basic Account Information
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Identity and ownership details
                            </p>
                        </div>

                        <div className="space-y-4 p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputField
                                        id="accountName"
                                        name="accountName"
                                        label="Account Name"
                                        placeholder="E.g Directors Ledger – Chairman I.A"
                                        value={accountName}
                                        onChange={(e) =>
                                            setAccountName(e.target.value)
                                        }
                                        required
                                    />
                                    {errors.accountName && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.accountName}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <InputField
                                        id="owner"
                                        name="owner"
                                        label="Owner/Responsible"
                                        placeholder="Chairman I.A"
                                        value={owner}
                                        onChange={(e) =>
                                            setOwner(e.target.value)
                                        }
                                        required
                                    />
                                    {errors.owner && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.owner}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <InputField
                                        id="contactEmail"
                                        name="contactEmail"
                                        label="Contact Email"
                                        type="email"
                                        placeholder="Enter Contact Email"
                                        value={contactEmail}
                                        onChange={(e) =>
                                            setContactEmail(e.target.value)
                                        }
                                        required
                                    />
                                    {errors.contactEmail && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.contactEmail}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <SelectField
                                        id="accountType"
                                        name="accountType"
                                        label="Account Type"
                                        value={accountType}
                                        onValueChange={setAccountType}
                                        options={INTERNAL_ACCOUNT_TYPE_OPTIONS}
                                        placeholder="Select Type"
                                        required
                                    />
                                    {errors.accountType && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.accountType}
                                        </p>
                                    )}
                                </div>
                                <FormField
                                    label="Account Code"
                                    htmlFor="accountCode"
                                >
                                    <div className="flex h-10 items-center justify-between rounded-md border border-border bg-muted/40 px-3">
                                        <span className="font-mono text-sm font-medium text-orion-blue">
                                            # {accountCode}
                                        </span>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            Auto-generated
                                        </span>
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <SelectField
                                        id="approvalRequired"
                                        name="approvalRequired"
                                        label="Approval Required"
                                        value={approvalRequired}
                                        onValueChange={setApprovalRequired}
                                        options={APPROVAL_REQUIRED_OPTIONS}
                                        placeholder="Select Approval"
                                        required
                                    />
                                    {errors.approvalRequired && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.approvalRequired}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <InputField
                                        id="contactPhone"
                                        name="contactPhone"
                                        label="Contact Phone"
                                        type="tel"
                                        placeholder="080976543213"
                                        value={contactPhone}
                                        onChange={(e) =>
                                            setContactPhone(e.target.value)
                                        }
                                        required
                                    />
                                    {errors.contactPhone && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.contactPhone}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <AmountInput
                                        id="openingBalance"
                                        name="openingBalance"
                                        label="Opening Balance (optional)"
                                        value={openingBalanceRaw}
                                        onChange={setOpeningBalanceRaw}
                                        placeholder="0"
                                        decimals={0}
                                    />
                                    {errors.openingBalance && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.openingBalance}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/20 p-4">
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold">
                                        Description
                                        {' '}
                                        <span className="font-normal text-muted-foreground">
                                            (optional)
                                        </span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Tell us the purpose of this account
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <TextAreaField
                                        id="description"
                                        name="description"
                                        label="Description"
                                        placeholder="eg purpose of this account....."
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        rows={4}
                                    />
                                    <TextAreaField
                                        id="fundingSourceNote"
                                        name="fundingSourceNote"
                                        label="Funding Source Note (optional)"
                                        placeholder="e.g. Chairman loaned hotel ₦2M for operational use....."
                                        value={fundingSourceNote}
                                        onChange={(e) =>
                                            setFundingSourceNote(e.target.value)
                                        }
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 border-t p-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9"
                                asChild
                            >
                                <Link href={basePath}>
                                    Back
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                className={cn(
                                    'h-9 flex-1 bg-orion-blue sm:flex-none sm:px-8',
                                )}
                            >
                                {submitLabel}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg border bg-card p-4">
                        <InputField
                            id="referenceNumber"
                            name="referenceNumber"
                            label="Reference Number (optional)"
                            placeholder="e.g. TRF-203933"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                        />
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                            <p className="text-sm leading-relaxed text-amber-900">
                                Opening balance is optional. Leave it blank to
                                start at ₦0. If you enter an amount, it is
                                posted as an initial credit.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
