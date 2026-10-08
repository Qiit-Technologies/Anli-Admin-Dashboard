import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import useSWR, { mutate } from 'swr';
import { getDepartments } from '@/app/actions/department';
import { useBankList } from '@/hooks/useBankList';
import toast from 'react-hot-toast';
import { createBankAccount } from '@/app/actions/bank-accounts';
import Toast from '../toast';
import AccountForm, { AccountFormValues } from './AccountForm';

interface AddAccountDialogProps {
    trigger?: React.ReactNode;
}

const AddAccount: React.FC<AddAccountDialogProps> = ({ trigger }) => {
    const banks = useBankList();
    const bankOptions = banks.map((bank) => ({
        label: bank.name,
        value: bank.name,
    }));
    const { data: departments = [] } = useSWR('departments', getDepartments);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: AccountFormValues) => {
        setLoading(true);
        try {
            const response = await createBankAccount({
                accountName: values.accountName,
                accountNumber: values.accountNumber,
                bankName: values.bankName,
                accountType: values.accountType,
                department: Number(values.department),
                module: values.module,
                description: values.description,
                isPayroll: values.isPayroll,
            });
            if (
                response &&
                response.message === 'Bank account created successfully.'
            ) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/bank-accounts');
                mutate('/bank-accounts/by-department');
                mutate('/account/management');
                setOpen(false);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response?.error || 'Error creating account.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (err) {
            console.error('Error creating account:', err);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={'Error creating account.'}
                    type="error"
                />
            ));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? <Button>Add New Account</Button>}
            </DialogTrigger>
            <DialogContent className="rounded-none py-7 sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                    <DialogDescription>
                        You can now create and add new account to the system
                    </DialogDescription>
                </DialogHeader>
                <div className="h-[1px] bg-[#DCDCDC] w-full mb-1" />
                <AccountForm
                    mode="create"
                    loading={loading}
                    bankOptions={bankOptions}
                    departmentOptions={departments || []}
                    onSubmit={handleSubmit}
                />
            </DialogContent>
        </Dialog>
    );
};

export default AddAccount;
