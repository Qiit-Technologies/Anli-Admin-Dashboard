'use client';
import {
    activateBankAccount,
    createBankAccount,
    deleteBankAccount,
    getAllBankAccounts,
    updateBankAccount,
} from '@/app/actions/bank-accounts';
import { updateDisbursementType } from '@/app/actions/hotel';
import AccountForm from '@/components/account/AccountForm';
import BankAccountForm from '@/components/admin/form/account-form';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useHotel from '@/hooks/useHotel';
import { useBankList } from '@/hooks/useBankList';
import { getDepartments } from '@/app/actions/department';
import useSWR, { mutate } from 'swr';
import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SettingCard } from './SettingsCard';

const SettingsPage = () => {
    const { data: fetchedBankAccounts, isLoading } = useSWR(
        '/bank-accounts',
        getAllBankAccounts,
    );
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingTypeChange, setLoadingTypeChange] = useState(false);
    const [addAccount, setAddAccount] = useState(false);
    const [disbursementOption, setDisbursementOption] = useState<
        'in-app' | 'send-to-account'
    >('in-app');
    const [selectedBankAccount, setSelectedBankAccount] = useState('');
    const { organization: hotel } = useHotel();
    const banks = useBankList();
    const bankOptions = banks.map((bank) => ({
        label: bank.name,
        value: bank.name,
    }));
    const { data: departments = [] } = useSWR('departments', getDepartments);

    const disbursementType = !hotel?.disbursementType
        ? 'in-app'
        : hotel.disbursementType === 'IN_APP_DISBURSEMENT'
          ? 'in-app'
          : 'send-to-account';

    useEffect(() => {
        setDisbursementOption(disbursementType);
    }, [disbursementType]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async (data: any) => {
        setLoadingAdd(true);
        try {
            const response = await createBankAccount({
                ...data,
                department: Number(data.department),
            } as any);
            if (response.message === 'Bank account created successfully.') {
                setAddAccount(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                setLoadingAdd(false);
                mutate('/bank-accounts');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.message || 'error creating account'
                        }
                        type="error"
                    />
                ));
                setLoadingAdd(false);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
        setLoadingAdd(false);
        setAddAccount(false);
    };

    const handleDisbursementSave = async () => {
        setLoadingTypeChange(true);
        try {
            const response = await updateDisbursementType(
                disbursementOption === 'in-app'
                    ? 'IN_APP_DISBURSEMENT'
                    : 'SEND_TO_ACCOUNT',
            );
            if (
                response.message === 'Disbursement type updated successfully!'
            ) {
                setLoadingTypeChange(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
            } else {
                setLoadingTypeChange(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.message ||
                            'error updating disbursement settings'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            setLoadingTypeChange(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Error updating disbursement settings"
                    type="error"
                />
            ));
        }
    };

    if (!fetchedBankAccounts) {
        return <div>Loading...</div>;
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Settings"
                    subtitle={'Manage account and attendance'}
                />
            </PageHeader>
            <div>
                <Tabs defaultValue="disbursement" className="w-full">
                    <TabsList className="w-full px-0 justify-start gap-4 bg-transparent bordeer-b">
                        <TabsTrigger
                            className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                            value="disbursement"
                        >
                            Disbursement Setting
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="disbursement">
                        <div className="flex flex-col gap-10 mt-5">
                            <SettingsGrid>
                                <SettingItem
                                    title="Current Disbursement account"
                                    description="You can select a different payroll disbursed options"
                                >
                                    <SettingCard
                                        title="Send to Account"
                                        description="Payroll summary is sent to an internal accountant for offline/manual disbursement."
                                        isChecked={
                                            disbursementOption ===
                                            'send-to-account'
                                        }
                                        onCheckedChange={(checked) =>
                                            setDisbursementOption(
                                                checked
                                                    ? 'send-to-account'
                                                    : 'in-app',
                                            )
                                        }
                                    />
                                    <SettingCard
                                        title="In-App Disbursement"
                                        description="Salaries are disbursed automatically using connected bank or wallet APIs."
                                        isChecked={
                                            disbursementOption === 'in-app'
                                        }
                                        onCheckedChange={(checked) =>
                                            setDisbursementOption(
                                                checked
                                                    ? 'in-app'
                                                    : 'send-to-account',
                                            )
                                        }
                                    />

                                    <BrandButton
                                        className="w-fit h-10"
                                        loading={loadingTypeChange}
                                        onClick={handleDisbursementSave}
                                    >
                                        {loadingTypeChange
                                            ? '...saving'
                                            : 'Save Disbursement Settings'}
                                    </BrandButton>
                                </SettingItem>
                            </SettingsGrid>
                            <SettingsGrid>
                                <SettingItem
                                    title="Accounts"
                                    description="Account details for disbursement"
                                >
                                    {fetchedBankAccounts.map((account: any) => (
                                        <AccountCard
                                            key={account.id}
                                            id={account.id}
                                            accountName={account.accountName}
                                            bankName={account.bankName}
                                            accountNumber={
                                                account.accountNumber
                                            }
                                            active={account.isActive}
                                            isChecked={
                                                selectedBankAccount ===
                                                account.id
                                            }
                                            onCheckedChange={(checked) => {
                                                setSelectedBankAccount(
                                                    checked ? account.id : '',
                                                );
                                            }}
                                        />
                                    ))}

                                    <div>
                                        <Dialog
                                            open={addAccount}
                                            onOpenChange={setAddAccount}
                                        >
                                            <DialogTrigger asChild>
                                                <Button className="bg-orion-blue">
                                                    Add New Account
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Add New Account
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Create a new bank
                                                        account here.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div>
                                                    <AccountForm
                                                        mode="create"
                                                        loading={loadingAdd}
                                                        bankOptions={
                                                            bankOptions
                                                        }
                                                        departmentOptions={
                                                            departments
                                                        }
                                                        onSubmit={handleSubmit}
                                                    />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </SettingItem>
                            </SettingsGrid>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </PageWrapper>
    );
};

export default SettingsPage;

const SettingsGrid = ({ children }: { children: ReactNode }) => {
    return (
        <div className="grid grid-col-1 lg:grid-cols-4 gap-4">{children}</div>
    );
};

const SettingItem = ({
    children,
    title,
    description,
}: {
    children: ReactNode;
    title: string;
    description: string;
}) => {
    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-col">
                    <h1 className="text-base font-semibold">{title}</h1>
                    <span className="text-sm text-muted-foreground">
                        {description}
                    </span>
                </div>
            </div>
            <div className="flex lg:col-span-2 flex-col gap-4">{children}</div>
        </>
    );
};

interface BankAccountCard {
    id: number;
    accountName: string;
    bankName: string;
    accountNumber: string;
    isChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    active?: boolean;
}

const AccountCard = ({
    id,
    accountName,
    bankName,
    accountNumber,
    isChecked,
    onCheckedChange,
    active,
}: BankAccountCard) => {
    const [loadingEdit, setLoadingEdit] = useState(false);
    console.log(active, bankName, accountName, accountNumber);
    const handleEdit = async () => {
        setLoadingEdit(true);
        const updates = {
            accountName,
            bankName,
            accountNumber,
            accountType: 'BANK_ACCOUNT',
            department: '',
            description: '',
            isPayroll: false,
        };
        try {
            const response = await updateBankAccount(id, updates as any);
            if (response) {
                if (response.message === 'Bank account updated successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setLoadingEdit(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="Error updating bank account"
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Error updating bank account"
                    type="error"
                />
            ));
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await deleteBankAccount(id);
            if (response) {
                if (response.message === 'Bank account deleted successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setLoadingEdit(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="Error deleting bank account"
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Error updating bank account"
                    type="error"
                />
            ));
        }
    };

    const activateAccount = async () => {
        try {
            const response = await activateBankAccount(id, active);
            if (response) {
                if (
                    response.message ===
                    `Bank account ${active ? 'activated' : 'deactivated'} successfully!`
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setLoadingEdit(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="Error deleting bank account"
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Error updating bank account"
                    type="error"
                />
            ));
        }
    };

    return (
        <div
            onClick={() => onCheckedChange?.(!isChecked)}
            role="button"
            aria-label={accountName}
            className={cn(
                'border flex items-center bg-white p-4 rounded-xl',
                isChecked && 'border-hexbrand',
            )}
        >
            <div className="flex flex-col gap-4">
                <span className="text-sm ">
                    <span className="text-muted-foreground">Bank Name</span>
                    {'   '}
                    {bankName}
                </span>
                <span className="text-sm">
                    <span className="text-muted-foreground">
                        Account Number
                    </span>
                    {'   '}
                    {accountNumber}
                </span>
                <span className="text-sm">
                    <span className="text-muted-foreground">Status</span>
                    {'   '}
                    {active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div className="flex items-center ml-auto gap-4 text-sm">
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-muted-foreground">Edit</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Bank Account</DialogTitle>
                            <DialogDescription>
                                Update your bank account details.
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <BankAccountForm
                                loading={loadingEdit}
                                onSubmit={handleEdit}
                                defaultValues={{
                                    accountName,
                                    bankName,
                                    accountNumber,
                                    accountType: 'BANK_ACCOUNT',
                                    department: '',
                                    description: '',
                                    isPayroll: false,
                                }}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
                <button
                    onClick={handleDelete}
                    className="text-muted-foreground"
                >
                    Delete
                </button>
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-muted-foreground">
                            {active ? 'Active' : 'Activate'}
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Activate Account</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to make this your default
                                disbursement account? Activating one account
                                automatically deactivates any previously active
                                account.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-4 mt-4">
                            <DialogTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button
                                onClick={activateAccount}
                                className="bg-orion-blue"
                            >
                                Activate
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
