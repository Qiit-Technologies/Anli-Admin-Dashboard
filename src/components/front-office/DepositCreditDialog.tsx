'use client';

import { useState, useEffect } from 'react';
import CustomDialog from '@/components/common/CustomDialog';
import { InputField, SelectField } from '@/components/common/Form';
import {
    depositCredit,
    getCreditAccount,
    type GuestProfile,
} from '@/app/actions/guest-profile';
import toast from 'react-hot-toast';
import {
    getAllBankAccounts,
    type BankAccount,
} from '@/app/actions/bank-accounts';
import { getInternalAccounts } from '@/app/actions/internal-accounts';
import { formatBankAccountLabel, formatCurrency } from '@/lib/utils';
import useSWR from 'swr';

interface DepositCreditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: GuestProfile | null;
    onSuccess?: () => void;
}

export function DepositCreditDialog({
    open,
    onOpenChange,
    profile,
    onSuccess,
}: DepositCreditDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        referenceNumber: '',
        description: '',
        paymentMethod: '',
        receivingAccount: '',
    });
    const [currentBalance, setCurrentBalance] = useState<number>(0);

    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const { data: internalAccounts = [] } = useSWR(
        '/internal-accounts',
        getInternalAccounts,
    );

    useEffect(() => {
        if (open && profile) {
            // Fetch current credit balance
            getCreditAccount(profile.id).then((result) => {
                if (result.data) {
                    const balance = Number(result.data.creditBalance) || 0;
                    setCurrentBalance(balance);
                }
            });
            // Reset form when dialog opens
            setFormData({
                amount: '',
                referenceNumber: '',
                description: '',
                paymentMethod: '',
                receivingAccount: '',
            });
        }
    }, [open, profile]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        const amount = parseFloat(formData.amount);
        return (
            !isNaN(amount) &&
            amount > 0 &&
            formData.paymentMethod.trim() !== '' &&
            formData.receivingAccount.trim() !== ''
        );
    };

    const handleConfirm = async () => {
        if (!profile) {
            toast.error('No profile selected');
            return;
        }

        if (!isFormValid()) {
            toast.error('Please fill in all required fields with valid values');
            return;
        }

        setLoading(true);
        try {
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                toast.error('Please enter a valid amount');
                setLoading(false);
                return;
            }

            const payload = {
                amount,
                referenceNumber: formData.referenceNumber || undefined,
                description:
                    formData.description ||
                    `Credit deposit of ₦${amount.toLocaleString()}`,
                paymentMethod: formData.paymentMethod,
                receivingAccount: formData.receivingAccount,
            };

            const result = await depositCredit(profile.id, payload);

            if (result.error) {
                toast.error(result.error);
            } else if (result.data) {
                toast.success(
                    `Successfully deposited ₦${amount.toLocaleString()} to profile`,
                );
                setFormData({
                    amount: '',
                    referenceNumber: '',
                    description: '',
                    paymentMethod: '',
                    receivingAccount: '',
                });
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error: any) {
            console.error('Error depositing credit:', error);
            toast.error('Failed to deposit credit');
        } finally {
            setLoading(false);
        }
    };

    const paymentMethodOptions = [
        { value: 'cash', label: 'Cash' },
        { value: 'credit', label: 'Credit Card' },
        { value: 'debit', label: 'Debit Card' },
        { value: 'bank', label: 'Bank Transfer' },
        { value: 'internal_account', label: 'Internal Account' },
    ];

    const bankAccountOptions = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );
    const internalAccountOptions = internalAccounts.map((account) => ({
        label: `${account.accountName} (${account.accountCode})`,
        value: account.accountCode || account.id,
    }));

    if (!profile) {
        return null;
    }

    return (
        <CustomDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Deposit Credit"
            description={`Deposit credit to ${profile.fullName || 'Guest Profile'}`}
            confirmText="Deposit Credit"
            cancelText="Cancel"
            onConfirm={handleConfirm}
            isLoading={loading}
            confirmDisabled={!isFormValid() || loading}
            maxWidth="lg"
        >
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                            Current Credit Balance:
                        </span>
                        <span className="text-lg font-semibold text-blue-700">
                            {formatCurrency(currentBalance)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        id="amount"
                        name="amount"
                        label="Amount"
                        type="text"
                        placeholder="Enter amount"
                        value={
                            formData.amount
                                ? `₦ ${Number(formData.amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                : '₦ 0'
                        }
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(
                                /[^0-9]/g,
                                '',
                            );
                            handleInputChange('amount', rawValue || '0');
                        }}
                    />

                    <SelectField
                        id="paymentMethod"
                        name="paymentMethod"
                        label="Payment Method"
                        placeholder="Select payment method"
                        options={paymentMethodOptions}
                        value={formData.paymentMethod}
                        onValueChange={(value) => {
                            handleInputChange('paymentMethod', value);
                            handleInputChange('receivingAccount', '');
                        }}
                    />

                    <div className="md:col-span-2">
                        <SelectField
                            id="receivingAccount"
                            name="receivingAccount"
                            label={
                                formData.paymentMethod === 'internal_account'
                                    ? 'Internal Account'
                                    : 'Account to Pay Into'
                            }
                            placeholder="Select account"
                            options={
                                formData.paymentMethod === 'internal_account'
                                    ? internalAccountOptions
                                    : bankAccountOptions
                            }
                            value={formData.receivingAccount}
                            onValueChange={(value) =>
                                handleInputChange('receivingAccount', value)
                            }
                        />
                    </div>

                    <InputField
                        id="referenceNumber"
                        name="referenceNumber"
                        label="Reference Number (Optional)"
                        placeholder="Enter reference number"
                        value={formData.referenceNumber}
                        onChange={(e) =>
                            handleInputChange('referenceNumber', e.target.value)
                        }
                    />

                    <InputField
                        id="description"
                        name="description"
                        label="Description (Optional)"
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={(e) =>
                            handleInputChange('description', e.target.value)
                        }
                    />
                </div>

                {formData.amount &&
                    formData.amount !== '0' &&
                    !isNaN(Number(formData.amount)) &&
                    Number(formData.amount) > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                    Deposit Amount:
                                </span>
                                <span className="text-base font-semibold text-gray-900">
                                    {formatCurrency(Number(formData.amount))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-green-200">
                                <span className="text-sm font-medium text-gray-700">
                                    New Balance After Deposit:
                                </span>
                                <span className="text-lg font-semibold text-green-700">
                                    {formatCurrency(
                                        Number(currentBalance) +
                                            Number(formData.amount),
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
            </div>
        </CustomDialog>
    );
}
