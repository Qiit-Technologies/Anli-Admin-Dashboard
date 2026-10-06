'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/stock/tables/CustomTable';
import { purchaseLogColumns } from './columns';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import useSWR from 'swr';
import { getPurchaseLogs } from '@/app/actions/stock';
import { useMemo, useState } from 'react';
import EmptyState from '@/components/common/EmptyState';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import type { PurchaseLog } from './types';

const PurchaseLogPage = () => {
    const router = useRouter();
    const { data: logsResponse, isLoading } = useSWR(
        '/items/purchase-logs',
        getPurchaseLogs,
    );
    const [search, setSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const logs: PurchaseLog[] = useMemo(
        () => logsResponse?.data || [],
        [logsResponse],
    );

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase();
        const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
        const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

        return logs.filter((log: any) => {
            const logDate = new Date(log.purchaseDate || log.createdAt);
            if (from && logDate < from) return false;
            if (to && logDate > to) return false;
            if (!query) return true;

            const haystack = [
                log.logId,
                log.remarks,
                log.receivedBy?.fullName ?? log.receivedBy,
                ...(log.items || []).map(
                    (item: any) =>
                        `${item.item?.name ?? ''} ${item.supplierName ?? ''}`,
                ),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [logs, search, fromDate, toDate]);

    const totals = useMemo(
        () =>
            filteredLogs.reduce(
                (acc: { spent: number; items: number }, log: any) => ({
                    spent: acc.spent + Number(log.totalCost || 0),
                    items: acc.items + Number(log.totalItems || 0),
                }),
                { spent: 0, items: 0 },
            ),
        [filteredLogs],
    );

    const hasLogs = logs.length > 0;
    const isFiltered = Boolean(search.trim() || fromDate || toDate);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Purchase Log"
                    subtitle="History of Stock Movement IN — restocks posted from the store ledger."
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="flex-1 overflow-auto pt-3">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold text-foreground">
                                Purchase Log History
                            </h2>
                            <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                Complete audit trail of inventory restock
                                activities. New purchases are entered as IN on
                                Stock Movement.
                            </p>
                        </div>
                    </div>

                    {hasLogs && (
                        <div className="rounded-md border bg-white p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2 md:col-span-2">
                                    <Label
                                        className="text-sm"
                                        htmlFor="purchase-log-search"
                                    >
                                        Search
                                    </Label>
                                    <Input
                                        id="purchase-log-search"
                                        className="h-9 rounded-sm text-sm"
                                        placeholder="Log ID, item, supplier or staff"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        className="text-sm"
                                        htmlFor="purchase-log-from"
                                    >
                                        From
                                    </Label>
                                    <Input
                                        id="purchase-log-from"
                                        type="date"
                                        className="h-9 rounded-sm text-sm"
                                        value={fromDate}
                                        max={toDate || undefined}
                                        onChange={(e) =>
                                            setFromDate(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        className="text-sm"
                                        htmlFor="purchase-log-to"
                                    >
                                        To
                                    </Label>
                                    <Input
                                        id="purchase-log-to"
                                        type="date"
                                        className="h-9 rounded-sm text-sm"
                                        value={toDate}
                                        min={fromDate || undefined}
                                        onChange={(e) =>
                                            setToDate(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
                                <p className="text-muted-foreground">
                                    {filteredLogs.length} of {logs.length} log
                                    {logs.length === 1 ? '' : 's'} ·{' '}
                                    {totals.items} item
                                    {totals.items === 1 ? '' : 's'}
                                </p>
                                <div className="flex items-center gap-4">
                                    <p className="font-semibold tabular-nums">
                                        Total spent:{' '}
                                        {formatCurrency(totals.spent)}
                                    </p>
                                    {isFiltered && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSearch('');
                                                setFromDate('');
                                                setToDate('');
                                            }}
                                        >
                                            Clear filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden">
                        {!hasLogs && !isLoading ? (
                            <div className="flex justify-center items-center py-24">
                                <EmptyState
                                    title="No purchase logs yet"
                                    description="Post an IN quantity on Stock Movement to generate purchase history."
                                    icon={
                                        <FileText className="w-12 h-12 text-gray-200 mb-4" />
                                    }
                                />
                            </div>
                        ) : (
                            <CustomTable
                                data={filteredLogs}
                                columns={purchaseLogColumns(router)}
                                isPaginated={true}
                                hasHeader={false}
                                isLoading={isLoading}
                                variant="none"
                                title="Purchase Log"
                            />
                        )}
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default PurchaseLogPage;
