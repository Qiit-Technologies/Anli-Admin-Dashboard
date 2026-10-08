/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
    getClaimRequests,
    approveClaimRequest,
    rejectClaimRequest,
    type ClaimRequest,
} from '@/app/actions/claims';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

export default function ClaimsPage() {
    const [filter, setFilter] = useState<Filter>('pending');
    const { data, isLoading } = useSWR(['claim-requests', filter], () =>
        getClaimRequests(filter === 'all' ? undefined : filter),
    );
    const [reviewing, setReviewing] = useState<ClaimRequest | null>(null);
    const [note, setNote] = useState('');
    const [hotelId, setHotelId] = useState('');
    const [saving, setSaving] = useState(false);

    const claims: ClaimRequest[] = data?.data ?? [];

    const decide = async (approve: boolean) => {
        if (!reviewing) return;
        setSaving(true);
        const res = approve
            ? await approveClaimRequest(
                  reviewing.id,
                  note.trim() || undefined,
                  hotelId ? Number(hotelId) : undefined,
              )
            : await rejectClaimRequest(reviewing.id, note.trim() || undefined);
        setSaving(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(
                approve ? 'Claim approved — listing is now claimed.' : 'Claim rejected.',
            );
            setReviewing(null);
            setNote('');
            setHotelId('');
            mutate(['claim-requests', filter]);
        }
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Business Claims"
                    subtitle="Review restaurant ownership claims from the discovery directory"
                />
            </PageHeader>

            <div className="flex gap-2 mb-6">
                {(['pending', 'approved', 'rejected', 'all'] as Filter[]).map(
                    (f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-medium rounded-full capitalize ${
                                filter === f
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {f}
                        </button>
                    ),
                )}
            </div>

            <Card className="p-5">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : claims.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        No {filter === 'all' ? '' : filter} claim requests.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="py-2 pr-4">Restaurant</th>
                                    <th className="py-2 pr-4">Claimant</th>
                                    <th className="py-2 pr-4">Email verified</th>
                                    <th className="py-2 pr-4">Submitted</th>
                                    <th className="py-2 pr-4">Status</th>
                                    <th className="py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map((c) => (
                                    <tr key={c.id} className="border-b">
                                        <td className="py-3 pr-4">
                                            <p className="font-medium">
                                                {c.restaurant?.name ?? `#${c.restaurantId}`}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {c.restaurant
                                                    ? `${c.restaurant.area}, ${c.restaurant.city} · ${c.restaurant.cuisine}`
                                                    : ''}
                                            </p>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <p className="font-medium">
                                                {c.claimantName}
                                                <span className="ml-2 text-xs text-gray-500 capitalize">
                                                    {c.role}
                                                </span>
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {c.claimantEmail} · {c.claimantPhone}
                                            </p>
                                            {c.message && (
                                                <p className="text-gray-500 text-xs mt-1 italic">
                                                    “{c.message}”
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {c.otpVerified ? (
                                                <Badge className="bg-green-100 text-green-700">
                                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">No</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-500 text-xs">
                                            {format(
                                                new Date(c.createdAt),
                                                'dd MMM yyyy HH:mm',
                                            )}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <Badge
                                                variant={
                                                    c.status === 'approved'
                                                        ? 'default'
                                                        : c.status === 'rejected'
                                                          ? 'destructive'
                                                          : 'secondary'
                                                }
                                                className="capitalize"
                                            >
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-right">
                                            {c.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setReviewing(c)}
                                                >
                                                    Review
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Dialog open={!!reviewing} onOpenChange={() => setReviewing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Review claim — {reviewing?.restaurant?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-600 mb-4">
                        <p>
                            <span className="font-medium">Claimant:</span>{' '}
                            {reviewing?.claimantName} ({reviewing?.role})
                        </p>
                        <p>
                            <span className="font-medium">Contact:</span>{' '}
                            {reviewing?.claimantEmail} · {reviewing?.claimantPhone}
                        </p>
                        <p>
                            <span className="font-medium">Email verified:</span>{' '}
                            {reviewing?.otpVerified ? 'Yes' : 'No'}
                        </p>
                        {reviewing?.restaurant?.phone && (
                            <p>
                                <span className="font-medium">
                                    Listed phone:
                                </span>{' '}
                                {reviewing.restaurant.phone} — call to confirm
                                if unsure.
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <Input
                            placeholder="Review note (optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Link hotel ID (optional, for ops onboarding)"
                            value={hotelId}
                            onChange={(e) => setHotelId(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => decide(true)}
                                disabled={saving || !reviewing?.otpVerified}
                                className="flex-1"
                            >
                                {saving ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        Approve
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => decide(false)}
                                disabled={saving}
                                variant="destructive"
                                className="flex-1"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                        </div>
                        {!reviewing?.otpVerified && (
                            <p className="text-xs text-amber-600">
                                Approval is disabled until the claimant verifies
                                their email.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
