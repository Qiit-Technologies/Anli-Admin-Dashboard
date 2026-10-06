'use client';

import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { FormEvent, useState } from 'react';

interface EditBankAccountFormProps {
    loading?: boolean;
    defaultValues: {
        accountName: string;
        bankName: string;
        accountNumber: string;
    };
    onSubmit: (data: {
        accountName: string;
        bankName: string;
        accountNumber: string;
    }) => void;
}

const EditBankAccountForm = ({
    loading = false,
    defaultValues,
    onSubmit,
}: EditBankAccountFormProps) => {
    const [accountName, setAccountName] = useState(defaultValues.accountName);
    const [bankName, setBankName] = useState(defaultValues.bankName);
    const [accountNumber, setAccountNumber] = useState(
        defaultValues.accountNumber,
    );

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({
            accountName,
            bankName,
            accountNumber,
        });
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

                <InputField
                    id="bankName"
                    name="bankName"
                    label="Bank Name"
                    type="text"
                    placeholder="Enter Bank Name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                />

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

                <div className="mt-4">
                    <Button
                        disabled={loading}
                        type="submit"
                        className="px-4 w-full h-10 py-2 bg-orion-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default EditBankAccountForm;
