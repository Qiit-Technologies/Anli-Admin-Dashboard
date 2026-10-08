'use client';

import {
    getPostedBills,
    getLedgerPageStats,
    requestBillReversal,
} from '@/app/actions/internal-accounts-ledger';
import { getInternalAccountById } from '@/app/actions/internal-accounts';
import { createPostedBillColumns } from '@/components/admin/Table/column/PostedBillColumn';
import LedgerKpiCards from '@/components/admin/internal-accounts/ledger/LedgerKpiCards';
import LedgerPageHeader from '@/components/admin/internal-accounts/ledger/LedgerPageHeader';
import RequestReversalModal from '@/components/admin/internal-accounts/modals/RequestReversalModal';
import Toast from '@/components/toast';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import DashboardLoader from '@/components/DashboardLoader';
import { PostedBill } from '@/types/internal-accounts-ledger';
import { useParams, usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { printPostedBills } from '@/lib/internal-accounts/print';
import useSWR, { mutate } from 'swr';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { getInternalAccountsBasePath } from '@/lib/internal-accounts/routes';

function filterPostedBills(rows: PostedBill[], query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) =>
        [
            row.invoiceNo,
            row.sourceModule,
            row.guestCustomer,
            row.roomTableNo,
            row.postedBy,
            row.approvedBy,
            row.status,
        ]
            .join(' ')
            .toLowerCase()
            .includes(q),
    );
}

export default function InternalAccountPostedBillsPage() {
    const params = useParams<{ id: string }>();
    const pathname = usePathname();
    const basePath = getInternalAccountsBasePath(pathname);
    const [search, setSearch] = useState('');
    const [reversalBill, setReversalBill] = useState<PostedBill | null>(null);
    const [submittingReversal, setSubmittingReversal] = useState(false);

    const { data: account } = useSWR(
        params?.id ? `/internal-accounts/${params.id}` : null,
        () => getInternalAccountById(params.id),
    );

    const { data: bills, isLoading: billsLoading } = useSWR(
        params?.id ? `/internal-accounts/${params.id}/posted-bills` : null,
        () => getPostedBills(params.id),
    );

    const { data: stats, isLoading: statsLoading } = useSWR(
        params?.id ? `/internal-accounts/${params.id}/ledger-stats` : null,
        () => getLedgerPageStats(params.id),
    );

    const columns = useMemo(
        () =>
            createPostedBillColumns(
                (bill) => setReversalBill(bill),
                PERMISSIONS.REVERSE_INTERNAL_ACCOUNT_TRANSACTIONS,
            ),
        [],
    );

    const filteredBills = useMemo(
        () => filterPostedBills(bills ?? [], search),
        [bills, search],
    );

    const handleReversalSubmit = async (reason: string) => {
        if (!reversalBill) return;

        setSubmittingReversal(true);
        const result = await requestBillReversal(reversalBill.id, reason);
        setSubmittingReversal(false);

        if (result.error) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={
                        result.error ?? 'Failed to submit reversal request.'
                    }
                    type="error"
                />
            ));
            throw new Error(result.error);
        }

        toast.custom(() => (
            <Toast
                title="Request submitted"
                description="Reversal request has been submitted for approval."
                type="success"
            />
        ));
        setReversalBill(null);
        await mutate(`/internal-accounts/${params.id}/posted-bills`);
        await mutate(`/internal-accounts/${params.id}/ledger-stats`);
    };

    const handleExportPdf = () => {
        printPostedBills(account?.accountName ?? 'Internal Account', filteredBills);
    };

    if (billsLoading || statsLoading) {
        return <DashboardLoader />;
    }

    return (
        <PageWrapper permissions={[PERMISSIONS.VIEW_INTERNAL_ACCOUNT_AUDIT_TRAIL]}>
            <LedgerPageHeader
                accountId={params.id}
                basePath={basePath}
                title="Posted Bills"
                subtitle="Track all transactions in this account over time."
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by Bill name..."
                onExportPdf={handleExportPdf}
                exportPermission={PERMISSIONS.EXPORT_INTERNAL_ACCOUNT_STATEMENT}
            />

            {stats && <LedgerKpiCards stats={stats} />}

            <CustomTable
                columns={columns}
                data={filteredBills}
                hasHeader={false}
                hasFilter={false}
                searchPlaceholder="Search by Bill name..."
                pageSize={8}
                persistPaginationInQuery
                paginationQueryKey="page"
            />

            <RequestReversalModal
                open={Boolean(reversalBill)}
                onOpenChange={(open) => {
                    if (!open) setReversalBill(null);
                }}
                onSubmit={handleReversalSubmit}
                submitting={submittingReversal}
            />
        </PageWrapper>
    );
}
