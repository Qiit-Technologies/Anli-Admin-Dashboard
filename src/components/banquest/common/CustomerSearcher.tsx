'use client';

import {
    GuestProfile,
    searchGuestProfiles,
} from '@/app/actions/guest-profile';
import SearchInput from '@/components/common/SearchInput';
import { Checkbox } from '@/components/ui/checkbox';
import { LoaderCircle } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

export interface BanquetCustomerSelection {
    customerTitle?: string;
    customerName: string;
    customerEmailAddress: string;
    customerPhoneNumber: string;
}

interface CustomerSearcherProps {
    value?: Partial<BanquetCustomerSelection>;
    onSelect: (customer: BanquetCustomerSelection) => void;
}

function guestDisplayName(guest: GuestProfile): string {
    return guest.fullName?.trim() || 'Unknown guest';
}

const CustomerSearcher = ({ value, onSelect }: CustomerSearcherProps) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<GuestProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const runSearch = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        const response = await searchGuestProfiles({ query: query.trim() });
        setLoading(false);
        if (response.error || !response.data) {
            setResults([]);
            return;
        }
        setResults(
            Array.isArray(response.data) ? response.data : [],
        );
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => runSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search, runSearch]);

    const applyGuest = (guest: GuestProfile) => {
        const id = guest.id ?? null;
        setSelectedId(id);
        onSelect({
            customerTitle: value?.customerTitle || 'Mr',
            customerName: guestDisplayName(guest),
            customerEmailAddress: guest.email || '',
            customerPhoneNumber: guest.phoneNumber || '',
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Find existing guest</div>
            </div>
            <div className="p-4 flex flex-col gap-3 rounded-lg border bg-gray-50">
                <SearchInput
                    placeholder="Search by name, email, or phone (min. 2 characters)"
                    value={search}
                    className="w-full bg-white"
                    onChange={(e) => setSearch(e.target.value)}
                />
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Searching…
                    </div>
                ) : null}
                <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {search.trim().length >= 2 && !loading && results.length === 0 ? (
                        <li className="text-xs text-muted-foreground">
                            No guests found. Enter customer details manually
                            below.
                        </li>
                    ) : null}
                    {results.map((guest) => {
                        const id = guest.id ?? 0;
                        const name = guestDisplayName(guest);
                        return (
                            <li key={id || name}>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-white text-left"
                                    onClick={() => applyGuest(guest)}
                                >
                                    <Checkbox
                                        checked={selectedId === id}
                                        className="pointer-events-none"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm">{name}</span>
                                        {(guest.email || guest.phoneNumber) && (
                                            <span className="text-xs text-muted-foreground">
                                                {[guest.email, guest.phoneNumber]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {value?.customerName ? (
                    <p className="text-xs text-muted-foreground border-t pt-2">
                        Selected: {value.customerName}
                        {value.customerEmailAddress
                            ? ` (${value.customerEmailAddress})`
                            : ''}
                    </p>
                ) : null}
            </div>
        </div>
    );
};

export default CustomerSearcher;
