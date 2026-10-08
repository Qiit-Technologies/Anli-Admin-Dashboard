'use client';

import {
    getReservationConfirmationSettings,
    updateReservationConfirmationSettings,
} from '@/app/actions/hotel';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Default Terms & Conditions used by the platform when a hotel does not
 * provide its own override. Mirrors the wording in:
 *  - orion-backend/src/emails/guests/hotel-reservation-confirmation.email.ts
 *  - orion-frontend/src/components/front-office/common/Card/reservation-print-template.tsx
 *
 * Kept here as plain HTML so the admin UI can offer it as a starting
 * template ("Use the default") without having to fetch from the server.
 */
const DEFAULT_TERMS_HTML = `<p><strong>Rates and charges.</strong> Published rates may exclude applicable taxes, statutory levies (including tourism or other local levies where required), and service charges, unless the rate explicitly states they are included.</p>
<p><strong>Payment, deposit, and guarantee.</strong> The hotel may require advance payment, a deposit, or a valid card guarantee according to your booking. Any balance remains payable at check-in or check-out as communicated by the property.</p>
<p><strong>Vouchers and third-party bookings.</strong> Reservations made with vouchers, travel partners, or corporate accounts may require presentation of the original voucher, confirmation, or authorization at check-in.</p>
<p><strong>Identification.</strong> Guests may be required to present valid government-issued photo identification at check-in in accordance with applicable law.</p>
<p><strong>Cancellation, amendment, and no-show.</strong> Changes, cancellations, and failure to arrive are governed by the rate plan and policy in effect at the time of booking. Contact the hotel directly for assistance.</p>`;

/**
 * Strip the same dangerous bits the render-time sanitisers strip. Keeps the
 * preview honest about what the guest will actually see in print/PDF/email.
 */
function sanitizePreview(html: string): string {
    return html
        .replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replaceAll(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replaceAll(/\son\w+\s*=\s*"[^"]*"/gi, '')
        .replaceAll(/\son\w+\s*=\s*'[^']*'/gi, '');
}

export default function ReservationConfirmationTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [terms, setTerms] = useState<string>('');
    const [savedTerms, setSavedTerms] = useState<string>('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const isUsingOverride = savedTerms.trim().length > 0;
    const isDirty = useMemo(
        () => terms !== savedTerms,
        [terms, savedTerms],
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            const result = await getReservationConfirmationSettings();
            if (cancelled) return;
            if ('error' in result) {
                setError(result.error);
            } else {
                const value = result.data.reservationTermsHtml ?? '';
                setSavedTerms(value);
                setTerms(value);
            }
            setLoading(false);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const trimmed = terms.trim();
        const payload = {
            reservationTermsHtml: trimmed.length > 0 ? trimmed : null,
        };
        const result = await updateReservationConfirmationSettings(payload);
        setSaving(false);

        if ('error' in result) {
            toast.custom(() => (
                <Toast
                    title="Couldn't save"
                    description={result.error}
                    type="error"
                />
            ));
            return;
        }
        const value = result.data.reservationTermsHtml ?? '';
        setSavedTerms(value);
        setTerms(value);
        toast.custom(() => (
            <Toast
                title="Saved"
                description={
                    value
                        ? 'Custom Terms & Conditions are now used on confirmations.'
                        : 'Override cleared. Confirmations now use the default terms.'
                }
                type="success"
            />
        ));
    };

    const handleResetToDefault = () => {
        setTerms(DEFAULT_TERMS_HTML);
    };

    const handleClearOverride = () => {
        setTerms('');
    };

    const previewHtml = useMemo(() => {
        const source = terms.trim().length > 0 ? terms : DEFAULT_TERMS_HTML;
        return sanitizePreview(source);
    }, [terms]);

    let statusLine = 'No override saved — confirmations use the default terms.';
    if (loading) statusLine = 'Loading current setting…';
    else if (isUsingOverride)
        statusLine = 'A custom override is currently in use.';

    let saveButtonLabel = 'Save terms';
    if (saving) saveButtonLabel = 'Saving…';
    else if (terms.trim().length === 0) saveButtonLabel = 'Save (use default)';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Reservation confirmation — Terms & Conditions</CardTitle>
                    <CardDescription>
                        These terms appear in the <strong>print</strong>,{' '}
                        <strong>downloaded PDF</strong>, and{' '}
                        <strong>emailed</strong> reservation confirmation. Leave
                        empty to use the platform default. Simple HTML is allowed
                        (<code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>,{' '}
                        <code>&lt;em&gt;</code>, <code>&lt;ul&gt;</code>,{' '}
                        <code>&lt;ol&gt;</code>, <code>&lt;li&gt;</code>,{' '}
                        <code>&lt;br&gt;</code>); scripts and inline event
                        handlers are stripped on render.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                            {statusLine}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleResetToDefault}
                                disabled={loading || saving}
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                Use default as starting point
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewOpen((v) => !v)}
                                disabled={loading}
                            >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                {previewOpen ? 'Hide preview' : 'Show preview'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reservation-terms-html">
                            Terms HTML
                        </Label>
                        <textarea
                            id="reservation-terms-html"
                            value={terms}
                            onChange={(e) => setTerms(e.target.value)}
                            rows={14}
                            disabled={loading || saving}
                            placeholder="Leave empty to use the platform default terms."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-orion-blue disabled:opacity-60"
                        />
                        <p className="text-xs text-muted-foreground">
                            {terms.length.toLocaleString()} character
                            {terms.length === 1 ? '' : 's'} · max 20,000.
                        </p>
                    </div>

                    {previewOpen && (
                        <div className="rounded-md border bg-white p-4">
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                                Preview ({terms.trim() ? 'custom' : 'default'})
                            </div>
                            <div
                                className="text-sm leading-relaxed text-gray-800 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:ml-5 [&_ol]:ml-5 [&_li]:list-disc"
                                // Sanitised above; safe to render here for admin preview.
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearOverride}
                        disabled={
                            loading ||
                            saving ||
                            (terms.trim().length === 0 &&
                                savedTerms.length === 0)
                        }
                    >
                        Clear field
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        disabled={loading || saving || !isDirty}
                    >
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        {saveButtonLabel}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
