'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    Copy,
    FileText,
    Pencil,
    Plus,
    Receipt,
    Send,
} from 'lucide-react';
import {
    addLeadActivity,
    convertLead,
    generateContract,
    generateInvoice,
    getLead,
    getSubscriptionPlans,
    updateLead,
    type CrmActivity,
    type CrmDocument,
    type CrmLead,
    type InvoiceLineItem,
    type SubscriptionPlan,
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
import { axiosGet } from '@/app/lib/api';
import {
    ACTIVITY_BADGE,
    CRM_STAGES,
    canTransitionLead,
    formatDate,
    formatDateTime,
    formatMoney,
    isOverdue,
    normalizeStatus,
    stageBadgeClass,
    stageLabel,
    BUSINESS_TYPE_OPTIONS,
    LEAD_SOURCE_OPTIONS,
} from '@/components/admin/crm/crm-shared';

const ACTIVITY_TYPES = [
    { value: 'NOTE', label: 'Note' },
    { value: 'CALL', label: 'Call' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'MEETING', label: 'Meeting' },
];

async function downloadCrmDocument(
    documentId: string | number,
    fileName?: string,
) {
    // Fetch the PDF through the /be-api proxy — the axios interceptor injects
    // the super-admin JWT from localStorage, so the token never leaves an
    // authenticated request — then trigger a client-side file download.
    const blob = await axiosGet<Blob>(
        `/super-admin/crm/documents/${documentId}/download`,
        {
            config: { responseType: 'blob' },
            currentPath: '/dashboard/crm',
        },
    );
    if (!blob) {
        throw new Error('The document download came back empty.');
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName || `anli-document-${documentId}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function EditLeadDialog({
    lead,
    open,
    onOpenChange,
    onSaved,
}: {
    lead: CrmLead;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}) {
    const [form, setForm] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setForm({
                contactName: lead.contactName ?? '',
                companyName: lead.companyName ?? '',
                email: lead.email ?? '',
                phone: lead.phone ?? '',
                source: lead.source ?? '',
                businessType: lead.businessType ?? '',
                estimatedValue:
                    lead.estimatedValue === undefined ||
                    lead.estimatedValue === null
                        ? ''
                        : String(lead.estimatedValue),
                currency: lead.currency ?? 'NGN',
                address: lead.address ?? '',
                city: lead.city ?? '',
                state: lead.state ?? '',
                country: lead.country ?? '',
                cacNumber: lead.cacNumber ?? '',
                taxId: lead.taxId ?? '',
                notes: lead.notes ?? '',
            });
            setError(null);
        }
    }, [open, lead]);

    const set = (key: string) => (value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async () => {
        if (!form.contactName.trim() || !form.companyName.trim()) {
            setError('Contact name and company name are required.');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            await updateLead(lead.id, {
                contactName: form.contactName.trim(),
                companyName: form.companyName.trim(),
                email: form.email || undefined,
                phone: form.phone || undefined,
                source: form.source || undefined,
                businessType: form.businessType || undefined,
                estimatedValue: form.estimatedValue
                    ? Number(form.estimatedValue)
                    : undefined,
                currency: form.currency || undefined,
                address: form.address || undefined,
                city: form.city || undefined,
                state: form.state || undefined,
                country: form.country || undefined,
                cacNumber: form.cacNumber || undefined,
                taxId: form.taxId || undefined,
                notes: form.notes || undefined,
            });
            toast.success('Lead updated.');
            onOpenChange(false);
            onSaved();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to update lead. Please try again.',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit lead</DialogTitle>
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
                            id="edit-contact"
                            name="contactName"
                            label="Contact name"
                            required
                            value={form.contactName ?? ''}
                            onChange={(e) => set('contactName')(e.target.value)}
                        />
                        <InputField
                            id="edit-company"
                            name="companyName"
                            label="Company / hotel name"
                            required
                            value={form.companyName ?? ''}
                            onChange={(e) => set('companyName')(e.target.value)}
                        />
                        <InputField
                            id="edit-email"
                            name="email"
                            label="Email"
                            type="email"
                            value={form.email ?? ''}
                            onChange={(e) => set('email')(e.target.value)}
                        />
                        <InputField
                            id="edit-phone"
                            name="phone"
                            label="Phone"
                            type="tel"
                            value={form.phone ?? ''}
                            onChange={(e) => set('phone')(e.target.value)}
                        />
                        <SelectField
                            id="edit-source"
                            name="source"
                            label="Source"
                            value={form.source ?? ''}
                            onValueChange={set('source')}
                            options={LEAD_SOURCE_OPTIONS}
                            placeholder="Select source"
                        />
                        <SelectField
                            id="edit-business-type"
                            name="businessType"
                            label="Business type"
                            value={form.businessType ?? ''}
                            onValueChange={set('businessType')}
                            options={BUSINESS_TYPE_OPTIONS}
                            placeholder="Select business type"
                        />
                        <InputField
                            id="edit-value"
                            name="estimatedValue"
                            label="Estimated value"
                            type="number"
                            min="0"
                            value={form.estimatedValue ?? ''}
                            onChange={(e) =>
                                set('estimatedValue')(e.target.value)
                            }
                        />
                        <InputField
                            id="edit-currency"
                            name="currency"
                            label="Currency"
                            value={form.currency ?? ''}
                            onChange={(e) => set('currency')(e.target.value)}
                        />
                        <InputField
                            id="edit-address"
                            name="address"
                            label="Address"
                            value={form.address ?? ''}
                            onChange={(e) => set('address')(e.target.value)}
                        />
                        <InputField
                            id="edit-city"
                            name="city"
                            label="City"
                            value={form.city ?? ''}
                            onChange={(e) => set('city')(e.target.value)}
                        />
                        <InputField
                            id="edit-state"
                            name="state"
                            label="State"
                            value={form.state ?? ''}
                            onChange={(e) => set('state')(e.target.value)}
                        />
                        <InputField
                            id="edit-country"
                            name="country"
                            label="Country"
                            value={form.country ?? ''}
                            onChange={(e) => set('country')(e.target.value)}
                        />
                        <InputField
                            id="edit-cac"
                            name="cacNumber"
                            label="CAC number"
                            value={form.cacNumber ?? ''}
                            onChange={(e) => set('cacNumber')(e.target.value)}
                        />
                        <InputField
                            id="edit-tax"
                            name="taxId"
                            label="Tax ID"
                            value={form.taxId ?? ''}
                            onChange={(e) => set('taxId')(e.target.value)}
                        />
                    </div>
                    <TextAreaField
                        id="edit-notes"
                        name="notes"
                        label="Notes"
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
                            {saving ? 'Saving…' : 'Save changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InvoiceDialog({
    lead,
    open,
    onOpenChange,
    onGenerated,
}: {
    lead: CrmLead;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerated: () => void;
}) {
    const defaultItems: InvoiceLineItem[] = [
        {
            description: `Anli subscription — ${lead.companyName}`,
            qty: 1,
            unitPrice:
                lead.estimatedValue !== undefined &&
                lead.estimatedValue !== null
                    ? Number(lead.estimatedValue)
                    : 0,
        },
    ];
    const [items, setItems] = useState<InvoiceLineItem[]>(defaultItems);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (open) {
            setItems(defaultItems);
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const updateItem = (
        index: number,
        key: keyof InvoiceLineItem,
        value: string,
    ) =>
        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          [key]:
                              key === 'description'
                                  ? value
                                  : Number(value) || 0,
                      }
                    : item,
            ),
        );

    const total = items.reduce(
        (sum, item) => sum + item.qty * item.unitPrice,
        0,
    );

    const handleGenerate = async () => {
        const clean = items.filter((i) => i.description.trim());
        if (clean.length === 0) {
            setError('Add at least one line item with a description.');
            return;
        }
        setError(null);
        setGenerating(true);
        try {
            const doc = await generateInvoice(lead.id, clean);
            toast.success('Invoice generated.');
            onOpenChange(false);
            onGenerated();
            try {
                await downloadCrmDocument(
                    doc.documentId,
                    `invoice-${lead.id}.pdf`,
                );
            } catch (downloadErr) {
                toast.error(
                    downloadErr instanceof Error
                        ? downloadErr.message
                        : 'Invoice generated, but the download failed.',
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to generate invoice.',
            );
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Generate invoice</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Anli-branded PDF invoice for {lead.companyName}.
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
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-12 items-end gap-2 rounded-lg border border-border p-3"
                        >
                            <div className="col-span-12 sm:col-span-6">
                                <InputField
                                    id={`inv-desc-${index}`}
                                    name={`description-${index}`}
                                    label="Description"
                                    value={item.description}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="col-span-4 sm:col-span-2">
                                <InputField
                                    id={`inv-qty-${index}`}
                                    name={`qty-${index}`}
                                    label="Qty"
                                    type="number"
                                    min="1"
                                    value={String(item.qty)}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'qty',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="col-span-8 sm:col-span-4">
                                <InputField
                                    id={`inv-price-${index}`}
                                    name={`unitPrice-${index}`}
                                    label="Unit price"
                                    type="number"
                                    min="0"
                                    value={String(item.unitPrice)}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'unitPrice',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setItems((prev) => [
                                ...prev,
                                { description: '', qty: 1, unitPrice: 0 },
                            ])
                        }
                    >
                        <Plus className="mr-1 h-4 w-4" /> Add line
                    </Button>
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm font-bold">
                            {formatMoney(total, lead.currency)}
                        </span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={generating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? 'Generating…' : 'Generate & download'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ConvertDialog({
    lead,
    open,
    onOpenChange,
    onConverted,
}: {
    lead: CrmLead;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConverted: (result: {
        hotelId: string | number;
        requiresPasswordReset: boolean;
    }) => void;
}) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [planId, setPlanId] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [missing, setMissing] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        if (open) {
            setPhone(lead.phone ?? '');
            setAddress(lead.address ?? '');
            setState(lead.state ?? '');
            setCountry(lead.country ?? '');
            setPlanId('');
            setMissing([]);
            setError(null);
            setPlansLoading(true);
            getSubscriptionPlans()
                .then(setPlans)
                .catch((err) =>
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to load subscription plans.',
                    ),
                )
                .finally(() => setPlansLoading(false));
        }
    }, [open, lead]);

    const fieldError = (name: string) =>
        missing.includes(name)
            ? 'This field is required to provision the hotel.'
            : undefined;

    const handleConvert = async () => {
        if (!planId) {
            setError('Pick a subscription plan for the new hotel.');
            return;
        }
        setError(null);
        setMissing([]);
        setConverting(true);
        try {
            const result = await convertLead(lead.id, {
                planId: Number(planId),
                phoneNumber: phone || undefined,
                address: address || undefined,
                state: state || undefined,
                country: country || undefined,
            });
            toast.success('Lead converted to client.');
            onOpenChange(false);
            onConverted(result);
        } catch (err) {
            const missingFields =
                err instanceof Error &&
                'missing' in err &&
                Array.isArray(
                    (err as Error & { missing?: unknown }).missing,
                )
                    ? ((err as Error & { missing?: string[] }).missing ??
                      [])
                    : [];
            if (missingFields.length > 0) {
                setMissing(missingFields);
                setError(
                    'The backend needs a few more fields before it can provision the hotel.',
                );
            } else {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to convert lead.',
                );
            }
        } finally {
            setConverting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Convert to client</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        This provisions a real hotel account for{' '}
                        <span className="font-medium">{lead.companyName}</span>{' '}
                        on the plan you pick.
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
                    <SelectField
                        id="convert-plan"
                        name="planId"
                        label="Subscription plan"
                        required
                        value={planId}
                        onValueChange={setPlanId}
                        placeholder={
                            plansLoading ? 'Loading plans…' : 'Select a plan'
                        }
                        options={plans.map((plan) => ({
                            value: String(plan.id),
                            label: `${plan.name} — ${formatMoney(plan.price, lead.currency)}`,
                        }))}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <InputField
                                id="convert-phone"
                                name="phoneNumber"
                                label="Phone number"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            {fieldError('phoneNumber') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {fieldError('phoneNumber')}
                                </p>
                            )}
                        </div>
                        <div>
                            <InputField
                                id="convert-address"
                                name="address"
                                label="Address"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            {fieldError('address') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {fieldError('address')}
                                </p>
                            )}
                        </div>
                        <div>
                            <InputField
                                id="convert-state"
                                name="state"
                                label="State"
                                required
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            />
                            {fieldError('state') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {fieldError('state')}
                                </p>
                            )}
                        </div>
                        <div>
                            <InputField
                                id="convert-country"
                                name="country"
                                label="Country"
                                required
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                            {fieldError('country') && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                    {fieldError('country')}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={converting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConvert}
                            disabled={converting}
                        >
                            {converting ? 'Converting…' : 'Convert to client'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ConvertedSuccess({
    result,
    onClose,
}: {
    result: { hotelId: string | number; requiresPasswordReset: boolean };
    onClose: () => void;
}) {
    const copyHotelId = async () => {
        try {
            await navigator.clipboard.writeText(String(result.hotelId));
            toast.success('Hotel ID copied.');
        } catch {
            toast.error('Could not copy — select the ID manually.');
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Client created
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            New hotel ID
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                            <code className="text-lg font-bold">
                                {String(result.hotelId)}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyHotelId}
                            >
                                <Copy className="mr-1 h-4 w-4" /> Copy
                            </Button>
                        </div>
                    </div>
                    {result.requiresPasswordReset && (
                        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            The owner must set their password via the password
                            reset flow before they can sign in.
                        </p>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Done
                        </Button>
                        {/* Businesses directory in the admin app. */}
                        <Button type="button" asChild>
                            <Link href="/business-list">View hotel</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-0.5 text-sm font-medium">{value || '—'}</p>
        </div>
    );
}

export default function LeadDetailPage() {
    const params = useParams();
    const id = params?.id as string | undefined;

    const [lead, setLead] = useState<CrmLead | null>(null);
    const [activities, setActivities] = useState<CrmActivity[]>([]);
    const [documents, setDocuments] = useState<CrmDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [invoiceOpen, setInvoiceOpen] = useState(false);
    const [convertOpen, setConvertOpen] = useState(false);
    const [converted, setConverted] = useState<{
        hotelId: string | number;
        requiresPasswordReset: boolean;
    } | null>(null);
    const [generatingContract, setGeneratingContract] = useState(false);

    const [activityType, setActivityType] = useState('NOTE');
    const [activityBody, setActivityBody] = useState('');
    const [loggingActivity, setLoggingActivity] = useState(false);

    const [followUpDate, setFollowUpDate] = useState('');
    const [savingFollowUp, setSavingFollowUp] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const detail = await getLead(id);
            setLead(detail.lead);
            setActivities(detail.activities);
            setDocuments(detail.documents);
            setFollowUpDate(
                detail.lead.nextFollowUpAt
                    ? detail.lead.nextFollowUpAt.slice(0, 10)
                    : '',
            );
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to load lead.',
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const handleStatusChange = async (status: string) => {
        if (!lead) return;
        // Fail fast on disallowed transitions (mirrors backend ALLOWED_LEAD_TRANSITIONS).
        if (!canTransitionLead(lead.status, status)) {
            toast.error(
                `Cannot move lead from ${stageLabel(lead.status)} to ${stageLabel(status)}.`,
            );
            return;
        }
        try {
            await updateLead(lead.id, { status });
            toast.success(`Status changed to ${stageLabel(status)}.`);
            await load();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to update status.',
            );
        }
    };

    const handleSaveFollowUp = async () => {
        if (!lead) return;
        setSavingFollowUp(true);
        try {
            await updateLead(lead.id, {
                nextFollowUpAt: followUpDate || null,
            });
            toast.success(
                followUpDate
                    ? 'Follow-up scheduled.'
                    : 'Follow-up cleared.',
            );
            await load();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Failed to save follow-up.',
            );
        } finally {
            setSavingFollowUp(false);
        }
    };

    const handleLogActivity = async () => {
        if (!lead || !activityBody.trim()) {
            toast.error('Write something before logging the activity.');
            return;
        }
        setLoggingActivity(true);
        try {
            await addLeadActivity(lead.id, {
                type: activityType as 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING',
                body: activityBody.trim(),
            });
            toast.success('Activity logged.');
            setActivityBody('');
            await load();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Failed to log activity.',
            );
        } finally {
            setLoggingActivity(false);
        }
    };

    const handleGenerateContract = async () => {
        if (!lead) return;
        setGeneratingContract(true);
        try {
            const doc = await generateContract(lead.id);
            toast.success('Contract generated.');
            await load();
            try {
                await downloadCrmDocument(
                    doc.documentId,
                    `contract-${lead.id}.pdf`,
                );
            } catch (downloadErr) {
                toast.error(
                    downloadErr instanceof Error
                        ? downloadErr.message
                        : 'Contract generated, but the download failed.',
                );
            }
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : 'Failed to generate contract.',
            );
        } finally {
            setGeneratingContract(false);
        }
    };

    if (!lead) {
        return (
            <PageWrapper>
                <Card>
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                        Lead not found.
                        <div className="mt-4">
                            <Button asChild variant="outline">
                                <Link href="/dashboard/crm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to pipeline
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PageWrapper>
        );
    }

    const overdue = isOverdue(lead.nextFollowUpAt);

    return (
        <>
            <PageHeader>
                <PageHeadertitle
                    title={lead.companyName}
                    subtitle={`${lead.contactName} • added ${formatDate(lead.createdAt)}`}
                    hasBack
                />
                <HeaderActions>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Badge
                                    className={stageBadgeClass(lead.status)}
                                >
                                    {stageLabel(lead.status)}
                                </Badge>
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {CRM_STAGES.filter(
                                (s) => s.value !== normalizeStatus(lead.status),
                            ).map((stage) => (
                                <DropdownMenuItem
                                    key={stage.value}
                                    onClick={() =>
                                        handleStatusChange(stage.value)
                                    }
                                >
                                    {stage.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </HeaderActions>
            </PageHeader>

            <PageWrapper>
                {/* Actions row */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={handleGenerateContract}
                        disabled={generatingContract}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        {generatingContract
                            ? 'Generating…'
                            : 'Generate contract'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setInvoiceOpen(true)}
                    >
                        <Receipt className="mr-2 h-4 w-4" />
                        Generate invoice
                    </Button>
                    <div className="flex items-center gap-2">
                        <InputField
                            id="lead-followup-date"
                            name="nextFollowUpAt"
                            label=""
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-44"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveFollowUp}
                            disabled={savingFollowUp}
                        >
                            <CalendarClock className="mr-1 h-4 w-4" />
                            {savingFollowUp ? 'Saving…' : 'Set follow-up'}
                        </Button>
                    </div>
                    {!lead.convertedHotelId ? (
                        <Button onClick={() => setConvertOpen(true)}>
                            Convert to client
                        </Button>
                    ) : (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            Converted — hotel {String(lead.convertedHotelId)}
                        </Badge>
                    )}
                </div>

                {overdue && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        Follow-up overdue since{' '}
                        {formatDate(lead.nextFollowUpAt)}.
                    </p>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Lead details */}
                    <Card className="lg:col-span-2">
                        <CardContent className="space-y-5 p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Lead details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <Field
                                    label="Contact"
                                    value={lead.contactName}
                                />
                                <Field label="Email" value={lead.email} />
                                <Field label="Phone" value={lead.phone} />
                                <Field label="Source" value={lead.source} />
                                <Field
                                    label="Business type"
                                    value={lead.businessType}
                                />
                                <Field
                                    label="Estimated value"
                                    value={formatMoney(
                                        lead.estimatedValue,
                                        lead.currency,
                                    )}
                                />
                                <Field label="Owner" value={lead.ownerName} />
                                <Field
                                    label="Status changed"
                                    value={formatDateTime(
                                        lead.statusChangedAt,
                                    )}
                                />
                                <Field
                                    label="Last contacted"
                                    value={formatDateTime(
                                        lead.lastContactedAt,
                                    )}
                                />
                                <Field label="Address" value={lead.address} />
                                <Field label="City" value={lead.city} />
                                <Field label="State" value={lead.state} />
                                <Field label="Country" value={lead.country} />
                                <Field
                                    label="CAC number"
                                    value={lead.cacNumber}
                                />
                                <Field label="Tax ID" value={lead.taxId} />
                            </div>
                            {lead.notes && (
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                        Notes
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-sm">
                                        {lead.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardContent className="space-y-3 p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                Documents
                            </h3>
                            {documents.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No contracts or invoices yet.
                                </p>
                            )}
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
                                >
                                    <div className="min-w-0">
                                        <Badge
                                            className={
                                                doc.kind === 'contract'
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                                            }
                                        >
                                            {String(doc.kind).toUpperCase()}
                                        </Badge>
                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            {doc.fileName ??
                                                `document-${doc.id}.pdf`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(doc.createdAt)}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                await downloadCrmDocument(
                                                    doc.id,
                                                    doc.fileName,
                                                );
                                            } catch (downloadErr) {
                                                toast.error(
                                                    downloadErr instanceof
                                                        Error
                                                        ? downloadErr.message
                                                        : 'Failed to download document.',
                                                );
                                            }
                                        }}
                                    >
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Activity timeline */}
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Activity timeline
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
                            <SelectField
                                id="activity-type"
                                name="type"
                                label="Type"
                                value={activityType}
                                onValueChange={setActivityType}
                                options={ACTIVITY_TYPES}
                            />
                            <TextAreaField
                                id="activity-body"
                                name="body"
                                label="Log activity"
                                placeholder="Note, call summary, email recap…"
                                rows={2}
                                value={activityBody}
                                onChange={(e) =>
                                    setActivityBody(e.target.value)
                                }
                            />
                            <Button
                                type="button"
                                onClick={handleLogActivity}
                                disabled={loggingActivity}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {loggingActivity ? 'Logging…' : 'Log'}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {activities.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No activity yet — log the first touch.
                                </p>
                            )}
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex gap-3 rounded-lg border border-border p-3"
                                >
                                    <Badge
                                        className={
                                            ACTIVITY_BADGE[
                                                String(
                                                    activity.type,
                                                ).toUpperCase()
                                            ] ??
                                            'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300'
                                        }
                                    >
                                        {String(activity.type)}
                                    </Badge>
                                    <div className="min-w-0 flex-1">
                                        <p className="whitespace-pre-line text-sm">
                                            {activity.body}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {activity.createdByName
                                                ? `${activity.createdByName} • `
                                                : ''}
                                            {formatDateTime(
                                                activity.createdAt,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </PageWrapper>

            <EditLeadDialog
                lead={lead}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSaved={load}
            />
            <InvoiceDialog
                lead={lead}
                open={invoiceOpen}
                onOpenChange={setInvoiceOpen}
                onGenerated={load}
            />
            <ConvertDialog
                lead={lead}
                open={convertOpen}
                onOpenChange={setConvertOpen}
                onConverted={(result) => {
                    setConverted(result);
                    load();
                }}
            />
            {converted && (
                <ConvertedSuccess
                    result={converted}
                    onClose={() => setConverted(null)}
                />
            )}
        </>
    );
}
