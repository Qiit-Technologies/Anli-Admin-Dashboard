/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { AddBtn } from '@/components/front-office/account-section/payables/AddBtn';
import { RefundBtn } from '@/components/front-office/account-section/payables/RefundBtn';
import { TransferBtn } from '@/components/front-office/account-section/payables/TransferBtn';
import { DeleteBtn } from '@/components/front-office/account-section/payables/DeleteBtn';
import { DepositBtn } from '@/components/front-office/account-section/payables/DepositBtn';
import { ViewPayableModal } from '@/components/front-office/account-section/payables/ViewPayableModal';
import { PrintBtn } from '@/components/front-office/account-section/receivables/PrintBtn';
import { PayableTable } from '@/components/front-office/account-section/payables/PayableTable';
import PayablesSkeleton from '@/components/front-office/account-section/payables/PayablesSkeleton';
import type { ARAPRow } from '@/components/front-office/account-section/common/ARAPColumns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { getPayables } from '@/app/actions/payables';

export default function AccountReceivablePage() {
    const [selectedRow, setSelectedRow] = useState<ARAPRow | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const { data: payablesRes, isLoading } = useSWR(
        '/accounts/payables',
        getPayables,
    );
    const payables: any[] = Array.isArray(payablesRes)
        ? (payablesRes as any[])
        : Array.isArray((payablesRes as any)?.data)
          ? ((payablesRes as any).data as any[])
          : [];

    const mappedRows: ARAPRow[] = payables.map((p: any) => ({
        guestId: Number(p.guestProfileId ?? p.guestId ?? p.id ?? 0), // Use guestProfileId since we're showing profiles
        accountNumber: String(
            p.accountNumber ?? `PROF-${String(p.id).padStart(5, '0')}`,
        ),
        title: p.title ?? null,
        lastName: String(p.lastName ?? ''),
        firstName: String(p.firstName ?? ''),
        fullName: p.fullName
            ? String(p.fullName)
            : `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        email: p.email ? String(p.email) : undefined,
        balance: Number(p.balance ?? 0),
        phoneNumber: String(p.phoneNumber ?? ''),
        createdAt: new Date(p.createdAt ?? Date.now()),
        gender: (p.gender ?? 'male') as 'male' | 'female' | 'other',
        address: String(p.address ?? ''),
        IDNumber: p.IDNumber ? String(p.IDNumber) : undefined,
        nationality: p.nationality ? String(p.nationality) : undefined,
        dateOfBirth: p.dateOfBirth
            ? p.dateOfBirth instanceof Date
                ? p.dateOfBirth
                : new Date(p.dateOfBirth)
            : undefined,
        notes: p.notes ? String(p.notes) : undefined,
        createdBy: String(p.createdBy ?? ''),
        guestType: String(p.guestType ?? ''),
        roomId: p.roomId ?? undefined,
        roomNumber: p.roomNumber ?? undefined,
        roomTypeName: p.roomTypeName ? String(p.roomTypeName) : undefined,
        isCheckedIn: p.isCheckedIn ?? undefined,
        isCheckedOut: p.isCheckedOut ?? undefined,
    }));

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Account Payable"
                    subtitle={`Tracks amounts the hotel owes to guests`}
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
                        <PayablesSkeleton />
                    ) : (
                        <PayableTable
                            data={mappedRows}
                            onSelectionChange={(rows) =>
                                setSelectedRow(rows[0] ?? null)
                            }
                        />
                    )}
                </div>
                <ViewPayableModal
                    open={viewModalOpen}
                    onOpenChange={setViewModalOpen}
                    payable={selectedRow}
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
                <AddBtn />
                <DepositBtn selected={selectedRow} />
                <RefundBtn selected={selectedRow} />
            </div>
            <div className="flex gap-2 items-center">
                <PrintBtn rows={rows} type="payables" />
                <Button
                    asChild
                    size="sm"
                    className="bg-orion-blue text-white hover:bg-orion-blue/90"
                >
                    <Link href="/front-office/account-section/payables/ap-summary">
                        AP Summary
                    </Link>
                </Button>
            </div>
        </div>
    );
};
