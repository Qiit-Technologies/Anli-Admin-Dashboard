import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import * as yup from 'yup';
import { FaSpinner } from 'react-icons/fa6';

const modules = ['Front Office', 'Restaurant', 'Petty Cash', 'Purchase Order'];

const ACCOUNT_TYPE_OPTIONS = [
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'CURRENT', label: 'Current' },
];

interface DepartmentOption {
    id: string | number;
    name?: string;
    department?: string;
    title?: string;
}

export interface AccountFormValues {
    accountName: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
    department: string;
    module: string;
    description: string;
    isPayroll: boolean;
}

interface AccountFormProps {
    initialValues?: Partial<AccountFormValues>;
    bankOptions: { label: string; value: string }[];
    departmentOptions?: DepartmentOption[];
    loading?: boolean;
    mode?: 'create' | 'edit';
    onSubmit: (values: AccountFormValues) => void;
}

// Yup validation schema
const accountFormSchema = yup.object({
    accountName: yup.string().required('Account name is required'),
    accountNumber: yup.string().required('Account number is required'),
    bankName: yup.string().required('Bank name is required'),
    accountType: yup.string().required('Account type is required'),
    department: yup.string().optional(),
    description: yup.string(),
    isPayroll: yup.boolean(),
});

const AccountForm: React.FC<AccountFormProps> = ({
    initialValues = {},
    bankOptions,
    // departmentOptions,
    loading = false,
    mode = 'create',
    onSubmit,
}) => {
    const [accountName, setAccountName] = useState(
        initialValues.accountName || '',
    );
    const [accountNumber, setAccountNumber] = useState(
        initialValues.accountNumber || '',
    );
    const [accountType, setAccountType] = useState(
        initialValues.accountType || '',
    );
    const [department, setDepartment] = useState(
        initialValues.department || '',
    );
    const [module, setModule] = useState(initialValues.module || '');

    const [bankName, setBankName] = useState(initialValues.bankName || '');
    const [description, setDescription] = useState(
        initialValues.description || '',
    );
    const [isPayroll, setIsPayroll] = useState(
        initialValues.isPayroll || false,
    );
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Real-time validation functions
    const validateField = async (fieldName: string, value: string) => {
        try {
            const fieldData = { [fieldName]: value };
            await accountFormSchema.validateAt(fieldName, fieldData);
            // Clear error for this field if validation passes
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        } catch (validationError) {
            if (validationError instanceof yup.ValidationError) {
                setErrors((prev) => ({
                    ...prev,
                    [fieldName]: validationError.message,
                }));
            }
        }
    };
    // Handle input changes with real-time validation
    const handleInputChange = (fieldName: string, value: string) => {
        switch (fieldName) {
            case 'accountName':
                setAccountName(value);
                if (value.trim()) validateField('accountName', value.trim());
                break;
            case 'accountNumber':
                setAccountNumber(value);
                if (value.trim()) validateField('accountNumber', value.trim());
                break;
            case 'description':
                setDescription(value);
                break;
        }
    };

    // Handle select changes with real-time validation
    const handleSelectChange = (fieldName: string, value: string) => {
        switch (fieldName) {
            case 'bankName':
                setBankName(value);
                if (value.trim()) validateField('bankName', value.trim());
                break;
            case 'accountType':
                setAccountType(value);
                if (value.trim()) validateField('accountType', value.trim());
                break;
            case 'module':
                setModule(value);
                if (value.trim()) validateField('module', value.trim());
                break;
            case 'department':
                setDepartment(value);
                if (value.trim()) validateField('department', value.trim());
                break;
        }
    };

    const validate = async () => {
        try {
            const formData = {
                accountName: accountName.trim(),
                accountNumber: accountNumber.trim(),
                bankName: bankName.trim(),
                accountType: accountType.trim(),
                department: department.trim(),
                description: description.trim(),
                isPayroll,
            };

            await accountFormSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (validationError) {
            if (validationError instanceof yup.ValidationError) {
                const newErrors: { [key: string]: string } = {};
                validationError.inner.forEach((error) => {
                    if (error.path) {
                        newErrors[error.path] = error.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await validate();
        if (!isValid) return;

        onSubmit({
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim(),
            bankName: bankName.trim(),
            accountType: accountType.trim(),
            department: department.trim(),
            module: module.trim(),
            description: description.trim(),
            isPayroll,
        });
    };

    // Check if form is valid for button state
    const isFormValid =
        !!accountName.trim() &&
        !!accountNumber.trim() &&
        !!bankName.trim() &&
        !!accountType.trim();

    return (
        <form className="flex flex-col h-full" onSubmit={handleSubmit}>
            <div className="overflow-y-scroll max-h-[60vh] px-2 flex-1 flex flex-col gap-5 items-stretch">
                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Account Name <span className="text-red-500">*</span>
                    </p>
                    <Input
                        className={`rounded-lg border-none ${
                            errors.accountName
                                ? 'bg-red-50 border border-red-200 focus:ring-red-500'
                                : 'bg-[#FAFAFA]'
                        }`}
                        placeholder="Enter Account Name"
                        value={accountName}
                        onChange={(e) =>
                            handleInputChange('accountName', e.target.value)
                        }
                        aria-invalid={!!errors.accountName}
                    />
                    {errors.accountName && (
                        <span className="text-xs text-red-500 mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.accountName}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Bank Name <span className="text-red-500">*</span>
                    </p>
                    <Select
                        value={bankName}
                        onValueChange={(value) =>
                            handleSelectChange('bankName', value)
                        }
                    >
                        <SelectTrigger
                            className={`w-full ${
                                errors.bankName
                                    ? 'bg-red-50 border-red-200 focus:ring-red-500'
                                    : ''
                            }`}
                        >
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
                        <span className="text-xs text-red-500 mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.bankName}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Account Number <span className="text-red-500">*</span>
                    </p>
                    <Input
                        className={`rounded-lg border-none ${
                            errors.accountNumber
                                ? 'bg-red-50 border border-red-200 focus:ring-red-500'
                                : 'bg-[#FAFAFA]'
                        }`}
                        placeholder="Enter Account Number"
                        value={accountNumber}
                        onChange={(e) =>
                            handleInputChange('accountNumber', e.target.value)
                        }
                        aria-invalid={!!errors.accountNumber}
                    />
                    {errors.accountNumber && (
                        <span className="text-xs text-red-500 mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.accountNumber}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Account Type <span className="text-red-500">*</span>
                    </p>
                    <Select
                        value={accountType}
                        onValueChange={(value) =>
                            handleSelectChange('accountType', value)
                        }
                    >
                        <SelectTrigger
                            className={`w-full ${
                                errors.accountType
                                    ? 'bg-red-50 border-red-200 focus:ring-red-500'
                                    : ''
                            }`}
                        >
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
                        <span className="text-xs text-red-500 mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.accountType}
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Department
                    </p>
                    <Select
                        value={module}
                        onValueChange={(value) =>
                            handleSelectChange('module', value)
                        }
                    >
                        <SelectTrigger
                            className={`w-full ${
                                errors.module
                                    ? 'bg-red-50 border-red-200 focus:ring-red-500'
                                    : ''
                            }`}
                        >
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {modules.map((module) => (
                                <SelectItem key={module} value={module}>
                                    {module}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.module && (
                        <span className="text-xs text-red-500 mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.module}
                        </span>
                    )}
                </div>
                {/* <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Assign to Department{' '}
                        <span className="">(optional)</span>
                    </p>
                    <Select
                        value={department}
                        onValueChange={(value) =>
                            handleSelectChange('department', value)
                        }
                    >
                        <SelectTrigger
                            className={`w-full ${
                                errors.department
                                    ? 'bg-red-50 border-red-200 focus:ring-red-500'
                                    : ''
                            }`}
                        >
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
                        <span className="text-xs text-red-500 mt-1 flex items-center">
                            <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.department}
                        </span>
                    )}
                </div> */}
                <div>
                    <p className="text-[#919191] text-sm font-normal mb-2">
                        Description
                    </p>
                    <Input
                        className="rounded-lg bg-[#FAFAFA] border-none"
                        placeholder="Write a short Description about the account"
                        value={description}
                        onChange={(e) =>
                            handleInputChange('description', e.target.value)
                        }
                    />
                </div>
                <div className="flex justify-between items-center mb-8">
                    <p className="text-[#919191] text-sm font-normal">
                        Set as Payroll Account?
                    </p>
                    <Switch
                        checked={isPayroll}
                        onCheckedChange={setIsPayroll}
                    />
                </div>
            </div>
            <div className="px-8 pt-4 pb-2">
                <Button
                    type="submit"
                    disabled={loading || !isFormValid}
                    onClick={() =>
                        console.log('Button clicked!', { loading, isFormValid })
                    }
                    className="bg-orion-blue hover:bg-orion-blue text-[#F3F3F3] text-sm font-medium leading-5 px-[10px] py-4 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <FaSpinner className="h-4 w-4 animate-spin" />
                            {mode === 'edit' ? 'Saving...' : 'Adding...'}
                        </div>
                    ) : mode === 'edit' ? (
                        'Save Changes'
                    ) : (
                        'Add New Account'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default AccountForm;
