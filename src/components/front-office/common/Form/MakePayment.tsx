'use client';
import { BankAccount, getAllBankAccounts } from '@/app/actions/bank-accounts';
import { getInternalAccounts } from '@/app/actions/internal-accounts';
import { makeGuestPayment } from '@/app/actions/guest';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import {
    IA_SOURCE_MODULES,
    maybePostBillToInternalAccount,
} from '@/lib/internal-accounts/post-bill';
import { formatBankAccountLabel } from '@/lib/utils';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { UnifiedAPActivation } from '../UnifiedAPActivation';

interface MakePaymentFormProps {
    guestId: number;
    outstanding: number;
    onClose?: () => void;
}

const MakePaymentForm = ({
    guestId,
    outstanding,
    onClose,
}: MakePaymentFormProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        amountPaid: outstanding || 0,
        paymentMethod: '',
        receivingAccount: '',
        creditToApply: 0,
        guestProfileId: undefined as number | undefined,
    });
    const [selectedAPGuest, setSelectedAPGuest] = useState<any | null>(null);
    const { user } = useUser();

    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const { data: internalAccounts = [] } = useSWR(
        '/internal-accounts',
        getInternalAccounts,
    );

    const remappedBankAccounts = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );
    const remappedInternalAccounts = internalAccounts.map((account) => ({
        label: `${account.accountName} (${account.accountCode})`,
        value: account.accountCode || account.id,
    }));

    const inputClass = 'bg-white border shadow-none border-gray-300';

    const handleInputChange = (
        name: string,
        value: string | number | undefined,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAPGuestSelect = (guest: any) => {
        setSelectedAPGuest(guest);
        const amountToApply = Math.min(outstanding, guest.creditBalance);
        setFormData((prev) => ({
            ...prev,
            paymentMethod: 'Account Payable',
            creditToApply: amountToApply,
            guestProfileId: guest.id,
            amountPaid: 0, // Using credit instead of new cash
        }));
    };

    const updatePayment = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await makeGuestPayment(guestId, formData);
            if (response?.message === 'Payment made successfully!') {
                const iaPost = await maybePostBillToInternalAccount({
                    paymentMethod: formData.paymentMethod,
                    receivingAccount: formData.receivingAccount,
                    billAmount: formData.amountPaid,
                    sourceModule: IA_SOURCE_MODULES.GUEST_BILLING,
                    guestCustomer: `Guest #${guestId}`,
                    postedBy: user?.fullName || 'Front Desk',
                    referenceId: guestId,
                });
                if (iaPost.error) {
                    toast.custom(() => (
                        <Toast
                            title="Payment saved"
                            description={`Payment succeeded but Internal Account posting failed: ${iaPost.error}`}
                            type="error"
                        />
                    ));
                }

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate(`/guests/info/${guestId}`);
                mutate('/hotels/other-services');
                mutate(`/guests/service-for-guest?guestId=${guestId}`);

                onClose?.();
                setFormData({
                    amountPaid: 0,
                    paymentMethod: '',
                    receivingAccount: '',
                    creditToApply: 0,
                    guestProfileId: undefined,
                });
                setSelectedAPGuest(null);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message || 'Payment failed'}
                        type="error"
                    />
                ));
            }
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unexpected error occurred',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <h1 className="text-xl font-semibold">Make Payment</h1>
                <span className="text-sm text-gray-500">
                    Record a payment for this guest
                </span>
            </div>
            <div className="mt-4">
                <form className="space-y-4">
                    <UnifiedAPActivation
                        onSelect={handleAPGuestSelect}
                        inputClass={inputClass}
                    />

                    {selectedAPGuest && (
                        <div className="bg-orange-50 border border-orange-200 p-3 rounded-md flex items-center justify-between animate-in fade-in slide-in-from-left-2 duration-300">
                            <div>
                                <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                                    Active Account Payable
                                </p>
                                <p className="text-sm text-orange-900 font-medium">
                                    {selectedAPGuest.fullName}
                                </p>
                                <p className="text-xs text-orange-700">
                                    Available: ₦
                                    {Number(
                                        selectedAPGuest.creditBalance,
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 h-8 font-bold"
                                onClick={() => {
                                    setSelectedAPGuest(null);
                                    setFormData((prev) => ({
                                        ...prev,
                                        paymentMethod: '',
                                        creditToApply: 0,
                                        guestProfileId: undefined,
                                    }));
                                }}
                            >
                                Clear
                            </Button>
                        </div>
                    )}

                    <InputField
                        id="amountPaid"
                        name="amountPaid"
                        label="Amount To Pay"
                        placeholder="Amount Paid"
                        type="text"
                        className={inputClass}
                        value={
                            formData.amountPaid
                                ? `₦ ${Number(formData.amountPaid).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                                : '₦ 0'
                        }
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(
                                /[^0-9]/g,
                                '',
                            );
                            handleInputChange(
                                'amountPaid',
                                rawValue ? parseFloat(rawValue) : 0,
                            );
                        }}
                    />
                    <SelectField
                        id="paymentMethod"
                        name="paymentMethod"
                        label="Payment Method"
                        className={inputClass}
                        value={formData.paymentMethod}
                        onValueChange={(value) => {
                            handleInputChange('paymentMethod', value);
                            handleInputChange('receivingAccount', '');
                        }}
                        options={[
                            { value: 'credit', label: 'Credit Card' },
                            { value: 'debit', label: 'Debit Card' },
                            { value: 'cash', label: 'Cash' },
                            { value: 'bank', label: 'Bank Transfer' },
                            {
                                value: 'internal_account',
                                label: 'Internal Account',
                            },
                            {
                                value: 'Account Payable',
                                label: 'Account Payable',
                            },
                        ]}
                        placeholder="Select payment method"
                    />

                    <SelectField
                        className="bg-white ring-border border shadow-none border-border h-10"
                        name="receivingAccount"
                        id={`receivingAccount`}
                        label={
                            formData.paymentMethod === 'internal_account'
                                ? 'Internal Account (Optional)'
                                : 'Account to pay into (Optional)'
                        }
                        options={
                            formData.paymentMethod === 'internal_account'
                                ? remappedInternalAccounts
                                : remappedBankAccounts
                        }
                        value={formData?.receivingAccount || ''}
                        onValueChange={(value) =>
                            updatePayment('receivingAccount', value)
                        }
                        placeholder={
                            formData.paymentMethod === 'internal_account'
                                ? 'Select internal account'
                                : 'Select account'
                        }
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}
                        className="w-full bg-orion-blue hover:bg-orion-blue h-12"
                        onClick={handleSubmit}
                        disabled={
                            isLoading ||
                            (!formData.amountPaid &&
                                !(
                                    formData.creditToApply > 0 &&
                                    formData.guestProfileId
                                )) ||
                            !formData.paymentMethod
                        }
                    >
                        {isLoading ? 'Processing...' : 'Make Payment'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default MakePaymentForm;
