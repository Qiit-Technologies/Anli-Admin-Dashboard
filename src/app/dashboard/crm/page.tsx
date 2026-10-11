'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    AlertCircle,
    CalendarClock,
    ChevronDown,
    Download,
    Plus,
    Search,
    User,
} from 'lucide-react';
import {
    createLead,
    getLeads,
    getPipelineCounts,
    importDemoRequests,
    updateLead,
    type CrmLead,
    type CreateLeadInput,
} from '@/app/actions/crm';
import PageWrapper from '@/components/common/PageWrapper';
import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import {
    InputField,
    SelectField,
    TextAreaField,
} from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import {
    BUSINESS_TYPE_OPTIONS,
    CRM_STAGES,
    LEAD_SOURCE_OPTIONS,
    canTransitionLead,
    formatDate,
    formatMoney,
    isOverdue,
    normalizeStatus,
    stageBadgeClass,
    stageLabel,
} from '@/components/admin/crm/crm-shared';


const EMPTY_LEAD_FORM: CreateLeadInput = {
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    source: '',
    nextFollowUpAt: '',
    estimatedValue: undefined,
    currency: 'NGN',
    businessType: '',
    address: '',
    city: '',
    state: '',
    country: '',
    cacNumber: '',
    taxId: '',
    notes: '',
};

function NewLeadDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
}) {
    const [form, setForm] = useState<CreateLeadInput>(EMPTY_LEAD_FORM);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof CreateLeadInput) => (value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const reset = () => {
        setForm(EMPTY_LEAD_FORM);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!form.contactName.trim() || !form.companyName.trim()) {
            setError('Contact name and company name are required.');
            return;
        }
        if (
            !form.email.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        ) {
            setError('A valid email address is required.');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            // Send exactly what the backend contract accepts: email is
            // required; source/businessType must be valid enum values or
            // omitted entirely ('' fails @IsEnum, lowercase fails too).
            const payload: CreateLeadInput = {
                contactName: form.contactName.trim(),
                companyName: form.companyName.trim(),
                email: form.email.trim(),
                ...(form.phone?.trim()
                    ? { phone: form.phone.trim() }
                    : {}),
                ...(form.source ? { source: form.source } : {}),
                ...(form.businessType ? { businessType: form.businessType } : {}),
                ...(form.estimatedValue
                    ? { estimatedValue: Number(form.estimatedValue) }
                    : {}),
                ...(form.currency ? { currency: form.currency } : {}),
                ...(form.address?.trim()
                    ? { address: form.address.trim() }
                    : {}),
                ...(form.city?.trim() ? { city: form.city.trim() } : {}),
                ...(form.state?.trim() ? { state: form.state.trim() } : {}),
                ...(form.country?.trim()
                    ? { country: form.country.trim() }
                    : {}),
                ...(form.cacNumber?.trim()
                    ? { cacNumber: form.cacNumber.trim() }
                    : {}),
                ...(form.taxId?.trim() ? { taxId: form.taxId.trim() } : {}),
                ...(form.nextFollowUpAt
                    ? { nextFollowUpAt: form.nextFollowUpAt }
                    : {}),
                ...(form.notes?.trim() ? { notes: form.notes.trim() } : {}),
            };
            await createLead(payload);
            toast.success('Lead created.');
            reset();
            onOpenChange(false);
            onCreated();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create lead. Please try again.',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset();
                onOpenChange(next);
            }}
        >
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New lead</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Add a prospect to the sales pipeline.
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {error && (
                        <p
                            role="alert"
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                        >
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                            id="lead-contact"
                            name="contactName"
                            label="Contact name"
                            required
                            placeholder="e.g. Adaeze Okonkwo"
                            value={form.contactName}
                            onChange={(e) => set('contactName')(e.target.value)}
                        />
                        <InputField
                            id="lead-company"
                            name="companyName"
                            label="Company / hotel name"
                            required
                            placeholder="e.g. Grand Palm Hotel"
                            value={form.companyName}
                            onChange={(e) => set('companyName')(e.target.value)}
                        />
                        <InputField
                            id="lead-email"
                            name="email"
                            label="Email"
                            type="email"
                            required
                            placeholder="contact@hotel.com"
                            value={form.email ?? ''}
                            onChange={(e) => set('email')(e.target.value)}
                        />
                        <InputField
                            id="lead-phone"
                            name="phone"
                            label="Phone"
                            type="tel"
                            placeholder="+234 ..."
                            value={form.phone ?? ''}
                            onChange={(e) => set('phone')(e.target.value)}
                        />
                        <SelectField
                            id="lead-source"
                            name="source"
                            label="Source"
                            value={form.source ?? ''}
                            onValueChange={set('source')}
                            options={LEAD_SOURCE_OPTIONS}
                            placeholder="Select source"
                        />
                        <SelectField
                            id="lead-business-type"
                            name="businessType"
                            label="Business type"
                            value={form.businessType ?? ''}
                            onValueChange={set('businessType')}
                            options={BUSINESS_TYPE_OPTIONS}
                            placeholder="Select business type"
                        />
                        <InputField
                            id="lead-value"
                            name="estimatedValue"
                            label="Estimated value"
                            type="number"
                            min="0"
                            placeholder="e.g. 240000"
                            value={
                                form.estimatedValue === undefined
                                    ? ''
                                    : String(form.estimatedValue)
                            }
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    estimatedValue: e.target.value
                                        ? Number(e.target.value)
                                        : undefined,
                                }))
                            }
                        />
                        <SelectField
                            id="lead-currency"
                            name="currency"
                            label="Currency"
                            value={form.currency ?? 'NGN'}
                            onValueChange={set('currency')}
                            options={[
                                { value: 'NGN', label: 'NGN — Naira' },
                                { value: 'USD', label: 'USD — Dollar' },
                                { value: 'EUR', label: 'EUR — Euro' },
                                { value: 'GBP', label: 'GBP — Pound' },
                            ]}
                        />
                        <InputField
                            id="lead-address"
                            name="address"
                            label="Address"
                            placeholder="Street address"
                            value={form.address ?? ''}
                            onChange={(e) => set('address')(e.target.value)}
                        />
                        <InputField
                            id="lead-city"
                            name="city"
                            label="City"
                            placeholder="e.g. Lagos"
                            value={form.city ?? ''}
                            onChange={(e) => set('city')(e.target.value)}
                        />
                        <InputField
                            id="lead-state"
                            name="state"
                            label="State"
                            placeholder="e.g. Lagos State"
                            value={form.state ?? ''}
                            onChange={(e) => set('state')(e.target.value)}
                        />
                        <InputField
                            id="lead-country"
                            name="country"
                            label="Country"
                            placeholder="e.g. Nigeria"
                            value={form.country ?? ''}
                            onChange={(e) => set('country')(e.target.value)}
                        />
                        <InputField
                            id="lead-cac"
                            name="cacNumber"
                            label="CAC number"
                            placeholder="RC…"
                            value={form.cacNumber ?? ''}
                            onChange={(e) => set('cacNumber')(e.target.value)}
                        />
                        <InputField
                            id="lead-tax"
                            name="taxId"
                            label="Tax ID"
                            placeholder="TIN…"
                            value={form.taxId ?? ''}
                            onChange={(e) => set('taxId')(e.target.value)}
                        />
                        <InputField
                            id="lead-followup"
                            name="nextFollowUpAt"
                            label="Next follow-up"
                            type="date"
                            value={form.nextFollowUpAt ?? ''}
                            onChange={(e) =>
                                set('nextFollowUpAt')(e.target.value)
                            }
                        />
                    </div>

                    <TextAreaField
                        id="lead-notes"
                        name="notes"
                        label="Notes"
                        placeholder="Anything worth remembering about this lead…"
                        rows={3}
                        value={form.notes ?? ''}
                        onChange={(e) => set('notes')(e.target.value)}
                    />

                    <div className="flex justify-end gap-2 pt-1">
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
                            {saving ? 'Creating…' : 'Create lead'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function LeadCard({
    lead,
    onMove,
    moving,
}: {
    lead: CrmLead;
    onMove: (lead: CrmLead, status: string) => void;
    moving: boolean;
}) {
    const overdue = isOverdue(lead.nextFollowUpAt);
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                    <Link
                        href={`/dashboard/crm/leads/${lead.id}`}
                        className="min-w-0"
                    >
                        <p className="truncate text-sm font-semibold hover:underline">
                            {lead.companyName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {lead.contactName}
                        </p>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 shrink-0 px-2 text-xs"
                                disabled={moving}
                            >
                                Move to
                                <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {CRM_STAGES.filter(
                                (s) => s.value !== normalizeStatus(lead.status),
                            ).map((stage) => (
                                <DropdownMenuItem
                                    key={stage.value}
                                    onClick={() => onMove(lead, stage.value)}
                                >
                                    {stage.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                    >
                        {formatMoney(lead.estimatedValue, lead.currency)}
                    </Badge>
                    {lead.ownerName && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {lead.ownerName}
                        </span>
                    )}
                </div>

                {lead.nextFollowUpAt && (
                    <p
                        className={`inline-flex items-center gap-1 text-xs ${
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
                        {overdue ? 'Overdue: ' : 'Follow up: '}
                        {formatDate(lead.nextFollowUpAt)}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function CrmPipelinePage() {
    const [leads, setLeads] = useState<CrmLead[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [movingId, setMovingId] = useState<string | number | null>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [importing, setImporting] = useState(false);
    const [newLeadOpen, setNewLeadOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [leadsRes, pipelineRes] = await Promise.all([
                getLeads({
                    search: debouncedSearch || undefined,
                    ownerId: ownerFilter || undefined,
                    limit: 200,
                }),
                getPipelineCounts(),
            ]);
            setLeads(leadsRes.leads);
            setCounts(pipelineRes);
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to load pipeline.',
            );
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, ownerFilter]);

    useEffect(() => {
        load();
    }, [load]);

    const leadsByStage = useMemo(() => {
        const grouped: Record<string, CrmLead[]> = {};
        for (const stage of CRM_STAGES) grouped[stage.value] = [];
        for (const lead of leads) {
            const key = normalizeStatus(lead.status);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(lead);
        }
        return grouped;
    }, [leads]);

    const handleMove = async (lead: CrmLead, status: string) => {
        // Fail fast on disallowed transitions (mirrors backend ALLOWED_LEAD_TRANSITIONS)
        // so users get a clear message instead of an API round-trip.
        if (!canTransitionLead(lead.status, status)) {
            toast.error(
                `Cannot move lead from ${stageLabel(lead.status)} to ${stageLabel(status)}.`,
            );
            return;
        }
        setMovingId(lead.id);
        try {
            await updateLead(lead.id, { status });
            toast.success(
                `${lead.companyName} moved to ${stageLabel(status)}.`,
            );
            await load();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to move lead.',
            );
        } finally {
            setMovingId(null);
        }
    };

    const handleImportDemoRequests = async () => {
        setImporting(true);
        try {
            const result = await importDemoRequests();
            toast.success(result.message);
            await load();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Failed to import demo requests.',
            );
        } finally {
            setImporting(false);
        }
    };

    return (
        <>
            <PageHeader>
                <PageHeadertitle
                    title="CRM"
                    subtitle="Sales pipeline — leads, follow-ups and conversions"
                />
                <HeaderActions>
                    <Button
                        variant="outline"
                        onClick={handleImportDemoRequests}
                        disabled={importing}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {importing ? 'Importing…' : 'Import demo requests'}
                    </Button>
                    <Button onClick={() => setNewLeadOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New lead
                    </Button>
                </HeaderActions>
            </PageHeader>

            <PageWrapper>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search company, contact or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="relative w-full sm:w-56">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Filter by owner…"
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/crm/follow-ups">
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Follow-ups
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {CRM_STAGES.map((stage) => (
                            <Skeleton
                                key={stage.value}
                                className="h-64 w-[280px] shrink-0"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {CRM_STAGES.map((stage) => {
                            const stageLeads = leadsByStage[stage.value] ?? [];
                            const count = counts[stage.value] ?? stageLeads.length;
                            return (
                                <section
                                    key={stage.value}
                                    className="flex w-[280px] shrink-0 flex-col gap-3"
                                    aria-label={`${stage.label} column`}
                                >
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
                                        <Badge
                                            className={stageBadgeClass(
                                                stage.value,
                                            )}
                                        >
                                            {stage.label}
                                        </Badge>
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {count}
                                        </span>
                                    </div>
                                    <div className="flex max-h-[70vh] flex-col gap-2 overflow-y-auto pr-1">
                                        {stageLeads.map((lead) => (
                                            <LeadCard
                                                key={lead.id}
                                                lead={lead}
                                                onMove={handleMove}
                                                moving={movingId === lead.id}
                                            />
                                        ))}
                                        {stageLeads.length === 0 && (
                                            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                                                No leads
                                            </p>
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </PageWrapper>

            <NewLeadDialog
                open={newLeadOpen}
                onOpenChange={setNewLeadOpen}
                onCreated={load}
            />
        </>
    );
}
