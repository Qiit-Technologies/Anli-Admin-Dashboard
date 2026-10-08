'use client';

import { getReceivables } from '@/app/actions/receivables';
import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import type { ARAPRow } from '@/components/front-office/account-section/common/ARAPColumns';
import { DeleteBtn } from '@/components/front-office/account-section/receivables/DeleteBtn';
import { PrintBtn } from '@/components/front-office/account-section/receivables/PrintBtn';
import { ReceivableTable } from '@/components/front-office/account-section/receivables/ReceviableTable';
import { TransferBtn } from '@/components/front-office/account-section/receivables/TransferBtn';
import { UpdateBtn } from '@/components/front-office/account-section/receivables/UpdateBtn';
import { ViewReceivableModal } from '@/components/front-office/account-section/receivables/ViewReceivableModal';
import ReceivablesSkeleton from '@/components/front-office/account-section/receivables/ReceivablesSkeleton';
import { Button } from '@/components/ui/button';
import {
    isPmFolioReceivable,
    mapReceivableToARAPRow,
    normalizeReceivablesResponse,
} from '@/lib/front-office/pm-folio';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

export default function PmFolioPage() {
    const [selectedRow, setSelectedRow] = useState<ARAPRow | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const { data: receivablesRes, isLoading } = useSWR(
        '/accounts/receivables',
        getReceivables,
    );

    const pmFolioRows: ARAPRow[] = useMemo(() => {
        return normalizeReceivablesResponse(receivablesRes)
            .filter(isPmFolioReceivable)
            .map(mapReceivableToARAPRow);
    }, [receivablesRes]);

    const totalOutstanding = useMemo(
        () => pmFolioRows.reduce((sum, row) => sum + Number(row.balance || 0), 0),
        [pmFolioRows],
    );

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="PM Folio (Posting Master)"
                    subtitle="Unsettled guest balances transferred at checkout (reference PM-FOLIO-…). Collect payment here or in Account Receivable."
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border bg-white p-4">
                            <p className="text-xs text-muted-foreground">
                                Open PM folio accounts
                            </p>
                            <p className="text-2xl font-semibold">
                                {pmFolioRows.length}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-white p-4 sm:col-span-2">
                            <p className="text-xs text-muted-foreground">
                                Total outstanding (PM folio)
                            </p>
                            <p className="text-2xl font-semibold text-red-700">
                                {formatCurrency(totalOutstanding)}
                            </p>
                        </div>
                    </div>

                    <Options
                        selectedRow={selectedRow}
                        rows={pmFolioRows}
                        onView={() => setViewModalOpen(true)}
                    />
                    {isLoading ? (
                        <ReceivablesSkeleton />
                    ) : pmFolioRows.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
                            No PM folio balances yet. When checkout uses{' '}
                            <span className="font-medium">
                                Transfer outstanding to PM folio
                            </span>
                            , lines appear here with reference{' '}
                            <span className="font-mono">PM-FOLIO-…</span>.
                        </div>
                    ) : (
                        <ReceivableTable
                            variant="pm-folio"
                            data={pmFolioRows}
                            onSelectionChange={(rows) =>
                                setSelectedRow(rows[0] ?? null)
                            }
                        />
                    )}
                </div>
                <ViewReceivableModal
                    open={viewModalOpen}
                    onOpenChange={setViewModalOpen}
                    receivable={selectedRow}
                />
            </PageWrapper>
        </div>
    );
}

function Options({
    selectedRow,
    rows,
    onView,
}: {
    selectedRow: ARAPRow | null;
    rows: ARAPRow[];
    onView: () => void;
}) {
    return (
        <div className="flex h-[74px] w-full items-center justify-between bg-[#F3F6F9] px-8">
            <div className="flex items-center gap-2">
                <Button
                    onClick={onView}
                    variant="outline"
                    disabled={!selectedRow}
                >
                    View
                </Button>
                <TransferBtn selected={selectedRow} />
                <DeleteBtn selected={selectedRow} />
                <UpdateBtn selected={selectedRow} />
            </div>
            <div className="flex items-center gap-2">
                <PrintBtn rows={rows} type="receivables" />
                <Button asChild variant="outline" size="sm">
                    <Link href="/front-office/account-section/receivables">
                        All receivables
                    </Link>
                </Button>
            </div>
        </div>
    );
}
