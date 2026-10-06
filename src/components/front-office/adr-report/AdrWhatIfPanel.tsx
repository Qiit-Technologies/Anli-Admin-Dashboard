'use client';

import {
    postAdrDiscountPreview,
    type AdrDiscountPreviewResult,
} from '@/app/actions/guest';
import { toYYYYMMDD } from '@/components/front-office/complimentary-report/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/common/DatePicker';
import { useUser } from '@/context/useUser';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

function todayYmd(): string {
    return toYYYYMMDD(new Date());
}

function formatMoney(n: number): string {
    return n.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function riskStyles(risk: AdrDiscountPreviewResult['riskLevel']): string {
    if (risk === 'HIGH') return 'text-red-700 bg-red-50 border-red-200';
    if (risk === 'MEDIUM') return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-green-800 bg-green-50 border-green-200';
}

export type AdrWhatIfPanelProps = {
    /** `embedded` hides the long intro and tightens spacing (e.g. reservation sheet). */
    variant?: 'full' | 'embedded';
    /** When set, panel resets these when the prop changes (e.g. different stay date). */
    initialDate?: string;
    initialRatePerNight?: number;
    initialAdditionalNights?: number;
};

export default function AdrWhatIfPanel({
    variant = 'full',
    initialDate,
    initialRatePerNight,
    initialAdditionalNights,
}: Readonly<AdrWhatIfPanelProps>) {
    const { user } = useUser();
    const [date, setDate] = useState(initialDate ?? todayYmd());
    const [additionalNights, setAdditionalNights] = useState(
        initialAdditionalNights ?? 1,
    );
    const [ratePerNight, setRatePerNight] = useState(
        initialRatePerNight != null && initialRatePerNight > 0
            ? String(initialRatePerNight)
            : '',
    );
    const [includePending, setIncludePending] = useState(false);
    const [includeNoShows, setIncludeNoShows] = useState(false);
    const [bookingSource, setBookingSource] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<AdrDiscountPreviewResult | null>(
        null,
    );

    useEffect(() => {
        if (initialDate) setDate(initialDate);
    }, [initialDate]);

    useEffect(() => {
        if (initialAdditionalNights != null) {
            setAdditionalNights(
                Math.max(1, Math.min(50, initialAdditionalNights)),
            );
        }
    }, [initialAdditionalNights]);

    useEffect(() => {
        if (initialRatePerNight != null && initialRatePerNight > 0) {
            setRatePerNight(String(initialRatePerNight));
        }
    }, [initialRatePerNight]);

    const canManagerNote = useMemo(() => {
        const role = user?.roles?.name?.toLowerCase() ?? '';
        return ['manager', 'administrator', 'general manager'].includes(role);
    }, [user?.roles?.name]);

    const runPreview = async () => {
        const rate = Number(ratePerNight);
        if (!Number.isFinite(rate) || rate < 0) {
            toast.error('Enter a valid rate per night.');
            return;
        }
        setLoading(true);
        setPreview(null);
        try {
            const res = await postAdrDiscountPreview({
                date,
                additionalNights,
                ratePerNight: rate,
                includePending,
                includeNoShows,
                bookingSource: bookingSource.trim() || undefined,
            });
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            setPreview(res.data);
        } catch {
            toast.error('Preview failed.');
        } finally {
            setLoading(false);
        }
    };

    const isEmbedded = variant === 'embedded';

    return (
        <div
            className={
                isEmbedded
                    ? 'flex flex-col gap-3'
                    : 'flex flex-col max-w-6xl mx-auto w-full'
            }
        >
            {!isEmbedded ? (
                <div className="rounded-lg border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 mb-4 text-center sm:text-left">
                    <p className="font-medium">Read this once</p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-amber-950/90">
                        <li>
                            <strong>Report tab</strong> = history for a date
                            range (who stayed, revenue, ADR by day).
                        </li>
                        <li>
                            <strong>Here</strong> = quick math before you agree
                            a walk-in or discount: if we add guest-nights at
                            this rate, how does blended ADR move?
                        </li>
                    </ul>
                </div>
            ) : null}

            <div
                className={
                    isEmbedded
                        ? 'max-w-full flex flex-col gap-3'
                        : 'max-w-xl flex flex-col gap-4'
                }
            >
                {!isEmbedded ? (
                    <p className="text-sm text-gray-600">
                        Tip: leave “Extra guest-nights” at <strong>1</strong>{' '}
                        unless you are modelling several identical nights at the
                        same rate.
                    </p>
                ) : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="adr-wif-date">Date</Label>
                        <DatePicker
                            value={date}
                            onChange={(val) => setDate(val)}
                            className="bg-white border-slate-200"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="adr-wif-nights">
                            Extra guest-nights
                        </Label>
                        <Input
                            id="adr-wif-nights"
                            type="number"
                            min={1}
                            max={50}
                            value={additionalNights}
                            onChange={(e) =>
                                setAdditionalNights(
                                    Math.max(
                                        1,
                                        Math.min(
                                            50,
                                            Number(e.target.value) || 1,
                                        ),
                                    ),
                                )
                            }
                            className="bg-white"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="adr-wif-rate">
                        Rate per night (room revenue)
                    </Label>
                    <Input
                        id="adr-wif-rate"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="e.g. 185"
                        value={ratePerNight}
                        onChange={(e) => setRatePerNight(e.target.value)}
                        className="bg-white"
                    />
                </div>
                {!isEmbedded ? (
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="adr-wif-bs">
                            Booking source (optional)
                        </Label>
                        <Input
                            id="adr-wif-bs"
                            placeholder="Exact match — same as ADR report filter"
                            value={bookingSource}
                            onChange={(e) => setBookingSource(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                ) : null}
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includePending}
                            onChange={(e) =>
                                setIncludePending(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        Include pending
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeNoShows}
                            onChange={(e) =>
                                setIncludeNoShows(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        Include no-shows
                    </label>
                </div>
                <Button
                    type="button"
                    onClick={runPreview}
                    disabled={loading}
                    className="bg-blue hover:bg-blue/90 text-white w-fit"
                >
                    {loading ? 'Calculating…' : 'Calculate impact'}
                </Button>
            </div>

            {preview ? (
                <div
                    className={
                        isEmbedded
                            ? 'mt-4 max-w-full flex flex-col gap-3'
                            : 'mt-8 max-w-2xl flex flex-col gap-4'
                    }
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-lg border p-4 bg-white">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                                Current ADR ({preview.date})
                            </div>
                            <div className="text-2xl font-semibold text-gray-900 mt-1">
                                {formatMoney(preview.currentAdr)}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                {preview.dayGuestNights} guest-nights ·{' '}
                                {formatMoney(preview.dayRoomRevenue)} revenue
                            </div>
                        </div>
                        <div className="rounded-lg border p-4 bg-white">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                                After +{preview.additionalNights} @{' '}
                                {formatMoney(preview.ratePerNight)}
                            </div>
                            <div className="text-2xl font-semibold text-gray-900 mt-1">
                                {formatMoney(preview.projectedAdr)}
                            </div>
                            {preview.deltaPercent != null ? (
                                <div
                                    className={`text-sm mt-2 font-medium ${preview.deltaPercent < 0 ? 'text-red-600' : preview.deltaPercent > 0 ? 'text-green-600' : 'text-gray-600'}`}
                                >
                                    {preview.deltaPercent > 0 ? '+' : ''}
                                    {preview.deltaPercent}% vs current
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div
                        className={`rounded-lg border p-4 text-sm ${riskStyles(preview.riskLevel)}`}
                    >
                        <div className="font-semibold mb-1">
                            Risk: {preview.riskLevel}
                        </div>
                        <p>{preview.insight}</p>
                        {preview.suggestedMinRate != null ? (
                            <p className="mt-2">
                                Suggested minimum rate (ADR × factor):{' '}
                                <span className="font-semibold">
                                    {formatMoney(preview.suggestedMinRate)}
                                </span>
                            </p>
                        ) : null}
                        {preview.currentOccupancyPercent != null ? (
                            <p className="mt-1">
                                Current occupancy:{' '}
                                <span className="font-semibold">
                                    {preview.currentOccupancyPercent}%
                                </span>
                            </p>
                        ) : null}
                        {(preview.projectedOccupancyPercent ??
                            preview.occupancyPercent) != null ? (
                            <p className="mt-1">
                                Projected occupancy after this quote:{' '}
                                <span className="font-semibold">
                                    {preview.projectedOccupancyPercent ??
                                        preview.occupancyPercent}
                                    %
                                </span>
                            </p>
                        ) : null}
                    </div>
                    <p className="text-xs text-gray-500">
                        Read-only. Applying a rate still happens in the
                        reservation flow.
                        {canManagerNote
                            ? ' Managers use normal overrides when risk is elevated.'
                            : ' Escalate to a manager if risk is not LOW.'}
                    </p>
                </div>
            ) : null}
        </div>
    );
}
