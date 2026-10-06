'use client';

import {
    getAccountTransactions,
    getLedgerPageStats,
} from '@/app/actions/internal-accounts-ledger';
import { getInternalAccountById } from '@/app/actions/internal-accounts';
import { InternalAccountTransactionColumn } from '@/components/admin/Table/column/InternalAccountTransactionColumn';
import LedgerKpiCards from '@/components/admin/internal-accounts/ledger/LedgerKpiCards';
import LedgerPageHeader from '@/components/admin/internal-accounts/ledger/LedgerPageHeader';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import DashboardLoader from '@/components/DashboardLoader';
import { InternalAccountTransaction } from '@/types/internal-accounts-ledger';
import { useParams, usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { printInternalAccountTransactions } from '@/lib/internal-accounts/print';
import useSWR from 'swr';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';

function filterTransactions(rows: InternalAccountTransaction[], query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) =>
        [
            row.transactionId,
            row.type,
            row.invoiceNo,
            row.sourceModule,
            row.customer,
            row.description,
            row.initiatedBy,
            row.approvedBy,
            row.status,
        ]
            .join(' ')
            .toLowerCase()
            .includes(q),
    );
}

export default function InternalAccountTransactionsPage() {
    const params = useParams<{ id: string }>();
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const [search, setSearch] = useState('');

    const { data: account } = useSWR(
        params?.id ? `/internal-accounts/${params.id}` : null,
        () => getInternalAccountById(params.id),
    );

    const { data: transactions, isLoading: transactionsLoading } = useSWR(
        params?.id ? `/internal-accounts/${params.id}/transactions` : null,
        () => getAccountTransactions(params.id),
    );

    const { data: stats, isLoading: statsLoading } = useSWR(
        params?.id ? `/internal-accounts/${params.id}/ledger-stats` : null,
        () => getLedgerPageStats(params.id),
    );

    const filteredTransactions = useMemo(
        () => filterTransactions(transactions ?? [], search),
        [transactions, search],
    );

    const handleExportPdf = () => {
        printInternalAccountTransactions(
            account?.accountName ?? 'Internal Account',
            filteredTransactions,
        );
    };

    if (transactionsLoading || statsLoading) {
        return <DashboardLoader />;
    }

    return (
        <PageWrapper
            permissions={[
                PERMISSIONS.VIEW_INTERNAL_ACCOUNT_STATEMENT,
                PERMISSIONS.VIEW_INTERNAL_ACCOUNT_AUDIT_TRAIL,
            ]}
        >
            <LedgerPageHeader
                accountId={params.id}
                basePath={basePath}
                title="All Transactions"
                subtitle="Track all transactions in this account over time."
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by transaction name..."
                onExportPdf={handleExportPdf}
                exportPermission={PERMISSIONS.EXPORT_INTERNAL_ACCOUNT_STATEMENT}
            />

            {stats && <LedgerKpiCards stats={stats} />}

            <CustomTable
                columns={InternalAccountTransactionColumn}
                data={filteredTransactions}
                hasHeader={false}
                hasFilter={false}
                pageSize={8}
                persistPaginationInQuery
                paginationQueryKey="page"
                cellClassName="border-r border-border/60 px-3 py-2 last:border-r-0"
                headerClassName="border-r border-border/60 px-3 last:border-r-0"
            />
        </PageWrapper>
    );
}
