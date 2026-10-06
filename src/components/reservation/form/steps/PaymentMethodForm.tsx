'use client';

import React, { useState, useEffect } from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { ReservationFormData } from '../schemas';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getPublicBankAccounts, BankAccount } from '@/app/actions/bank-accounts';

interface PaymentMethodFormProps {
    form: UseFormReturn<ReservationFormData>;
    hotelId?: string;
}

export default function PaymentMethodForm({ form, hotelId }: PaymentMethodFormProps) {
    const [isBankTransferOpen, setIsBankTransferOpen] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const guestNumber = watch('reservationDateTime.guestNumber') || '1';
    const foodQuantity = watch('reservationDateTime.foodQuantity') || '1';
    
    // Simple total cost calculation: 5,000 per guest + 2,000 per food quantity
    // You can adjust these multipliers based on your business logic
    const calculatedTotal = (parseInt(guestNumber) * 5000) + (parseInt(foodQuantity) * 2000);
    const formattedTotal = `₦${calculatedTotal.toLocaleString()}`;

    useEffect(() => {
        // Sync the calculated total to the form value
        setValue('paymentMethod.totalCost', formattedTotal);
    }, [formattedTotal, setValue]);

    useEffect(() => {
        if (!hotelId) return;

        const fetchBanks = async () => {
            setIsLoadingBanks(true);
            try {
                const response = await getPublicBankAccounts(hotelId);
                if (Array.isArray(response)) {
                    setBankAccounts(response);
                }
            } catch (error) {
                console.error('Failed to fetch bank accounts:', error);
            } finally {
                setIsLoadingBanks(false);
            }
        };
        fetchBanks();
    }, [hotelId]);

    const selectedAccount = watch('paymentMethod.accountToPay');

    const getSelectedAccountLabel = () => {
        const account = bankAccounts.find(
            (acc) => String(acc.id) === selectedAccount,
        );
        return account
            ? `${account.bankName} (${account.accountNumber})`
            : 'Bank Transfer';
    };

    const handleBankAccountSelect = (accountValue: string) => {
        setValue('paymentMethod.accountToPay', accountValue);
        setValue('paymentMethod.paymentOption', 'bank-transfer');
        setIsBankTransferOpen(false);
    };

    const handlePaymentOptionSelect = (
        optionValue: string,
        fieldOnChange: (value: string) => void,
    ) => {
        if (optionValue === 'bank-transfer') {
            setIsBankTransferOpen(!isBankTransferOpen);
            fieldOnChange(optionValue);
        } else {
            fieldOnChange(optionValue);
            setValue('paymentMethod.accountToPay', '');
            setIsBankTransferOpen(false);
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm text-[#919191] mb-3">
                Select Payment method
            </label>

            <Controller
                name="paymentMethod.paymentOption"
                control={control}
                render={({ field }) => (
                    <div className="space-y-3">
                        {/* Cash Payment */}
                        <div
                            className={`
                                flex items-center justify-between p-4 h-16 rounded-lg border cursor-pointer transition-all
                                ${field.value === 'cash' ? 'border-[#007BFF] bg-[#F8FBFF]' : 'border-[#E5E7EB] bg-[#FAFAFA]'}
                            `}
                            onClick={() =>
                                handlePaymentOptionSelect(
                                    'cash',
                                    field.onChange,
                                )
                            }
                        >
                            <span className="text-sm font-medium text-[#344054]">
                                Cash on Arrival
                            </span>
                            <div
                                className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                    ${field.value === 'cash' ? 'border-[#007BFF]' : 'border-[#D0D5DD]'}
                                `}
                            >
                                {field.value === 'cash' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#007BFF]" />
                                )}
                            </div>
                        </div>

                        {/* Bank Transfer */}
                        <div>
                            <div
                                className={`
                                    flex items-center justify-between p-4 h-16 rounded-lg border cursor-pointer transition-all
                                    ${field.value === 'bank-transfer' ? 'border-[#007BFF] bg-[#F8FBFF]' : 'border-[#E5E7EB] bg-[#FAFAFA]'}
                                `}
                                onClick={() =>
                                    handlePaymentOptionSelect(
                                        'bank-transfer',
                                        field.onChange,
                                    )
                                }
                            >
                                <span className="text-sm font-medium text-[#344054]">
                                    {selectedAccount &&
                                    field.value === 'bank-transfer'
                                        ? getSelectedAccountLabel()
                                        : 'Bank Transfer'}
                                </span>
                                {isBankTransferOpen ? (
                                    <ChevronUp className="w-5 h-5 text-[#667085]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-[#667085]" />
                                )}
                            </div>

                            {isBankTransferOpen && (
                                <div className="mt-2 p-4 bg-white border border-[#E5E7EB] rounded-lg space-y-2 max-h-[200px] overflow-y-auto shadow-sm">
                                    {isLoadingBanks ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-[#007BFF]" />
                                        </div>
                                    ) : bankAccounts.length > 0 ? (
                                        bankAccounts.map((account) => (
                                            <div
                                                key={account.id}
                                                className={`
                                                    p-3 cursor-pointer rounded transition-all
                                                    ${selectedAccount === String(account.id) ? 'bg-[#F8FBFF] border border-[#007BFF]' : 'hover:bg-[#FAFAFA] border border-transparent'}
                                                `}
                                                onClick={() =>
                                                    handleBankAccountSelect(
                                                        String(account.id),
                                                    )
                                                }
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-[#344054]">
                                                        {account.bankName}
                                                    </span>
                                                    <span className="text-xs text-[#667085]">
                                                        {account.accountNumber}{' '}
                                                        - {account.accountName}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-center py-2 text-[#667085]">
                                            No bank accounts found
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            />

            {errors.paymentMethod?.paymentOption && (
                <p className="text-xs text-red-500">
                    {errors.paymentMethod.paymentOption.message}
                </p>
            )}

            <div className="mt-6">
                <label className="block text-sm text-[#919191] mb-2">
                    Total Cost
                </label>
                <div className="w-full px-4 h-14 flex items-center rounded-[8px] bg-[#FAFAFA] text-[#344054] font-semibold text-lg">
                    {formattedTotal}
                </div>
                <div className="mt-3 px-4 py-3 min-h-10 flex items-center rounded-lg bg-[#F2FFF4]">
                    <p className="text-xs text-[#066812] font-medium leading-relaxed">
                        Please Note this amount will be used as a deposit or reservation fee and is non-refundable.
                    </p>
                </div>
            </div>
        </div>
    );
}
