/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomDialog from '@/components/common/CustomDialog';
import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { createPayable } from '@/app/actions/payables';
import {
    getAllBankAccounts,
    type BankAccount,
} from '@/app/actions/bank-accounts';
import { formatBankAccountLabel } from '@/lib/utils';
import { DatePicker } from '@/components/common/DatePicker';
import { allCountries } from 'country-region-data';

export const AddBtn = () => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        IDNumber: '',
        nationality: '',
        gender: '',
        dateOfBirth: '',
        notes: '',
        guestType: '',
        balance: '',
        paymentMethod: '',
        accountPaidInto: '',
    });

    const isFormValid = () => {
        // At least one identifier should be provided (fullName, email, or phoneNumber)
        const hasIdentifier =
            formData.fullName.trim() !== '' ||
            formData.email.trim() !== '' ||
            formData.phoneNumber.trim() !== '';

        // Parse balance - remove currency formatting if present
        const balanceValue = formData.balance.replace(/[₦,\s]/g, '');
        const balance = parseFloat(balanceValue);

        // Payment fields are required for creating a payable
        return (
            hasIdentifier &&
            !isNaN(balance) &&
            balance > 0 &&
            formData.paymentMethod.trim() !== '' &&
            formData.accountPaidInto.trim() !== ''
        );
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            // Split fullName into firstName and lastName for the payload
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const payload = {
                title: formData.title || undefined,
                firstName: firstName,
                lastName: lastName,
                fullName: formData.fullName || undefined,
                email: formData.email || undefined,
                phoneNumber: formData.phoneNumber || undefined,
                gender: formData.gender || undefined,
                guestType: formData.guestType || undefined,
                address: formData.address || undefined,
                IDNumber: formData.IDNumber || undefined,
                nationality: formData.nationality || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
                notes: formData.notes || undefined,
                paymentMethod: formData.paymentMethod,
                accountPaidInto: formData.accountPaidInto,
                balance: parseFloat(
                    formData.balance.replace(/[₦,\s]/g, '') || '0',
                ),
            };
            const res = await createPayable(payload as any);
            if ((res as any)?.error) {
                console.error((res as any).error);
            } else {
                await mutate('/accounts/payables');
                setOpen(false);
                setFormData({
                    title: '',
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    address: '',
                    IDNumber: '',
                    nationality: '',
                    gender: '',
                    dateOfBirth: '',
                    notes: '',
                    guestType: '',
                    balance: '',
                    paymentMethod: '',
                    accountPaidInto: '',
                });
            }
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ];

    const countryOptions = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return allCountries.map((country: any) => ({
            value: country[0],
            label: country[0],
        }));
    }, []);

    const titleOptions = [
        { value: 'Mr', label: 'Mr' },
        { value: 'Mrs', label: 'Mrs' },
        { value: 'Ms', label: 'Ms' },
        { value: 'Dr', label: 'Dr' },
        { value: 'Prof', label: 'Prof' },
    ];

    const guestTypeOptions = [
        { value: 'individual', label: 'Individual' },
        { value: 'corporate', label: 'Corporate' },
        { value: 'group', label: 'Group' },
        { value: 'travel_agent', label: 'Travel Agent' },
        { value: 'walk_in', label: 'Walk-in' },
        { value: 'online', label: 'Online' },
    ];

    const paymentMethodOptions = [
        {
            value: 'cash',
            label: 'Cash',
        },
        {
            value: 'transfer',
            label: 'Transfer',
        },
    ];

    // Bank accounts dropdown options from API
    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const hotelAccountOptions = (bankAccounts as Array<BankAccount>).map(
        (account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        }),
    );

    const handleFormInput = (field: string, value: string) => {
        if (field === 'balance') {
            // Store raw numeric value (remove all non-numeric except decimal)
            const rawValue = value.replace(/[^0-9.]/g, '');
            setFormData((prev) => ({ ...prev, [field]: rawValue }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    // Get formatted display value for balance
    const getFormattedBalance = () => {
        if (!formData.balance) return '';
        const numericValue = parseFloat(formData.balance);
        if (isNaN(numericValue) || numericValue === 0) return '';
        return `₦ ${Number(numericValue).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
    };
    return (
        <>
            <Button onClick={() => setOpen(true)} variant="outline">
                Add
            </Button>

            <CustomDialog
                open={open}
                onOpenChange={setOpen}
                title="Add Payable"
                description="Create a guest profile and deposit credit"
                confirmText="Save"
                onConfirm={handleConfirm}
                isLoading={loading}
                maxWidth="2xl"
                footerType="full"
                confirmDisabled={!isFormValid()}
            >
                <form className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="Title"
                            name="title"
                            id="title"
                            options={titleOptions}
                            value={formData.title}
                            onValueChange={(value) =>
                                handleFormInput('title', value)
                            }
                            placeholder="Select Title"
                        />
                        <InputField
                            label="Full Name"
                            name="fullName"
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) =>
                                handleFormInput('fullName', e.target.value)
                            }
                            placeholder="Enter full name"
                        />
                        <InputField
                            label="Email"
                            name="email"
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                handleFormInput('email', e.target.value)
                            }
                            placeholder="Enter email address"
                        />
                        <InputField
                            label="Phone Number"
                            name="phoneNumber"
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                handleFormInput('phoneNumber', e.target.value)
                            }
                            placeholder="Enter phone number"
                        />
                        <InputField
                            label="ID Number"
                            name="IDNumber"
                            id="IDNumber"
                            value={formData.IDNumber}
                            onChange={(e) =>
                                handleFormInput('IDNumber', e.target.value)
                            }
                            placeholder="Enter ID number"
                        />
                        <SelectField
                            id="nationality"
                            name="nationality"
                            label="Nationality"
                            placeholder="Select nationality"
                            options={countryOptions}
                            value={formData.nationality}
                            onValueChange={(value) =>
                                handleFormInput('nationality', value)
                            }
                        />
                        <SelectField
                            id="gender"
                            name="gender"
                            label="Gender"
                            placeholder="Select gender"
                            options={genderOptions}
                            value={formData.gender}
                            onValueChange={(value) =>
                                handleFormInput('gender', value)
                            }
                        />
                        <SelectField
                            id="guestType"
                            name="guestType"
                            label="Guest Type"
                            placeholder="Select guest type"
                            options={guestTypeOptions}
                            value={formData.guestType}
                            onValueChange={(value) =>
                                handleFormInput('guestType', value)
                            }
                        />
                        <DatePicker
                            id="dateOfBirth"
                            name="dateOfBirth"
                            label="Date of Birth"
                            placeholder="Select date of birth"
                            value={formData.dateOfBirth}
                            onChange={(date) =>
                                handleFormInput('dateOfBirth', date)
                            }
                        />
                        <InputField
                            label="Balance (Credit Amount)"
                            name="balance"
                            id="balance"
                            value={getFormattedBalance()}
                            type="text"
                            onChange={(e) => {
                                // Extract raw numeric value from formatted string
                                const rawValue = e.target.value.replace(
                                    /[^0-9.]/g,
                                    '',
                                );
                                handleFormInput('balance', rawValue);
                            }}
                            placeholder="Enter credit amount"
                        />
                        <SelectField
                            label="Payment Method"
                            name="paymentMethod"
                            id="paymentMethod"
                            options={paymentMethodOptions}
                            value={formData.paymentMethod}
                            onValueChange={(value) =>
                                handleFormInput('paymentMethod', value)
                            }
                            placeholder="Select Payment Method"
                        />
                        <SelectField
                            label="Account paid into"
                            name="accountPaidInto"
                            id="accountPaidInto"
                            options={hotelAccountOptions}
                            value={formData.accountPaidInto}
                            onValueChange={(value) =>
                                handleFormInput('accountPaidInto', value)
                            }
                            placeholder="Select account"
                        />
                        <InputField
                            label="Address"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={(e) =>
                                handleFormInput('address', e.target.value)
                            }
                            placeholder="Enter address"
                        />
                        <InputField
                            label="Notes"
                            name="notes"
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                                handleFormInput('notes', e.target.value)
                            }
                            placeholder="Additional notes (optional)"
                        />
                    </div>
                </form>
            </CustomDialog>
        </>
    );
};
