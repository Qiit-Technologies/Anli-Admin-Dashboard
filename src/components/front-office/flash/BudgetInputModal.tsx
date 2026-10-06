'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    X,
    Target,
    Loader2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Info,
} from 'lucide-react';
import { getBudget, upsertBudget, BudgetPayload } from '@/app/actions/reports';

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

interface BudgetField {
    key: keyof Omit<BudgetPayload, 'year' | 'month'>;
    label: string;
    hint: string;
    isCurrency: boolean;
    suffix?: string;
    placeholder: string;
    allowDecimal?: boolean;
}

const FIELDS: BudgetField[] = [
    {
        key: 'budgetOccupancyPct',
        label: 'Occupancy Target',
        hint: 'Target % of sellable rooms filled per night',
        isCurrency: false,
        suffix: '%',
        placeholder: '75.0',
        allowDecimal: true,
    },
    {
        key: 'budgetRoomsOccupied',
        label: 'Rooms Occupied / Night',
        hint: 'Expected number of rooms sold on average per night',
        isCurrency: false,
        placeholder: '42',
    },
    {
        key: 'budgetArrivals',
        label: 'Arrivals (month total)',
        hint: 'Total expected check-ins for the month',
        isCurrency: false,
        placeholder: '350',
    },
    {
        key: 'budgetDepartures',
        label: 'Departures (month total)',
        hint: 'Total expected check-outs for the month',
        isCurrency: false,
        placeholder: '350',
    },
    {
        key: 'budgetRoomRevenue',
        label: 'Room Revenue',
        hint: 'Total planned room revenue for the month',
        isCurrency: true,
        placeholder: '5,000,000',
    },
    {
        key: 'budgetFbRevenue',
        label: 'F&B Revenue',
        hint: 'Total planned food & beverage revenue for the month',
        isCurrency: true,
        placeholder: '1,200,000',
    },
    {
        key: 'budgetOtherRevenue',
        label: 'Other Revenue',
        hint: 'Ancillary / custom charges revenue target',
        isCurrency: true,
        placeholder: '300,000',
    },
    {
        key: 'budgetAdr',
        label: 'ADR Target',
        hint: 'Target Average Daily Rate (per occupied room)',
        isCurrency: true,
        placeholder: '125,000',
    },
    {
        key: 'budgetRevpar',
        label: 'RevPAR Target',
        hint: 'Target Revenue Per Available Room',
        isCurrency: true,
        placeholder: '94,000',
    },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialYear?: number;
    initialMonth?: number;
}

// Store raw numeric strings internally; display formatted
type RawValues = Record<string, string>;

/** Format a raw numeric string with thousand-separators for display */
const formatDisplay = (raw: string, allowDecimal = false): string => {
    if (!raw) return '';
    const [intPart, decPart] = raw.split('.');
    const formatted = Number(intPart.replace(/\D/g, '') || 0).toLocaleString(
        'en-NG',
    );
    if (allowDecimal && decPart !== undefined) return `${formatted}.${decPart}`;
    return formatted;
};

/** Strip formatting to get the raw numeric string */
const toRaw = (display: string): string => display.replace(/,/g, '');

