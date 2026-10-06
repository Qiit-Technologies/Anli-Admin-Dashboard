'use client';

import {
    InputField,
    SelectField,
    TextAreaField,
} from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    APPROVAL_REQUIRED_OPTIONS,
    INTERNAL_ACCOUNT_TYPE_OPTIONS,
    InternalAccount,
} from '@/types/internal-accounts';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

interface EditAccountFormProps {
    account: InternalAccount;
    basePath?: string;
    onSubmit: (payload: Partial<InternalAccount>) => Promise<void>;
    submitting?: boolean;
}

export default function EditAccountForm({
    account,
    basePath = '/admin/internal-accounts',
    onSubmit,
    submitting = false,
}: Readonly<EditAccountFormProps>) {
    const [accountName, setAccountName] = useState(account.accountName ?? '');
    const [owner, setOwner] = useState(account.owner ?? '');
    const [contactEmail, setContactEmail] = useState(
        account.contactEmail ?? '',
    );
    const [contactPhone, setContactPhone] = useState(
        account.contactPhone ?? '',
    );
    const [accountType, setAccountType] = useState(account.accountType ?? '');
    const [approvalRequired, setApprovalRequired] = useState(
        account.approvalRequired ? 'yes' : 'no',
    );
    const [description, setDescription] = useState(account.description ?? '');
    const [fundingSourceNote, setFundingSourceNote] = useState(
        account.fundingSourceNote ?? '',
    );
    const [referenceNumber, setReferenceNumber] = useState(
        account.referenceNumber ?? '',
    );
    const [error, setError] = useState('');

    useEffect(() => {
        setAccountName(account.accountName ?? '');
        setOwner(account.owner ?? '');
        setContactEmail(account.contactEmail ?? '');
        setContactPhone(account.contactPhone ?? '');
        setAccountType(account.accountType ?? '');
        setApprovalRequired(account.approvalRequired ? 'yes' : 'no');
        setDescription(account.description ?? '');
        setFundingSourceNote(account.fundingSourceNote ?? '');
        setReferenceNumber(account.referenceNumber ?? '');
        setError('');
    }, [account]);

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!accountName.trim()) {
            setError('Account name is required.');
            return;
        }

        try {
            await onSubmit({
                accountName: accountName.trim(),
                owner: owner.trim(),
                contactEmail: contactEmail.trim(),
                contactPhone: contactPhone.trim(),
                accountType,
                approvalRequired: approvalRequired === 'yes',
                description: description.trim(),
                fundingSourceNote: fundingSourceNote.trim() || undefined,
                referenceNumber: referenceNumber.trim() || undefined,
            });
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update account.');
        }
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="rounded-lg border bg-card">
                        <div className="border-b p-4">
                            <h2 className="text-sm font-semibold">
                                Account details
                            </h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Update identity and ownership information
                            </p>
                        </div>

                        <div className="space-y-4 p-4">
                            {error && (
                                <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                                    {error}
                                </p>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InputField
                                    id="accountCode"
                                    name="accountCode"
                                    label="Account Code"
                                    value={account.accountCode}
                                    readOnly
                                />
                                <InputField
                                    id="accountName"
                                    name="accountName"
                                    label="Account Name"
                                    value={accountName}
                                    onChange={(e) =>
                                        setAccountName(e.target.value)
                                    }
                                    required
                                />
                                <InputField
                                    id="owner"
                                    name="owner"
                                    label="Owner / Responsible"
                                    value={owner}
                                    onChange={(e) => setOwner(e.target.value)}
                                    required
                                />
                                <SelectField
                                    id="accountType"
                                    name="accountType"
                                    label="Account Type"
                                    value={accountType}
                                    onValueChange={setAccountType}
                                    options={INTERNAL_ACCOUNT_TYPE_OPTIONS}
                                    required
                                />
                                <InputField
                                    id="contactEmail"
                                    name="contactEmail"
                                    label="Contact Email"
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) =>
                                        setContactEmail(e.target.value)
                                    }
                                    required
                                />
                                <InputField
                                    id="contactPhone"
                                    name="contactPhone"
                                    label="Contact Phone"
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) =>
                                        setContactPhone(e.target.value)
                                    }
                                    required
                                />
                                <SelectField
                                    id="approvalRequired"
                                    name="approvalRequired"
                                    label="Approval Required"
                                    placeholder="Select Approval"
                                    value={approvalRequired}
                                    onValueChange={setApprovalRequired}
                                    options={APPROVAL_REQUIRED_OPTIONS}
                                    required
                                />
                                <InputField
                                    id="referenceNumber"
                                    name="referenceNumber"
                                    label="Reference Number (optional)"
                                    placeholder="e.g. TRF-203933"
                                    value={referenceNumber}
                                    onChange={(e) =>
                                        setReferenceNumber(e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <TextAreaField
                                    id="description"
                                    name="description"
                                    label="Account Description"
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
                                    placeholder="e.g. Chairman loaned hotel ₦2M for operational use"
                                    value={fundingSourceNote}
                                    onChange={(e) =>
                                        setFundingSourceNote(e.target.value)
                                    }
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 border-t p-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9"
                                asChild
                            >
                                <Link href={`${basePath}/${account.id}`}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                className={cn(
                                    'h-9 flex-1 bg-orion-blue sm:flex-none sm:px-8',
                                )}
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Save changes'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Read-only</p>
                        <p className="mt-2">
                            Opening balance, current balance, and transaction
                            totals are managed by the ledger and cannot be
                            edited here.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
