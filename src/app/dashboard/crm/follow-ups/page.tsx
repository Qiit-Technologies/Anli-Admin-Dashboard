'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    AlertCircle,
    ArrowLeft,
    CalendarClock,
    Pencil,
    StickyNote,
} from 'lucide-react';
import {
    addLeadActivity,
    getFollowUpsDue,
    updateLead,
    type CrmLead,
} from '@/app/actions/crm';
import PageWrapper from '@/components/common/PageWrapper';
import {
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import { InputField, TextAreaField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import {
    formatDate,
    isOverdue,
    stageBadgeClass,
    stageLabel,
} from '@/components/admin/crm/crm-shared';

function overdueDays(dueAt?: string): number {
    if (!dueAt) return 0;
    try {
        const diff = Date.now() - new Date(dueAt).getTime();
        return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
    } catch {
        return 0;
    }
}

function LogActivityDialog({
    lead,
    open,
    onOpenChange,
    onLogged,
}: {
    lead: CrmLead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogged: () => void;
}) {
    const [body, setBody] = useState('');
    const [logging, setLogging] = useState(false);

    useEffect(() => {
        if (open) setBody('');
    }, [open ]);

    const handleSubmit = async () => {
        if (!lead || !body.trim()) {
            toast.error('Write a note before logging.');
            return;
        }
        setLogging(true);
        try {
            await addLeadActivity(lead.id, {
                type: 'NOTE',
                body: body.trim(),
            });
            toast.success('Activity logged.');
            onOpenChange(false);
            onLogged();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to log activity.',
            );
        } finally {
            setLogging(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Log activity{lead ? ` — ${lead.companyName}` : ''}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <TextAreaField
                        id="followup-note"
                        name="body"
                        label="Note"
                        placeholder="What happened on this follow-up?"
                        rows={4}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={logging}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={logging}
                        >
                            {logging ? 'Logging…' : 'Log activity'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function RescheduleDialog({
    lead,
    open,
    onOpenChange,
    onSaved,
}: {
    lead: CrmLead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}) {
    const [date, setDate] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && lead) {
            setDate(
                lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : '',
            );
        }
    }, [open, lead]);

    const handleSubmit = async () => {
        if (!lead) return;
        setSaving(true);
        try {
            await updateLead(lead.id, { nextFollowUpAt: date || null });
            toast.success(
                date ? 'Follow-up rescheduled.' : 'Follow-up cleared.',
            );
            onOpenChange(false);
            onSaved();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Failed to reschedule follow-up.',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        Reschedule{lead ? ` — ${lead.companyName}` : ''}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <InputField
                        id="reschedule-date"
                        name="nextFollowUpAt"
                        label="New follow-up date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function CrmFollowUpsPage() {
    const [leads, setLeads] = useState<CrmLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [logLead, setLogLead] = useState<CrmLead | null>(null);
    const [rescheduleLead, setRescheduleLead] = useState<CrmLead | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setLeads(await getFollowUpsDue());
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Failed to load follow-ups.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const sorted = useMemo(
        () =>
            [...leads].sort((a, b) => {
                const aTime = a.nextFollowUpAt
                    ? new Date(a.nextFollowUpAt).getTime()
                    : Infinity;
                const bTime = b.nextFollowUpAt
                    ? new Date(b.nextFollowUpAt).getTime()
                    : Infinity;
                return aTime - bTime;
            }),
        [leads],
    );

    return (
        <>
            <PageHeader>
                <PageHeadertitle
                    title="Follow-ups"
                    subtitle="Due and overdue follow-ups across the pipeline"
                    hasBack
                />
            </PageHeader>

            <PageWrapper>
                {loading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                ) : sorted.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <CalendarClock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                Nothing due right now
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                All follow-ups are scheduled or up to date.
                            </p>
                            <Button asChild variant="outline" className="mt-4">
                                <Link href="/dashboard/crm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to pipeline
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {sorted.map((lead) => {
                            const overdue = isOverdue(lead.nextFollowUpAt);
                            const days = overdueDays(lead.nextFollowUpAt);
                            return (
                                <Card
                                    key={lead.id}
                                    className={
                                        overdue
                                            ? 'border-red-200 dark:border-red-900'
                                            : ''
                                    }
                                >
                                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link
                                                    href={`/dashboard/crm/leads/${lead.id}`}
                                                    className="truncate text-sm font-semibold hover:underline"
                                                >
                                                    {lead.companyName}
                                                </Link>
                                                <Badge
                                                    className={stageBadgeClass(
                                                        lead.status,
                                                    )}
                                                >
                                                    {stageLabel(lead.status)}
                                                </Badge>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                {lead.contactName}
                                                {lead.ownerName
                                                    ? ` • Owner: ${lead.ownerName}`
                                                    : ''}
                                            </p>
                                            <p
                                                className={`mt-1 inline-flex items-center gap-1 text-xs ${
                                                    overdue
                                                        ? 'font-semibold text-red-600 dark:text-red-400'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {overdue ? (
                                                    <AlertCircle className="h-3 w-3" />
                                                ) : (
                                                    <CalendarClock className="h-3 w-3" />
                                                )}
                                                {overdue
                                                    ? `Overdue by ${days} day${days === 1 ? '' : 's'} — was due ${formatDate(lead.nextFollowUpAt)}`
                                                    : `Due ${formatDate(lead.nextFollowUpAt)}`}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setLogLead(lead)
                                                }
                                            >
                                                <StickyNote className="mr-1 h-4 w-4" />
                                                Log activity
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setRescheduleLead(lead)
                                                }
                                            >
                                                <Pencil className="mr-1 h-4 w-4" />
                                                Reschedule
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </PageWrapper>

            <LogActivityDialog
                lead={logLead}
                open={!!logLead}
                onOpenChange={(open) => {
                    if (!open) setLogLead(null);
                }}
                onLogged={load}
            />
            <RescheduleDialog
                lead={rescheduleLead}
                open={!!rescheduleLead}
                onOpenChange={(open) => {
                    if (!open) setRescheduleLead(null);
                }}
                onSaved={load}
            />
        </>
    );
}
