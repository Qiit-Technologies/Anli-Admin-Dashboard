'use client';

import { getTransfer, receiveTransfer } from '@/app/actions/stock';
import { getStaffList } from '@/app/actions/staff';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, PackageCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { format } from 'date-fns';

type ReceiveLine = {
    key: string;
    itemId: string | number;
    name: string;
    unit: string;
    sentQty: number;
    receivedQty: string;
    discrepancyReason: string;
};

/**
 * FRD §17 — Transfer receive flow.
 * The receiving user confirms received quantities per line. When received
 * differs from sent, a discrepancy reason is required.
 */
const TransferReceivePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [lines, setLines] = useState<ReceiveLine[]>([]);
    const [receivedBy, setReceivedBy] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: transferResponse, isLoading } = useSWR(
        id ? `/items/transfers/${id}` : null,
        () => getTransfer(id),
    );
    const { data: staffResponse } = useSWR('/staff', () =>
        getStaffList(1, 1000),
    );

    const transfer = transferResponse?.data;
    const staffList = staffResponse?.data || [];

    useEffect(() => {
        if (transfer && lines.length === 0) {
            const items = Array.isArray(transfer.items) ? transfer.items : [];
            setLines(
                items.map((item: any, idx: number) => ({
                    key: String(item.id ?? idx),
                    itemId: item.item?.id ?? item.itemId ?? idx,
                    name: item.item?.name || 'Item',
                    unit: item.unit || 'pcs',
                    sentQty: Number(item.quantity ?? 0),
                    receivedQty: String(Number(item.quantity ?? 0)),
                    discrepancyReason: '',
                })),
            );
            if (transfer.receivedBy?.id) {
                setReceivedBy(String(transfer.receivedBy.id));
            }
        }
    }, [transfer]); // eslint-disable-line react-hooks/exhaustive-deps

    const updateLine = (
        key: string,
        field: 'receivedQty' | 'discrepancyReason',
        value: string,
    ) => {
        setLines((prev) =>
            prev.map((l) => (l.key === key ? { ...l, [field]: value } : l)),
        );
    };

    const discrepancies = useMemo(
        () =>
            lines.filter(
                (l) => Number(l.receivedQty) !== l.sentQty,
            ),
        [lines],
    );

    const validationError = useMemo(() => {
        for (const l of lines) {
            const r = Number(l.receivedQty);
            if (Number.isNaN(r) || r < 0)
                return `Enter a valid received quantity for ${l.name}.`;
            if (r !== l.sentQty && !l.discrepancyReason.trim())
                return `Add a discrepancy reason for ${l.name} (sent ${l.sentQty}, received ${r}).`;
        }
        return null;
    }, [lines]);

    const handleConfirm = async () => {
        if (validationError) {
            toast.custom(() => (
                <Toast
                    title="Check quantities"
                    description={validationError}
                    type="error"
                />
            ));
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await receiveTransfer(id, {
                receivedById: receivedBy ? Number(receivedBy) : undefined,
                remarks: remarks.trim() || undefined,
                lines: lines.map((l) => ({
                    itemId: l.itemId,
                    sentQuantity: l.sentQty,
                    receivedQuantity: Number(l.receivedQty),
                    discrepancyReason:
                        l.discrepancyReason.trim() || undefined,
                })),
            });
            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={result.error}
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Received!"
                        description={
                            discrepancies.length > 0
                                ? `Transfer received with ${discrepancies.length} line(s) noting quantity differences.`
                                : 'Transfer received in full. Inventory updated.'
                        }
                        type="success"
                    />
                ));
                setTimeout(
                    () => router.push('/stock/transfer-management'),
                    800,
                );
            }
        } catch (e) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="An unexpected error occurred."
                    type="error"
                />
            ));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="flex justify-center items-center h-64">
                    <p>Loading transfer…</p>
                </div>
            </PageWrapper>
        );
    }

    if (transferResponse?.error || !transfer) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-destructive font-medium">
                        {transferResponse?.error || 'Transfer not found.'}
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </PageWrapper>
        );
    }

    const canReceive = ['APPROVED', 'SENT', 'IN_TRANSIT'].includes(
        String(transfer.status).toUpperCase(),
    );

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <div className="px-6 pt-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Transfers
                </button>
            </div>
            <PageHeader>
                <PageHeadertitle
                    title={`Receive Transfer — ${transfer.transferId}`}
                    subtitle="Confirm received quantities per line (FRD §17)."
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper className="flex-1 overflow-auto pt-2">
                <div className="max-w-5xl mx-auto space-y-6 pb-12">
                    <div className="rounded-xl border bg-white p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {(
                            [
                                ['Transfer ID', transfer.transferId],
                                [
                                    'Date',
                                    transfer.transferDate
                                        ? format(
                                              new Date(transfer.transferDate),
                                              'dd MMM yyyy',
                                          )
                                        : '—',
                                ],
                                [
                                    'From',
                                    `${transfer.fromDepartment || '—'}${transfer.fromSubUnit ? ` / ${transfer.fromSubUnit}` : ''}`,
                                ],
                                [
                                    'To',
                                    `${transfer.toDepartment || '—'}${transfer.toSubUnit ? ` / ${transfer.toSubUnit}` : ''}`,
                                ],
                                [
                                    'Sent By',
                                    transfer.transferredBy?.fullName || '—',
                                ],
                                ['Status', transfer.status || '—'],
                                [
                                    'Total Value',
                                    formatCurrency(
                                        Number(transfer.totalValue || 0),
                                    ),
                                ],
                                [
                                    'Items',
                                    String(
                                        Array.isArray(transfer.items)
                                            ? transfer.items.length
                                            : 0,
                                    ),
                                ],
                            ] as Array<[string, string]>
                        ).map(([label, value]) => (
                            <div key={label} className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className="font-medium text-foreground">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {!canReceive ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            This transfer is in status{' '}
                            <strong>{transfer.status}</strong> and cannot be
                            received right now. Only approved or in-transit
                            transfers can be received.
                        </div>
                    ) : null}

                    <div className="rounded-xl border bg-white overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-bold">
                                Receive Lines — enter actual quantities received
                            </h3>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b">
                                <tr>
                                    <th className="px-6 py-4 w-10">#</th>
                                    <th className="px-4 py-4">Item</th>
                                    <th className="px-4 py-4 text-right">
                                        Sent Qty
                                    </th>
                                    <th className="px-4 py-4 text-right w-40">
                                        Received Qty
                                    </th>
                                    <th className="px-6 py-4 w-72">
                                        Discrepancy Reason
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lines.map((line, idx) => {
                                    const received = Number(line.receivedQty);
                                    const isMismatch =
                                        !Number.isNaN(received) &&
                                        received !== line.sentQty;
                                    return (
                                        <tr
                                            key={line.key}
                                            className={
                                                isMismatch
                                                    ? 'bg-amber-50/40'
                                                    : undefined
                                            }
                                        >
                                            <td className="px-6 py-4 tabular-nums text-muted-foreground">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium">
                                                    {line.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {line.unit}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-right tabular-nums font-medium">
                                                {line.sentQty.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    className="h-10 text-right tabular-nums"
                                                    value={line.receivedQty}
                                                    disabled={!canReceive}
                                                    onChange={(e) =>
                                                        updateLine(
                                                            line.key,
                                                            'receivedQty',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Input
                                                    className="h-10 text-sm"
                                                    placeholder={
                                                        isMismatch
                                                            ? 'Reason required…'
                                                            : '—'
                                                    }
                                                    value={
                                                        line.discrepancyReason
                                                    }
                                                    disabled={!canReceive}
                                                    onChange={(e) =>
                                                        updateLine(
                                                            line.key,
                                                            'discrepancyReason',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {discrepancies.length > 0 ? (
                            <div className="px-6 py-3 border-t bg-amber-50/60 text-sm text-amber-800">
                                {discrepancies.length} line
                                {discrepancies.length === 1 ? '' : 's'} with
                                quantity{' '}
                                {discrepancies.length === 1
                                    ? 'mismatch'
                                    : 'mismatches'}{' '}
                                — a reason is required for each.
                            </div>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold">
                                Received By
                            </Label>
                            <Select
                                value={receivedBy}
                                onValueChange={setReceivedBy}
                                disabled={!canReceive}
                            >
                                <SelectTrigger className="h-11 bg-white">
                                    <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staffList.map((s: any) => (
                                        <SelectItem
                                            key={s.id}
                                            value={String(s.id)}
                                        >
                                            {s.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold">
                                Remarks (optional)
                            </Label>
                            <Textarea
                                className="bg-white"
                                placeholder="Notes on this receipt…"
                                value={remarks}
                                disabled={!canReceive}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleConfirm}
                            disabled={isSubmitting || !canReceive}
                            className="h-12 flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-md"
                        >
                            {isSubmitting
                                ? 'Confirming…'
                                : 'Confirm Receipt'}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 flex-1 rounded-md"
                            onClick={() =>
                                router.push('/stock/transfer-management')
                            }
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default TransferReceivePage;
