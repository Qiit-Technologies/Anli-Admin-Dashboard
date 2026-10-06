'use client';

import { Badge } from '@/components/ui/badge';
import { formatMemberFullName } from '@/lib/membership/member-utils';
import { cn, formatCurrency } from '@/lib/utils';
import {
    AlertCircle,
    Calendar,
    CreditCard,
    Mail,
    Phone,
    Sparkles,
    User,
} from 'lucide-react';
import MemberAvatar from './MemberAvatar';

export interface ScanMemberData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    photoUrl?: string;
    status?: string;
    membershipTier?: string;
    startDate?: string;
    endDate?: string;
    dateOfBirth?: string;
    nationality?: string;
    occupation?: string;
    totalSpend?: number;
    totalVisits?: number;
    totalBookings?: number;
    lastVisitDate?: string;
    lastServiceUsed?: string;
    isExpired?: boolean;
    isExpiringSoon?: boolean;
    daysUntilExpiry?: number | null;
    plan?: {
        id: number;
        name: string;
        price: number;
    } | null;
    referralTier?: { id: number; name: string } | null;
    isReferral?: boolean;
    referralCode?: string | null;
    planOwner?: {
        id: string;
        firstName: string;
        lastName: string;
        phone?: string;
        email?: string;
    } | null;
}

interface MemberScanResultProps {
    member?: ScanMemberData;
    isValid: boolean;
    error?: string;
    isLoading?: boolean;
}

function formatShortDate(value?: string) {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? value
        : d.toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          });
}

function StatChip({
    label,
    value,
}: Readonly<{ label: string; value: string | number }>) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900">
                {value}
            </p>
        </div>
    );
}

function DetailRow({
    icon: Icon,
    label,
    value,
}: Readonly<{
    icon: typeof Mail;
    label: string;
    value: string;
}>) {
    if (!value || value === '—') return null;
    return (
        <div className="flex items-start gap-2.5 text-sm">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-500">{label}</p>
                <p className="truncate text-gray-900">{value}</p>
            </div>
        </div>
    );
}

export default function MemberScanResult({
    member,
    isValid,
    error,
    isLoading = false,
}: Readonly<MemberScanResultProps>) {
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 animate-pulse rounded-2xl bg-gray-100" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-14 animate-pulse rounded-xl bg-gray-100"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center sm:min-h-[260px] sm:px-6 sm:py-10">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
                    <User className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                    Ready to scan
                </h3>
                <p className="mt-1 max-w-xs text-sm text-gray-500">
                    Member details will appear here as soon as a QR code is
                    detected.
                </p>
            </div>
        );
    }

    const statusLabel = member.isExpired
        ? 'Expired'
        : member.status
          ? member.status.charAt(0).toUpperCase() + member.status.slice(1)
          : 'Active';

    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-200',
                isValid
                    ? 'border-emerald-200/80'
                    : member
                      ? 'border-amber-200/80'
                      : 'border-red-200/80',
            )}
        >
            <div
                className={cn(
                    'border-b px-4 py-4 sm:px-5',
                    isValid
                        ? 'border-emerald-100 bg-emerald-50/70'
                        : 'border-amber-100 bg-amber-50/70',
                )}
            >
                <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
                    <MemberAvatar
                        photoUrl={member.photoUrl}
                        name={member.name}
                        memberId={member.id}
                    />
                    <div className="min-w-0 flex-1 sm:pt-0.5">
                        <h3 className="text-lg font-semibold text-gray-900 sm:truncate">
                            {member.name}
                        </h3>
                        <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                            <Badge
                                variant="outline"
                                className={cn(
                                    'text-[11px] font-medium',
                                    member.isExpired
                                        ? 'border-red-200 bg-red-50 text-red-700'
                                        : isValid
                                          ? 'border-emerald-200 bg-white text-emerald-700'
                                          : 'border-amber-200 bg-white text-amber-800',
                                )}
                            >
                                {statusLabel}
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="text-[11px] font-medium"
                            >
                                {member.isReferral ? 'Referral' : 'Principal'}
                            </Badge>
                            {member.membershipTier ? (
                                <Badge
                                    variant="outline"
                                    className="text-[11px] font-medium"
                                >
                                    {member.membershipTier}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
                {!isValid && error ? (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : null}

                {member.isReferral ? (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-3.5 py-3 text-sm text-amber-950">
                        <p className="flex items-center gap-1.5 font-medium">
                            <Sparkles className="h-4 w-4 text-amber-600" />
                            Referral member — no discount
                        </p>
                        {member.referralCode ? (
                            <p className="mt-1 text-xs text-amber-800">
                                Code{' '}
                                <span className="font-mono font-semibold">
                                    {member.referralCode}
                                </span>
                            </p>
                        ) : null}
                        {member.planOwner ? (
                            <p className="mt-1 text-xs text-amber-800">
                                Principal:{' '}
                                <span className="font-medium">
                                    {formatMemberFullName(member.planOwner)}
                                </span>
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {member.isExpiringSoon && !member.isExpired ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
                        Expires in {member.daysUntilExpiry} day
                        {member.daysUntilExpiry === 1 ? '' : 's'} — renewal
                        recommended.
                    </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <StatChip
                        label="Visits"
                        value={member.totalVisits ?? 0}
                    />
                    <StatChip
                        label="Spend"
                        value={formatCurrency(member.totalSpend ?? 0)}
                    />
                    <StatChip
                        label="Bookings"
                        value={member.totalBookings ?? 0}
                    />
                    <StatChip
                        label="Last visit"
                        value={
                            member.lastVisitDate
                                ? formatShortDate(member.lastVisitDate)
                                : 'None'
                        }
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow icon={Mail} label="Email" value={member.email} />
                    <DetailRow
                        icon={Phone}
                        label="Phone"
                        value={member.phone ?? ''}
                    />
                    {member.plan ? (
                        <DetailRow
                            icon={CreditCard}
                            label="Plan"
                            value={`${member.plan.name} · ${formatCurrency(member.plan.price)}`}
                        />
                    ) : null}
                    <DetailRow
                        icon={Calendar}
                        label="Membership"
                        value={`${formatShortDate(member.startDate)} → ${formatShortDate(member.endDate)}`}
                    />
                </div>

                {member.lastServiceUsed ? (
                    <p className="text-xs text-gray-500">
                        Last service:{' '}
                        <span className="font-medium text-gray-700">
                            {member.lastServiceUsed}
                        </span>
                    </p>
                ) : null}
            </div>
        </div>
    );
}
