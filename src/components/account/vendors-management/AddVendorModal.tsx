/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { createVendor } from '@/app/actions/vendor';
import toast from 'react-hot-toast';
import { allCountries } from 'country-region-data';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import * as yup from 'yup';
import Toast from '@/components/toast';
import { useBankList } from '@/hooks/useBankList';

interface AddVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    mutateVendors?: () => void;
}

function generateVendorCode() {
    // 15-character random alphanumeric string, uppercase, no prefix
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 15; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function AddVendorModal({
    isOpen,
    onClose,
    mutateVendors,
}: AddVendorModalProps) {
    const [formData, setFormData] = useState({
        vendorName: '',
        vendorCode: generateVendorCode(),
        emailAddress: '',
        businessAddress: '',
        phoneNumber: '',
        country: '',
        state: '',
        city: '',
        bankName: '',
        accountName: '',
        bankAccountNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const [countryOptions, setCountryOptions] = useState<string[]>([]);
    const [stateOptions, setStateOptions] = useState<string[]>([]);
    // City is now a free text input; no need to fetch city options
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isDirty, setIsDirty] = useState(false);
    const fieldRefs = {
        vendorName: useRef<HTMLInputElement>(null),
        vendorCode: useRef<HTMLInputElement>(null),
        emailAddress: useRef<HTMLInputElement>(null),
        businessAddress: useRef<HTMLInputElement>(null),
        phoneNumber: useRef<HTMLInputElement>(null),
        country: useRef<HTMLButtonElement>(null),
        state: useRef<HTMLButtonElement>(null),
        city: useRef<HTMLInputElement>(null),
        bankName: useRef<HTMLInputElement>(null),
        accountName: useRef<HTMLInputElement>(null),
        bankAccountNumber: useRef<HTMLInputElement>(null),
    };

    const banks = useBankList();
    const bankOptions = banks.map((bank) => ({
        label: bank.name,
        value: bank.name,
    }));

    // Regenerate vendor code every time the modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData((prev) => ({
                ...prev,
                vendorCode: generateVendorCode(),
            }));
        }
    }, [isOpen]);

    useEffect(() => {
        setCountryOptions(allCountries.map((c: any) => c[0]));
    }, []);

    useEffect(() => {
        if (formData.country) {
            const country = allCountries.find(
                (c: any) => c[0] === formData.country,
            );
            setStateOptions(
                country && country[2] ? country[2].map((r: any) => r[0]) : [],
            );
        } else {
            setStateOptions([]);
        }
        setFormData((prev) => ({ ...prev, state: '', city: '' }));
    }, [formData.country]);

    // City is now a free text input; no need to fetch city options

    const vendorSchema = yup.object().shape({
        vendorName: yup.string().required('Vendor name is required'),
        vendorCode: yup.string().required('Vendor code is required'),
        emailAddress: yup
            .string()
            .email('Invalid email')
            .required('Email is required'),
        businessAddress: yup.string().required('Business address is required'),
        phoneNumber: yup.string().required('Phone number is required'),
        country: yup.string().required('Country is required'),
        state: yup.string().required('State is required'),
        city: yup.string().required('City is required'),
        bankName: yup.string().required('Bank name is required'),
        accountName: yup.string().required('Account name is required'),
        bankAccountNumber: yup
            .string()
            .required('Bank account number is required'),
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
        const schema: any = yup.reach(vendorSchema, field);
        if (schema.isValidSync(value)) {
            setErrors((prev) => {
                const rest = { ...prev };
                delete rest[field];
                return rest;
            });
        } else {
            try {
                schema.validateSync(value);
            } catch (err: any) {
                setErrors((prev) => ({
                    ...prev,
                    [field]: err.message || 'Invalid',
                }));
            }
        }
    };

    const handleBlur = (field: string, value: string) => {
        const schema: any = yup.reach(vendorSchema, field);
        if (schema.isValidSync(value)) {
            setErrors((prev) => {
                const rest = { ...prev };
                delete rest[field];
                return rest;
            });
        } else {
            try {
                schema.validateSync(value);
            } catch (err: any) {
                setErrors((prev) => ({
                    ...prev,
                    [field]: err.message || 'Invalid',
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await vendorSchema.validate(formData, { abortEarly: false });
            const payload = {
                vendorName: formData.vendorName,
                vendorCode: formData.vendorCode,
                emailAddress: formData.emailAddress,
                businessAddress: formData.businessAddress,
                phoneNumber: formData.phoneNumber,
                country: formData.country,
                state: formData.state,
                city: formData.city,
                bankName: formData.bankName,
                accountName: formData.accountName,
                bankAccountNumber: formData.bankAccountNumber,
            };
            const response = await createVendor(payload);
            if (
                response &&
                response.message === 'Vendor created successfully.'
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                if (mutateVendors) mutateVendors();
                setIsDirty(false);
                onClose();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.message ?? 'Error creating vendor'
                        }
                        type="error"
                    />
                ));
            }
        } catch (err: any) {
            if (err.name === 'ValidationError') {
                const fieldErrors: { [key: string]: string } = {};
                err.inner.forEach((e: any) => {
                    fieldErrors[e.path] = e.message;
                });
                setErrors(fieldErrors);
                // Auto-focus first invalid field
                if (err.inner.length > 0) {
                    const path = err.inner[0].path as keyof typeof fieldRefs;
                    if (fieldRefs[path] && fieldRefs[path].current) {
                        fieldRefs[path].current?.focus();
                    }
                }
            } else {
                toast.error('Failed to add vendor');
            }
        } finally {
            setLoading(false);
        }
    };

    // Prevent accidental modal close if form is dirty
    const handleClose = () => {
        if (isDirty) {
            if (
                window.confirm(
                    'You have unsaved changes. Are you sure you want to close?',
                )
            ) {
                setIsDirty(false);
                onClose();
            }
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-0">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 z-10 bg-white">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Add new vendors
                        </h2>
                        <p className="text-sm text-gray-600">
                            You can now create and add new account to the system
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Vendors personal information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Vendors personal information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vendor Name
                                </label>
                                <Input
                                    ref={fieldRefs.vendorName}
                                    value={formData.vendorName}
                                    onChange={(e) =>
                                        handleChange(
                                            'vendorName',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleBlur('vendorName', e.target.value)
                                    }
                                    placeholder="Enter Vendor Name"
                                />
                                {errors.vendorName && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.vendorName}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-row items-end gap-2 w-full">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor Code
                                    </label>
                                    <Input
                                        ref={fieldRefs.vendorCode}
                                        value={formData.vendorCode}
                                        onChange={(e) =>
                                            handleChange(
                                                'vendorCode',
                                                e.target.value,
                                            )
                                        }
                                        onBlur={(e) =>
                                            handleBlur(
                                                'vendorCode',
                                                e.target.value,
                                            )
                                        }
                                        readOnly
                                    />
                                    {errors.vendorCode && (
                                        <div className="text-red-500 text-xs mt-1">
                                            {errors.vendorCode}
                                        </div>
                                    )}
                                </div>
                                <div className="">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                vendorCode:
                                                    generateVendorCode(),
                                            }))
                                        }
                                    >
                                        Generate
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <Input
                                    ref={fieldRefs.emailAddress}
                                    type="email"
                                    value={formData.emailAddress}
                                    onChange={(e) =>
                                        handleChange(
                                            'emailAddress',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleBlur(
                                            'emailAddress',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter Email Address"
                                />
                                {errors.emailAddress && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.emailAddress}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Address
                                </label>
                                <Input
                                    ref={fieldRefs.businessAddress}
                                    value={formData.businessAddress}
                                    onChange={(e) =>
                                        handleChange(
                                            'businessAddress',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleBlur(
                                            'businessAddress',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter Business Address"
                                />
                                {errors.businessAddress && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.businessAddress}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <Input
                                    ref={fieldRefs.phoneNumber}
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            'phoneNumber',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleBlur(
                                            'phoneNumber',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter Phone Number"
                                />
                                {errors.phoneNumber && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.phoneNumber}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <Select
                                    value={formData.country}
                                    onValueChange={(val) =>
                                        handleChange('country', val)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        {countryOptions.map((c, idx) => (
                                            <SelectItem
                                                key={c + '-' + idx}
                                                value={c}
                                            >
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.country && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.country}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <Select
                                    value={formData.state}
                                    onValueChange={(val) =>
                                        handleChange('state', val)
                                    }
                                    disabled={!formData.country}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        {stateOptions.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.state && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.state}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <Input
                                    ref={fieldRefs.city}
                                    value={formData.city}
                                    onChange={(e) =>
                                        handleChange('city', e.target.value)
                                    }
                                    onBlur={(e) =>
                                        handleBlur('city', e.target.value)
                                    }
                                    placeholder="Enter City"
                                />
                                {errors.city && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.city}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Bank Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Name
                                </label>
                                <Select
                                    value={formData.bankName}
                                    onValueChange={(val) =>
                                        handleChange('bankName', val)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Bank" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                        {bankOptions.map((bank) => (
                                            <SelectItem
                                                key={bank.value}
                                                value={bank.value}
                                            >
                                                {bank.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.bankName && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.bankName}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Name
                                </label>
                                <Input
                                    ref={fieldRefs.accountName}
                                    value={formData.accountName}
                                    onChange={(e) =>
                                        handleChange(
                                            'accountName',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleBlur(
                                            'accountName',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter Account Name"
                                />
                                {errors.accountName && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.accountName}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Account Number
                                </label>
                                <Input
                                    ref={fieldRefs.bankAccountNumber}
                                    value={formData.bankAccountNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            'bankAccountNumber',
                                            e.target.value,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleBlur(
                                            'bankAccountNumber',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter Account Number"
                                />
                                {errors.bankAccountNumber && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.bankAccountNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white bg-[rgba(0,123,255,1)] flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading && (
                            <span className="loader mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        )}
                        {loading ? 'Adding...' : 'Add Vendor'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
