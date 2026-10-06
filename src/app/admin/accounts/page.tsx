'use client';
import { getAllBankAccounts } from '@/app/actions/bank-accounts';
import AddAccount from '@/components/account/addAccount';
import { BankAccountColumn } from '@/components/admin/Table/column/BankAccountColumn';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { Button } from '@/components/ui/button';
import DashboardLoader from '@/components/DashboardLoader';
import { Plus } from 'lucide-react';
import useSWR from 'swr';

const AccountsPage = () => {
    const { data: fetchedBankAccounts, isLoading } = useSWR(
        '/bank-accounts',
        getAllBankAccounts,
    );

    if (isLoading) {
        return <DashboardLoader />;
    }

    if (!fetchedBankAccounts) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full">
                <DashboardLoader />
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Accounts"
                    subtitle={'Accounts Management'}
                />
            </PageHeader>
            <div>
                <CustomTable
                    columns={BankAccountColumn}
                    data={fetchedBankAccounts}
                    extend={
                        <AddAccount
                            trigger={
                                <Button className="bg-orion-blue">
                                    <Plus className="w-4 h-4" />
                                    Account
                                </Button>
                            }
                        />
                    }
                />
            </div>
        </PageWrapper>
    );
};

export default AccountsPage;
