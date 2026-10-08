'use client';
import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { FormEvent, useState } from 'react';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Option {
    label: string;
    value: string;
}

interface DepartmentOption {
    id: string | number;
    name?: string;
    department?: string;
    title?: string;
}

interface BankAccountFormProps {
    loading?: boolean;
    defaultValues?: {
        accountName?: string;
        bankName?: string;
        accountNumber?: string;
        accountType?: string;
        department?: string;
        description?: string;
        isPayroll?: boolean;
    };
    bankOptions?: Option[];
    departmentOptions?: DepartmentOption[];
    onSubmit?: (data: {
        accountName: string;
        bankName: string;
        accountNumber: string;
        accountType: string;
        department: string;
        description: string;
        isPayroll: boolean;
    }) => void;
}

const ACCOUNT_TYPE_OPTIONS = [
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'CURRENT', label: 'Current' },
];

const BankAccountForm = ({
    loading = false,
    defaultValues = {},
    bankOptions = [],
    departmentOptions = [],
    onSubmit,
}: BankAccountFormProps) => {
    const [accountName, setAccountName] = useState(
        defaultValues.accountName ?? '',
    );
    const [bankName, setBankName] = useState(defaultValues.bankName ?? '');
    const [accountNumber, setAccountNumber] = useState(
        defaultValues.accountNumber ?? '',
    );
    const [accountType, setAccountType] = useState(
        defaultValues.accountType ?? '',
    );
    const [department, setDepartment] = useState(
        defaultValues.department ?? '',
    );
    const [description, setDescription] = useState(
        defaultValues.description ?? '',
    );
    const [isPayroll, setIsPayroll] = useState(
        defaultValues.isPayroll ?? false,
    );
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!accountName.trim())
            newErrors.accountName = 'Account name is required';
        if (!accountNumber.trim())
            newErrors.accountNumber = 'Account number is required';
        if (!bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!accountType.trim())
            newErrors.accountType = 'Account type is required';
        if (!department.trim()) newErrors.department = 'Department is required';
        return newErrors;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
        if (onSubmit) {
            onSubmit({
                accountName: accountName.trim(),
                bankName: bankName.trim(),
                accountNumber: accountNumber.trim(),
                accountType: accountType.trim(),
                department: department.trim(),
                description: description.trim(),
                isPayroll,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
                <InputField
                    id="accountName"
                    name="accountName"
                    label="Account Name"
                    placeholder="Enter Account Holder Name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                />
                {errors.accountName && (
                    <span className="text-xs text-red-500">
                        {errors.accountName}
                    </span>
                )}

                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Bank Name <span className="text-red-500">*</span>
                    </p>
                    <Select value={bankName} onValueChange={setBankName}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select the bank name" />
                        </SelectTrigger>
                        <SelectContent>
                            {bankOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.bankName && (
                        <span className="text-xs text-red-500">
                            {errors.bankName}
                        </span>
                    )}
                </div>

                <InputField
                    id="accountNumber"
                    name="accountNumber"
                    label="Account Number"
                    type="text"
                    placeholder="Enter Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                />
                {errors.accountNumber && (
                    <span className="text-xs text-red-500">
                        {errors.accountNumber}
                    </span>
                )}

                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Account Type <span className="text-red-500">*</span>
                    </p>
                    <Select value={accountType} onValueChange={setAccountType}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Account Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {ACCOUNT_TYPE_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.accountType && (
                        <span className="text-xs text-red-500">
                            {errors.accountType}
                        </span>
                    )}
                </div>

                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Assign to Department{' '}
                        <span className="text-red-500">*</span>
                    </p>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departmentOptions &&
                                Array.isArray(departmentOptions) &&
                                departmentOptions.map((dept) => (
                                    <SelectItem
                                        key={dept.id}
                                        value={String(dept.id)}
                                    >
                                        {dept.name ||
                                            dept.department ||
                                            dept.title}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {errors.department && (
                        <span className="text-xs text-red-500">
                            {errors.department}
                        </span>
                    )}
                </div>

                <InputField
                    id="description"
                    name="description"
                    label="Description"
                    type="text"
                    placeholder="Write a short Description about the account"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex justify-between items-center mb-8">
                    <p className="text-[#919191] text-sm font-normal">
                        Set as Payroll Account?
                    </p>
                    <Switch
                        checked={isPayroll}
                        onCheckedChange={setIsPayroll}
                    />
                </div>

                <div className="mt-4">
                    <Button
                        disabled={loading}
                        type="submit"
                        className="px-4 w-full h-10 py-2 bg-orion-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {loading ? 'Loading...' : 'Submit'}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default BankAccountForm;