export default function BudgetInputModal({
    isOpen,
    onClose,
    initialYear,
    initialMonth,
}: Props) {
    const now = new Date();
    const [year, setYear] = useState(initialYear ?? now.getFullYear());
    const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1);
    const [values, setValues] = useState<RawValues>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBudget = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSaved(false);
        const result = await getBudget(year, month);
        const mapped: RawValues = {};
        if (result.data) {
            FIELDS.forEach((f) => {
                const v = result.data[f.key];
                mapped[f.key] = v != null && v !== 0 ? String(v) : '';
            });
        }
        setValues(mapped);
        setLoading(false);
    }, [year, month]);

    useEffect(() => {
        if (isOpen) loadBudget();
    }, [isOpen, loadBudget]);

    const handleChange = (
        key: string,
        displayVal: string,
        allowDecimal = false,
    ) => {
        // Allow only digits, commas, and optionally a single decimal point
        const pattern = allowDecimal ? /[^0-9.,]/g : /[^0-9,]/g;
        const cleaned = displayVal.replace(pattern, '');
        const raw = toRaw(cleaned);

        // Prevent multiple decimal points
        const dotCount = (raw.match(/\./g) || []).length;
        if (dotCount > 1) return;

        setValues((prev) => ({ ...prev, [key]: raw }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        const payload: BudgetPayload = { year, month };
        FIELDS.forEach((f) => {
            const v = parseFloat(values[f.key] ?? '');
            if (!isNaN(v)) (payload as any)[f.key] = v;
        });
        const result = await upsertBudget(payload);
        setSaving(false);
        if (result.error) {
            setError(result.error);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const changeMonth = (delta: number) => {
        let m = month + delta;
        let y = year;
        if (m > 12) {
            m = 1;
            y++;
        }
        if (m < 1) {
            m = 12;
            y--;
        }
        setMonth(m);
        setYear(y);
    };

    if (!isOpen) return null;

    const isPastMonth =
        year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <div className="flex items-center gap-2">
                        <Target className="text-brand w-5 h-5" />
                        <div>
                            <h2 className="text-base font-bold text-gray-800">
                                Monthly Budget Targets
                            </h2>
                            <p className="text-xs text-gray-400">
                                Planned / forecast values — compared against
                                actuals in the Flash report
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Month / Year picker */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b shrink-0">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="font-semibold text-sm text-gray-700">
                            {MONTHS[month - 1]} {year}
                        </span>
                        {isPastMonth && (
                            <span className="text-[10px] text-amber-500 font-medium mt-0.5">
                                Past month — editing historical target
                            </span>
                        )}
                        {!isPastMonth && (
                            <span className="text-[10px] text-brand font-medium mt-0.5">
                                Future target
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-400">
                            <Loader2 className="animate-spin w-6 h-6 mr-2" />
                            Loading…
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Context note */}
                            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5 mb-4">
                                <Info
                                    size={14}
                                    className="text-blue-400 mt-0.5 shrink-0"
                                />
                                <p className="text-xs text-blue-600 leading-relaxed">
                                    Enter <strong>monthly totals</strong>. The
                                    Flash report automatically breaks these down
                                    into daily, MTD, and YTD budget columns for
                                    comparison against actual performance.
                                </p>
                            </div>

                            {/* Section: Room */}
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-2 pb-1">
                                Room Statistics
                            </p>
                            {FIELDS.slice(0, 4).map((f) => (
                                <FieldRow
                                    key={f.key}
                                    f={f}
                                    values={values}
                                    onChange={handleChange}
                                />
                            ))}

                            {/* Section: Revenue */}
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-4 pb-1">
                                Revenue Targets
                            </p>
                            {FIELDS.slice(4, 7).map((f) => (
                                <FieldRow
                                    key={f.key}
                                    f={f}
                                    values={values}
                                    onChange={handleChange}
                                />
                            ))}

                            {/* Section: KPI */}
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-4 pb-1">
                                Performance KPIs
                            </p>
                            {FIELDS.slice(7).map((f) => (
                                <FieldRow
                                    key={f.key}
                                    f={f}
                                    values={values}
                                    onChange={handleChange}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between gap-3 shrink-0">
                    {error && (
                        <p className="text-xs text-red-600 flex-1">{error}</p>
                    )}
                    {saved && (
                        <span className="flex items-center gap-1 text-xs text-green-600 flex-1">
                            <CheckCircle2 size={14} /> Targets saved for{' '}
                            {MONTHS[month - 1]} {year}
                        </span>
                    )}
                    {!error && !saved && <span className="flex-1" />}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-5 py-2 text-sm rounded-lg bg-orion-blue  text-white font-semibold hover:bg-orion-blue/80 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        {saving && <Loader2 className="animate-spin w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save Targets'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Field Row sub-component ──────────────────────────────────────────────────
function FieldRow({
    f,
    values,
    onChange,
}: {
    f: BudgetField;
    values: RawValues;
    onChange: (key: string, val: string, allowDecimal?: boolean) => void;
}) {
    const raw = values[f.key] ?? '';
    const display = raw ? formatDisplay(raw, f.allowDecimal) : '';

    return (
        <div className="flex items-center gap-3 py-1.5">
            <div className="w-44 shrink-0">
                <p className="text-sm text-gray-700">{f.label}</p>
                <p className="text-[10px] text-gray-400 leading-tight">
                    {f.hint}
                </p>
            </div>
            <div className="relative flex-1">
                {f.isCurrency && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                        ₦
                    </span>
                )}
                {f.suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                        {f.suffix}
                    </span>
                )}
                <input
                    type="text"
                    inputMode="decimal"
                    className={`w-full border rounded-lg py-2 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors ${
                        f.isCurrency
                            ? 'pl-7 pr-3'
                            : f.suffix
                              ? 'pl-3 pr-7'
                              : 'px-3'
                    } ${raw ? 'text-gray-800' : 'text-gray-400'}`}
                    placeholder={f.placeholder}
                    value={display}
                    onChange={(e) =>
                        onChange(f.key, e.target.value, f.allowDecimal)
                    }
                />
            </div>
        </div>
    );
}
