import { ScopedAccount } from '@/components/front-of-house/types';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AccountForm from './AccountForm';
import { useBankList } from '@/hooks/useBankList';
import useSWR, { mutate } from 'swr';
import { getDepartments } from '@/app/actions/department';
import {
    deleteBankAccount,
    updateBankAccount,
} from '@/app/actions/bank-accounts';
import Toast from '../toast';

// Action cell for edit/delete
export const AccountMngtActionCell = ({
    account,
}: {
    account: ScopedAccount;
}) => {
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const banks = useBankList();
    const bankOptions = banks.map((bank) => ({
        label: bank.name,
        value: bank.name,
    }));
    const { data: departments } = useSWR('departments', getDepartments);

    // Placeholder delete function
    const handleDelete = async () => {
        setLoadingDelete(true);
        try {
            const response = await deleteBankAccount(account.id);
            if (response.message === 'Bank account deleted successfully!') {
                toast.custom(
                    <Toast
                        title="Account deleted"
                        description="Account deleted successfully"
                        type="success"
                    />,
                );
                mutate('/account/management');
                mutate('/bank-accounts');
                mutate('/bank-accounts/by-department');
                setDeleteDialog(false);
            } else {
                toast.custom(
                    <Toast
                        title="Failed to delete account"
                        description="Please try again"
                        type="error"
                    />,
                );
            }
        } catch (err) {
            toast.custom(
                <Toast
                    title="Failed to delete account"
                    description="Please try again"
                    type="error"
                />,
            );
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className="flex items-center gap-6 text-sm w-full">
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogTrigger asChild>
                    <button className="text-hexbrand">Edit</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Account</DialogTitle>
                    </DialogHeader>
                    <AccountForm
                        mode="edit"
                        loading={loadingUpdate}
                        bankOptions={bankOptions}
                        departmentOptions={departments || []}
                        initialValues={{
                            accountName: account.accountName || '',
                            bankName: account.bankName || '',
                            accountNumber: account.accountNumber || '',
                            accountType: account.accountType || '',
                            department:
                                typeof account.department === 'object' &&
                                account.department !== null
                                    ? String(account?.department?.id)
                                    : account.department || '',
                            description: account.description || '',
                            isPayroll: account.isPayroll || false,
                        }}
                        onSubmit={async (values: any) => {
                            setLoadingUpdate(true);
                            try {
                                // Type guard for department
                                let departmentId: string | number = '';
                                if (
                                    values.department &&
                                    typeof values.department === 'object' &&
                                    'id' in values.department
                                ) {
                                    departmentId = values.department.id;
                                } else {
                                    departmentId = values.department;
                                }
                                const response = await updateBankAccount(
                                    account.id,
                                    {
                                        ...values,
                                        department: departmentId
                                            ? Number(departmentId)
                                            : '',
                                    },
                                );
                                if (
                                    response.message ===
                                    'Bank account updated successfully!'
                                ) {
                                    toast.custom(
                                        <Toast
                                            title="Account updated"
                                            description="Account updated successfully"
                                            type="success"
                                        />,
                                    );
                                    mutate('/account/management');
                                    mutate('/bank-accounts');
                                    mutate('/bank-accounts/by-department');
                                    setEditDialog(false);
                                } else {
                                    toast.custom(
                                        <Toast
                                            title="Failed to update account"
                                            description="Please try again"
                                            type="error"
                                        />,
                                    );
                                }
                            } catch (err) {
                                toast.custom(
                                    <Toast
                                        title="Failed to update account"
                                        description="Please try again"
                                        type="error"
                                    />,
                                );
                            } finally {
                                setLoadingUpdate(false);
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogTrigger asChild>
                    <button className="text-muted-foreground">Delete</button>
                </DialogTrigger>
                <DialogContent className="w-[400px]">
                    <DialogHeader>
                        {/* <DialogTitle>Delete Account</DialogTitle> */}
                        <div className="flex flex-col">
                            <h1 className="text-center text-lg font-semibold">
                                Delete Bank Account
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete this bank
                                account?
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={handleDelete}
                        >
                            {loadingDelete && (
                                <Loader2 className="mr-2 animate-spin" />
                            )}
                            Yes, Delete
                        </Button>
                        <Button
                            variant={'outline'}
                            className="h-12 text-orion-blue border-orion-blue w-full"
                            type="button"
                            onClick={() => setDeleteDialog(false)}
                        >
                            No, Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
