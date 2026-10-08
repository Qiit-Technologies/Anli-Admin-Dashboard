'use client';

import {
    getInternalAccounts,
    getInternalAccountStats,
} from '@/app/actions/internal-accounts';
import InternalAccountKpiCards from '@/components/admin/internal-accounts/InternalAccountKpiCards';
import { createInternalAccountColumns } from '@/components/admin/Table/column/InternalAccountColumn';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import DashboardLoader from '@/components/DashboardLoader';
import { Button } from '@/components/ui/button';
import { FileDown, Plus } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { downloadData } from '@/lib/downloadData';
import { printInternalAccountsList } from '@/lib/internal-accounts/print';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

const tableFilters = [
    {
        id: 'accountType',
        label: 'Account Type',
        options: [
            { value: 'all', label: 'All Types' },
            { value: 'Director Ledger', label: 'Director Ledger' },
            { value: 'Manager Ledger', label: 'Manager Ledger' },
            { value: 'House Account', label: 'House Account' },
            { value: 'Owner Account', label: 'Owner Account' },
            { value: 'Staff Account', label: 'Staff Account' },
            { value: 'VIP Account', label: 'VIP Account' },
        ],
    },
    {
        id: 'status',
        label: 'Status',
        options: [
            { value: 'all', label: 'All Status' },
            { value: 'Active', label: 'Active' },
            { value: 'In-Active', label: 'In-Active' },
        ],
    },
];

const InternalAccountsPage = () => {
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const columns = useMemo(
        () => createInternalAccountColumns(basePath),
        [basePath],
    );

    const { data: accounts, isLoading: isLoadingAccounts } = useSWR(
        '/internal-accounts',
        getInternalAccounts,
    );
    const { data: stats, isLoading: isLoadingStats } = useSWR(
        '/internal-accounts/stats',
        getInternalAccountStats,
    );

    if (isLoadingAccounts) {
        return <DashboardLoader />;
    }

    if (!accounts) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center">
                <DashboardLoader />
            </div>
        );
    }

    return (
        <PageWrapper permissions={[PERMISSIONS.VIEW_INTERNAL_ACCOUNTS]}>
            <PageHeader>
                <PageHeadertitle
                    title="Internal Accounts"
                    subtitle="Manage internal ledger accounts used for owner funding, internal consumption, etc."
                />
            </PageHeader>
            <div className="bg-white p-8 rounded-lg border">
                <div className="flex items-center justify-between mb-8">
                    <PageHeadertitle
                        title="Internal Accounts"
                        subtitle="Manage internal ledger accounts used for owner funding, internal consumption, etc."
                    />
                    <PermissionGate
                        permissions={[PERMISSIONS.CREATE_INTERNAL_ACCOUNT]}
                        blockType="hide"
                    >
                        <Button asChild size="sm" className="h-9 bg-orion-blue">
                            <Link href={`${basePath}/new`}>
                                <Plus className="mr-1.5 size-4" />
                                Create Internal Account
                            </Link>
                        </Button>
                    </PermissionGate>
                </div>
                <InternalAccountKpiCards
                    stats={stats}
                    loading={isLoadingStats}
                />
            </div>

            <CustomTable
                columns={columns}
                data={accounts}
                filters={tableFilters}
                searchPlaceholder="Search by account name, owner..."
                extend={
                    <div className="flex flex-wrap items-center gap-2">
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.EXPORT_INTERNAL_ACCOUNT_STATEMENT,
                            ]}
                            blockType="hide"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={() =>
                                    printInternalAccountsList(accounts)
                                }
                            >
                                <FileDown className="mr-1.5 size-4" />
                                Print / PDF
                            </Button>
                        </PermissionGate>
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.EXPORT_INTERNAL_ACCOUNT_STATEMENT,
                            ]}
                            blockType="hide"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9"
                                onClick={() =>
                                    downloadData(
                                        accounts,
                                        'xlsx',
                                        'internal-accounts',
                                    )
                                }
                            >
                                <FileDown className="mr-1.5 size-4" />
                                Export Excel
                            </Button>
                        </PermissionGate>
                    </div>
                }
            />
        </PageWrapper>
    );
};

export default InternalAccountsPage;
