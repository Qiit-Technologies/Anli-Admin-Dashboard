'use client';
import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { DeleteBtn } from '@/components/front-office/account-section/receivables/DeleteBtn';
import { PrintBtn } from '@/components/front-office/account-section/receivables/PrintBtn';
import { ReceivableTable } from '@/components/front-office/account-section/receivables/ReceviableTable';
import { TransferBtn } from '@/components/front-office/account-section/receivables/TransferBtn';
import { UpdateBtn } from '@/components/front-office/account-section/receivables/UpdateBtn';
import { ViewReceivableModal } from '@/components/front-office/account-section/receivables/ViewReceivableModal';
import ReceivablesSkeleton from '@/components/front-office/account-section/receivables/ReceivablesSkeleton';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { getReceivables } from '@/app/actions/receivables';
import type { ARAPRow } from '@/components/front-office/account-section/common/ARAPColumns';
import Link from 'next/link';
import { useState } from 'react';

export default function AccountReceivablePage() {
    const [selectedRow, setSelectedRow] = useState<ARAPRow | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const { data: receivablesRes, isLoading } = useSWR(
        '/accounts/receivables',
        getReceivables,
    );
    const receivables: any[] = Array.isArray(receivablesRes)
        ? (receivablesRes as any[])
        : Array.isArray((receivablesRes as any)?.data)
          ? ((receivablesRes as any).data as any[])
          : [];

    const mappedRows: ARAPRow[] = receivables
        .filter((r) => r != null)
        .map((r: any) => ({
            accountId: Number(r.id ?? 0),
            guestId: Number(r.guestId ?? r.id ?? 0),
            accountNumber: String(
                r.accountNumber ?? `REC-${String(r.id).padStart(5, '0')}`,
            ),
            title: r.title ?? null,
            lastName: String(r.lastName ?? ''),
            firstName: String(r.firstName ?? ''),
            fullName: r?.fullName ? String(r?.fullName) : undefined,
            email: r.email ? String(r.email) : undefined,
            balance: Number(r.balance ?? 0),
            phoneNumber: String(r.phoneNumber ?? ''),
            createdAt: new Date(r.createdAt ?? Date.now()),
            gender: (r.gender ?? 'male') as 'male' | 'female' | 'other',
            address: String(r.address ?? ''),
            IDNumber: r.IDNumber ? String(r.IDNumber) : undefined,
            nationality: r.nationality ? String(r.nationality) : undefined,
            dateOfBirth: r.dateOfBirth
                ? r.dateOfBirth instanceof Date
                    ? r.dateOfBirth
                    : new Date(r.dateOfBirth)
                : undefined,
            notes: r.notes ? String(r.notes) : undefined,
            createdBy: String(r.createdBy ?? ''),
            guestType: String(r.guestType ?? ''),
            roomId: r.roomId ?? undefined,
            roomNumber: r.roomNumber ?? undefined,
            isCheckedIn: r.isCheckedIn ?? undefined,
            isCheckedOut: r.isCheckedOut ?? undefined,
        }));

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Account Receivable"
                    subtitle="Tracks amounts guests owe to the hotel. PM folio lines from checkout appear here (reference PM-FOLIO-…)."
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="flex flex-col gap-4">
                    <Options
                        selectedRow={selectedRow}
                        rows={mappedRows}
                        onView={() => setViewModalOpen(true)}
                    />
                    {isLoading ? (
                        <ReceivablesSkeleton />
                    ) : (
                        <ReceivableTable
                            data={mappedRows}
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

const Options = ({
    selectedRow,
    rows,
    onView,
}: {
    selectedRow: ARAPRow | null;
    rows: ARAPRow[];
    onView: () => void;
}) => {
    return (
        <div className="w-full h-[74px] bg-[#F3F6F9] flex justify-between items-center px-8">
            <div className="flex gap-2 items-center">
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
            <div className="flex gap-2 items-center">
                <PrintBtn rows={rows} type="receivables" />
                <Button
                    asChild
                    size="sm"
                    className="bg-orion-blue text-white hover:bg-orion-blue/90"
                >
                    <Link href="/front-office/account-section/receivables/ar-summary">
                        AR Summary
                    </Link>
                </Button>
            </div>
        </div>
    );
};
