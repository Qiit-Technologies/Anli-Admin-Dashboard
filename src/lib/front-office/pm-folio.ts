export type ReceivableApiRow = {
    id?: number;
    guestId?: number;
    referenceNumber?: string | null;
    description?: string | null;
    balance?: number;
    accountNumber?: string;
    title?: string | null;
    lastName?: string;
    firstName?: string;
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string;
    createdAt?: string | Date;
    gender?: string | null;
    address?: string;
    IDNumber?: string | null;
    nationality?: string | null;
    dateOfBirth?: string | Date | null;
    notes?: string | null;
    createdBy?: string;
    guestType?: string | null;
    roomId?: number | null;
    roomNumber?: string | number | null;
    isCheckedIn?: boolean;
    isCheckedOut?: boolean;
};

export function isPmFolioReceivable(row: ReceivableApiRow): boolean {
    const ref = String(row.referenceNumber ?? '')
        .trim()
        .toUpperCase();
    if (ref.startsWith('PM-FOLIO')) return true;
    const desc = String(row.description ?? '').toLowerCase();
    return desc.includes('pm folio') || desc.includes('pm-folio');
}

import type { ARAPRow } from '@/components/front-office/account-section/common/ARAPColumns';

export function mapReceivableToARAPRow(r: ReceivableApiRow): ARAPRow {
    return {
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
        referenceNumber: r.referenceNumber ?? null,
        description: r.description ?? null,
    };
}

export function normalizeReceivablesResponse(
    receivablesRes: unknown,
): ReceivableApiRow[] {
    if (Array.isArray(receivablesRes)) {
        return receivablesRes as ReceivableApiRow[];
    }
    if (
        receivablesRes &&
        typeof receivablesRes === 'object' &&
        Array.isArray((receivablesRes as { data?: unknown }).data)
    ) {
        return (receivablesRes as { data: ReceivableApiRow[] }).data;
    }
    return [];
}
