'use client';

import { searchGuestProfiles } from '@/app/actions/guest';
import { SearchSelectAlternative } from '@/components/common/SearchSelectAlternative';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type GuestPick = {
    profileId: number;
    label: string;
};

function mapSearchRows(data: unknown): GuestPick[] {
    if (!Array.isArray(data)) return [];
    const out: GuestPick[] = [];
    for (const row of data) {
        const r = row as Record<string, unknown>;
        const raw =
            r.guestProfileId ??
            r.id ??
            (typeof r.profile === 'object' && r.profile !== null
                ? (r.profile as { id?: number }).id
                : undefined);
        const pid =
            typeof raw === 'number'
                ? raw
                : typeof raw === 'string'
                  ? parseInt(raw, 10)
                  : NaN;
        if (!Number.isFinite(pid) || pid <= 0) continue;

        const name = typeof r.fullName === 'string' ? r.fullName : 'Guest';
        const phone = typeof r.phoneNumber === 'string' ? r.phoneNumber : '';
        const label = [name, phone].filter(Boolean).join(' · ');
        out.push({ profileId: pid, label: label || `Profile #${pid}` });
    }
    const seen = new Set<number>();
    return out.filter((p) => {
        if (seen.has(p.profileId)) return false;
        seen.add(p.profileId);
        return true;
    });
}

interface RefundGuestSearchProps {
    guestProfileId: string;
    guestSearch: string;
    guestFilterLabel: string;
    onFiltersChange: (_patch: {
        guestProfileId: string;
        guestSearch: string;
        guestFilterLabel: string;
    }) => void;
}

export function RefundGuestSearch({
    guestProfileId,
    guestSearch,
    guestFilterLabel,
    onFiltersChange,
}: Readonly<RefundGuestSearchProps>) {
    const [items, setItems] = useState<GuestPick[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selectedValue = useMemo((): GuestPick | null => {
        if (guestProfileId === 'all' || !guestFilterLabel) return null;
        return {
            profileId: Number(guestProfileId),
            label: guestFilterLabel,
        };
    }, [guestProfileId, guestFilterLabel]);

    const valueForSelect = useMemo(() => {
        if (!selectedValue) return null;
        return (
            items.find((i) => i.profileId === selectedValue.profileId) ??
            selectedValue
        );
    }, [items, selectedValue]);

    const runSearch = useCallback(async (query: string) => {
        const q = query.trim();
        if (q.length < 2) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const result = await searchGuestProfiles(q);
            if (result.error || !result.data) {
                setItems([]);
                return;
            }
            setItems(mapSearchRows(result.data));
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearchInput = useCallback(
        (query: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                void runSearch(query);
            }, 300);
        },
        [runSearch],
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const clearGuest = () => {
        onFiltersChange({
            guestProfileId: 'all',
            guestSearch: '',
            guestFilterLabel: '',
        });
    };

    return (
        <div className="flex gap-3 flex-1 min-w-[240px]">
            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">Guest</span>
                <div className="flex flex-wrap items-start gap-2">
                    <div className="flex-1 min-w-[200px]">
                        <SearchSelectAlternative<GuestPick>
                            id="refund-guest-profile"
                            label={
                                <span className="sr-only">Guest profile</span>
                            }
                            items={items}
                            value={valueForSelect}
                            onChange={(item) => {
                                onFiltersChange({
                                    guestProfileId: String(item.profileId),
                                    guestSearch: '',
                                    guestFilterLabel: item.label,
                                });
                            }}
                            placeholder="Search name or phone, then pick…"
                            searchPlaceholder="Type at least 2 characters…"
                            displayValue={(row) => row.label}
                            className="bg-white border-gray-200"
                            isLoading={loading}
                            onSearch={handleSearchInput}
                        />
                    </div>
                    {(selectedValue || guestSearch.trim()) && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 mt-0"
                            onClick={clearGuest}
                            aria-label="Clear guest filter"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <p className="text-xs text-gray-500">
                    Search profiles from the guest ledger; pick one to filter
                    refunds for that account.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                    Or filter by text / phone
                </span>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Partial name or phone (no exact match needed)"
                        value={guestSearch}
                        disabled={guestProfileId !== 'all'}
                        onChange={(e) => {
                            const v = e.target.value;
                            onFiltersChange({
                                guestProfileId: 'all',
                                guestSearch: v,
                                guestFilterLabel: '',
                            });
                        }}
                        className="pl-9 h-9 bg-white border-gray-200"
                    />
                </div>
            </div>
        </div>
    );
}
