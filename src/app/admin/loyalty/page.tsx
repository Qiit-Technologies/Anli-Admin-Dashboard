/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
    getLoyaltyOverview,
    getLoyaltyMembers,
    getLoyaltyTransactions,
    adjustLoyaltyPoints,
    getLoyaltyTiers,
    upsertLoyaltyTier,
    deleteLoyaltyTier,
    getLoyaltyRules,
    updateLoyaltyRules,
    type LoyaltyMember,
    type LoyaltyTier,
    type LoyaltyRule,
} from '@/app/actions/loyalty';
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
import { Loader2, Award, Users, TrendingUp, Undo2 } from 'lucide-react';

type Tab = 'members' | 'transactions' | 'tiers' | 'rules';

const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'members', label: 'Members' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'tiers', label: 'Tiers' },
    { id: 'rules', label: 'Earn rules' },
];

export default function LoyaltyPage() {
    const [tab, setTab] = useState<Tab>('members');
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');

    const { data: overview } = useSWR('loyalty-overview', getLoyaltyOverview);
    const { data: membersRes, isLoading: membersLoading } = useSWR(
        ['loyalty-members', debounced],
        () => getLoyaltyMembers(debounced || undefined, 1),
    );
    const { data: txRes, isLoading: txLoading } = useSWR(
        'loyalty-transactions',
        () => getLoyaltyTransactions(undefined, 1),
    );
    const { data: tiersRes } = useSWR('loyalty-tiers', getLoyaltyTiers);
    const { data: rulesRes } = useSWR('loyalty-rules', getLoyaltyRules);

    const members: LoyaltyMember[] = membersRes?.data?.data ?? [];
    const transactions: any[] = txRes?.data?.data ?? [];
    const tiers: LoyaltyTier[] = tiersRes?.data ?? [];
    const rules: LoyaltyRule[] = rulesRes?.data ?? [];
    const stats = overview?.data;

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Loyalty Program"
                    subtitle="Monitor points, manage members, tiers and earn rules"
                />
            </PageHeader>

            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-orange-500" />
                        <div>
                            <p className="text-2xl font-bold">
                                {stats?.members ?? '—'}
                            </p>
                            <p className="text-sm text-gray-500">
                                Members with points
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold">
                                {(stats?.pointsIssued ?? 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Points issued
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <Undo2 className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold">
                                {(stats?.pointsRedeemed ?? 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Points deducted
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                            tab === t.id
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'members' && (
                <MembersTab
                    members={members}
                    loading={membersLoading}
                    search={search}
                    setSearch={setSearch}
                    onSearch={(v: string) => {
                        setDebounced(v);
                        mutate(['loyalty-members', v]);
                    }}
                />
            )}
            {tab === 'transactions' && (
                <TransactionsTab transactions={transactions} loading={txLoading} />
            )}
            {tab === 'tiers' && <TiersTab tiers={tiers} />}
            {tab === 'rules' && <RulesTab rules={rules} />}
        </PageWrapper>
    );
}

/* ---------------- Members ---------------- */

function MembersTab({
    members,
    loading,
    search,
    setSearch,
    onSearch,
}: {
    members: LoyaltyMember[];
    loading: boolean;
    search: string;
    setSearch: (v: string) => void;
    onSearch: (v: string) => void;
}) {
    const [adjusting, setAdjusting] = useState<LoyaltyMember | null>(null);
    const [points, setPoints] = useState('');
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    const submitAdjust = async () => {
        if (!adjusting) return;
        const n = parseInt(points, 10);
        if (!n || !reason.trim()) {
            toast.error('Enter points and a reason.');
            return;
        }
        setSaving(true);
        const res = await adjustLoyaltyPoints(
            adjusting.customerId,
            n,
            reason.trim(),
        );
        setSaving(false);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(
                `Adjusted. New balance: ${res.data?.balance?.toLocaleString()} pts`,
            );
            setAdjusting(null);
            setPoints('');
            setReason('');
            mutate(['loyalty-members', '']);
            mutate('loyalty-overview');
        }
    };

    return (
        <Card className="p-5">
            <div className="flex gap-3 mb-4">
                <Input
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        onSearch(e.target.value);
                    }}
                    className="max-w-sm"
                />
            </div>
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin" />
                </div>
            ) : members.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                    No members yet. Points are awarded automatically when
                    customers book.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2 pr-4">Customer</th>
                                <th className="py-2 pr-4">Balance</th>
                                <th className="py-2 pr-4">Tier</th>
                                <th className="py-2 pr-4">Last activity</th>
                                <th className="py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((m) => (
                                <tr key={m.customerId} className="border-b">
                                    <td className="py-3 pr-4">
                                        <p className="font-medium">
                                            {m.customer
                                                ? `${m.customer.firstName} ${m.customer.lastName}`
                                                : m.customerId.slice(0, 8)}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {m.customer?.email ?? ''}
                                        </p>
                                    </td>
                                    <td className="py-3 pr-4 font-bold">
                                        {m.balance.toLocaleString()} pts
                                    </td>
                                    <td className="py-3 pr-4">
                                        {m.tier ? (
                                            <Badge>{m.tier.name}</Badge>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 text-gray-500 text-xs">
                                        {m.lastActivity
                                            ? format(
                                                  new Date(m.lastActivity),
                                                  'dd MMM yyyy',
                                              )
                                            : '—'}
                                    </td>
                                    <td className="py-3 text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setAdjusting(m)}
                                        >
                                            Adjust
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog open={!!adjusting} onOpenChange={() => setAdjusting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust points</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500 mb-4">
                        {adjusting?.customer?.firstName}{' '}
                        {adjusting?.customer?.lastName} — current balance:{' '}
                        {adjusting?.balance.toLocaleString()} pts. Use negative
                        numbers to deduct.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Input
                            type="number"
                            placeholder="Points (e.g. 100 or -50)"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                        />
                        <Input
                            placeholder="Reason (shown in ledger)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <Button onClick={submitAdjust} disabled={saving}>
                            {saving ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                'Apply adjustment'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

/* ---------------- Transactions ---------------- */

function TransactionsTab({
    transactions,
    loading,
}: {
    transactions: any[];
    loading: boolean;
}) {
    return (
        <Card className="p-5">
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin" />
                </div>
            ) : transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                    No transactions yet.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2 pr-4">Date</th>
                                <th className="py-2 pr-4">Customer</th>
                                <th className="py-2 pr-4">Type</th>
                                <th className="py-2 pr-4">Points</th>
                                <th className="py-2 pr-4">Reason</th>
                                <th className="py-2 pr-4">Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t: any) => (
                                <tr key={t.id} className="border-b">
                                    <td className="py-3 pr-4 text-xs text-gray-500">
                                        {format(
                                            new Date(t.createdAt),
                                            'dd MMM yyyy HH:mm',
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 font-mono text-xs">
                                        {t.customerId.slice(0, 8)}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <Badge
                                            variant={
                                                t.type === 'earn'
                                                    ? 'default'
                                                    : t.type === 'adjust'
                                                      ? 'secondary'
                                                      : 'outline'
                                            }
                                        >
                                            {t.type}
                                        </Badge>
                                    </td>
                                    <td
                                        className={`py-3 pr-4 font-bold ${t.points >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {t.points >= 0 ? '+' : ''}
                                        {t.points}
                                    </td>
                                    <td className="py-3 pr-4 text-xs">
                                        {t.reason ?? '—'}
                                    </td>
                                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                                        {t.reference ?? '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}

/* ---------------- Tiers ---------------- */

function TiersTab({ tiers }: { tiers: LoyaltyTier[] }) {
    const [editing, setEditing] = useState<Partial<LoyaltyTier> | null>(null);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!editing?.name || editing.minPoints == null) {
            toast.error('Name and minimum points are required.');
            return;
        }
        setSaving(true);
        const res = await upsertLoyaltyTier({
            id: editing.id,
            name: editing.name,
            minPoints: Number(editing.minPoints),
            benefits: editing.benefits ?? '',
            isActive: editing.isActive ?? true,
        });
        setSaving(false);
        if (res.error) toast.error(res.error);
        else {
            toast.success('Tier saved.');
            setEditing(null);
            mutate('loyalty-tiers');
        }
    };

    const remove = async (id: number) => {
        if (!confirm('Delete this tier?')) return;
        const res = await deleteLoyaltyTier(id);
        if (res.error) toast.error(res.error);
        else {
            toast.success('Tier deleted.');
            mutate('loyalty-tiers');
        }
    };

    return (
        <Card className="p-5">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                    A member&apos;s tier is the highest tier whose minimum they
                    reach.
                </p>
                <Button size="sm" onClick={() => setEditing({})}>
                    <Award className="h-4 w-4 mr-1" /> New tier
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((t) => (
                    <Card key={t.id} className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg">{t.name}</p>
                                <p className="text-sm text-gray-500">
                                    {t.minPoints.toLocaleString()}+ pts
                                </p>
                                {t.benefits && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t.benefits}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditing(t)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => remove(t.id)}
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing?.id ? 'Edit tier' : 'New tier'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <Input
                            placeholder="Tier name"
                            value={editing?.name ?? ''}
                            onChange={(e) =>
                                setEditing({ ...editing, name: e.target.value })
                            }
                        />
                        <Input
                            type="number"
                            placeholder="Minimum points"
                            value={editing?.minPoints ?? ''}
                            onChange={(e) =>
                                setEditing({
                                    ...editing,
                                    minPoints: Number(e.target.value),
                                })
                            }
                        />
                        <Input
                            placeholder="Benefits (optional)"
                            value={editing?.benefits ?? ''}
                            onChange={(e) =>
                                setEditing({
                                    ...editing,
                                    benefits: e.target.value,
                                })
                            }
                        />
                        <Button onClick={save} disabled={saving}>
                            {saving ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                'Save tier'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

/* ---------------- Rules ---------------- */

function RulesTab({ rules }: { rules: LoyaltyRule[] }) {
    const [values, setValues] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState(false);

    const get = (r: LoyaltyRule) => values[r.key] ?? r.points;

    const save = async () => {
        setSaving(true);
        const res = await updateLoyaltyRules(
            rules.map((r) => ({ key: r.key, points: get(r), isActive: true })),
        );
        setSaving(false);
        if (res.error) toast.error(res.error);
        else {
            toast.success('Earn rules updated.');
            mutate('loyalty-rules');
        }
    };

    return (
        <Card className="p-5">
            <p className="text-sm text-gray-500 mb-4">
                Points are awarded automatically by the backend when these
                events happen for a signed-in customer.
            </p>
            <div className="flex flex-col gap-3 max-w-xl">
                {rules.map((r) => (
                    <div
                        key={r.key}
                        className="flex items-center justify-between gap-4 border rounded-lg p-3"
                    >
                        <div>
                            <p className="font-medium text-sm">{r.label}</p>
                            <p className="text-xs text-gray-500 font-mono">
                                {r.key}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                className="w-24"
                                value={get(r)}
                                onChange={(e) =>
                                    setValues({
                                        ...values,
                                        [r.key]: Number(e.target.value),
                                    })
                                }
                            />
                            <span className="text-sm text-gray-500">pts</span>
                        </div>
                    </div>
                ))}
                <Button onClick={save} disabled={saving} className="w-fit">
                    {saving ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                        'Save rules'
                    )}
                </Button>
            </div>
        </Card>
    );
}
