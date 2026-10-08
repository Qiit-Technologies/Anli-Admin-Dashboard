'use client';

import {
    getAllGuestProfiles,
    GuestProfile,
    searchGuestProfiles,
} from '@/app/actions/guest-profile';
import { InputField, SelectField } from '@/components/common/Form';
import SearchInput from '@/components/common/SearchInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Toast from '@/components/toast';
import { CheckCircle2, Info, LoaderCircle, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    getCountryOptions,
    getNigeriaStateOptions,
} from '../geography-options';
import SectionHeader from '../SectionHeader';
import { CUSTOMER_TYPES, TITLE_OPTIONS } from '../constants';
import { BanquetWizardState } from '../types';

interface CustomerStepProps {
    state: BanquetWizardState;
    onChange: <K extends keyof BanquetWizardState>(
        _field: K,
        _value: BanquetWizardState[K],
    ) => void;
}

function guestName(g: GuestProfile) {
    return g.fullName?.trim() || 'Guest';
}

function CustomerList({
    guests,
    onSelect,
}: Readonly<{
    guests: GuestProfile[];
    onSelect: (guest: GuestProfile) => void;
}>) {
    return (
        <ul className="space-y-1">
            {guests.map((g) => (
                <li key={g.id}>
                    <button
                        type="button"
                        onClick={() => onSelect(g)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-white"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {guestName(g)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {g.email || g.phoneNumber || 'No contact info'}
                            </p>
                        </div>
                        <span className="text-xs text-orion-blue">Use</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}

function CustomerLookupPanel({
    showSearchResults,
    isSearching,
    searchResults,
    loadingSavedGuests,
    savedGuests,
    onSelectGuest,
}: Readonly<{
    showSearchResults: boolean;
    isSearching: boolean;
    searchResults: GuestProfile[];
    loadingSavedGuests: boolean;
    savedGuests: GuestProfile[];
    onSelectGuest: (guest: GuestProfile) => void;
}>) {
    if (showSearchResults) {
        if (isSearching) {
            return (
                <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Searching customer...
                </div>
            );
        }

        if (searchResults.length === 0) {
            return (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                    No customers found for this search.
                </p>
            );
        }

        return (
            <CustomerList guests={searchResults} onSelect={onSelectGuest} />
        );
    }

    if (loadingSavedGuests) {
        return (
            <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading customers...
            </div>
        );
    }

    return <CustomerList guests={savedGuests} onSelect={onSelectGuest} />;
}

const STATE_OPTIONS = getNigeriaStateOptions();
const COUNTRY_OPTIONS = getCountryOptions();

const CITY_OPTIONS = [
    { value: 'lagos', label: 'Lagos' },
    { value: 'ibadan', label: 'Ibadan' },
    { value: 'port-harcourt', label: 'Port Harcourt' },
    { value: 'abuja', label: 'Abuja' },
];

export default function CustomerStep({
    state,
    onChange,
}: Readonly<CustomerStepProps>) {
    const [savedGuests, setSavedGuests] = useState<GuestProfile[]>([]);
    const [loadingSavedGuests, setLoadingSavedGuests] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<GuestProfile[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const loadSavedGuests = useCallback(async () => {
        setLoadingSavedGuests(true);
        const res = await getAllGuestProfiles();
        setLoadingSavedGuests(false);
        if (!res.error && Array.isArray(res.data)) {
            setSavedGuests(res.data.slice(0, 8));
        } else {
            setSavedGuests([]);
        }
    }, []);

    useEffect(() => {
        loadSavedGuests();
    }, [loadSavedGuests]);

    useEffect(() => {
        const query = searchQuery.trim();
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const res = await searchGuestProfiles({ query });
            setIsSearching(false);
            if (!res.error && Array.isArray(res.data)) {
                setSearchResults(res.data.slice(0, 5));
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const applyGuest = (guest: GuestProfile) => {
        const parts = guestName(guest).split(/\s+/);
        const name = guestName(guest);
        onChange('customerTitle', state.customerTitle || 'Mr');
        onChange('firstName', parts[0] ?? '');
        onChange('lastName', parts.slice(1).join(' '));
        onChange('customerName', name);
        onChange('customerEmailAddress', guest.email ?? '');
        onChange('customerPhoneNumber', guest.phoneNumber ?? '');

        toast.custom(() => (
            <Toast
                title="Customer selected"
                description={`${name}'s details have been filled in below.`}
                type="success"
            />
        ));
    };

    const selectedCustomer = useMemo(
        () =>
            [state.firstName, state.lastName].filter(Boolean).join(' ').trim(),
        [state.firstName, state.lastName],
    );

    const showSearchResults = searchQuery.trim().length >= 2;
    const showCustomerPanel =
        showSearchResults || loadingSavedGuests || savedGuests.length > 0;
    const showCustomerHint =
        showCustomerPanel &&
        !loadingSavedGuests &&
        !isSearching &&
        (!showSearchResults || searchResults.length > 0);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="flex flex-col gap-6">
                <section className="space-y-4">
                    <SectionHeader
                        title="Find existing customer"
                        subtitle="Search or select from your saved customers"
                    />
                    <SearchInput
                        placeholder="Search for customer by name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-md border-gray-200 bg-white"
                    />
                    {showCustomerPanel ? (
                        <div className="rounded-md border border-gray-100 bg-gray-50 p-2">
                            {showCustomerHint ? (
                                <div className="mb-2 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2.5">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-orion-blue" />
                                    <p className="text-sm text-gray-700">
                                        Select a customer below and their
                                        details will be filled into the form
                                        automatically.
                                    </p>
                                </div>
                            ) : null}
                            <CustomerLookupPanel
                                showSearchResults={showSearchResults}
                                isSearching={isSearching}
                                searchResults={searchResults}
                                loadingSavedGuests={loadingSavedGuests}
                                savedGuests={savedGuests}
                                onSelectGuest={applyGuest}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-muted-foreground">
                            <Users className="h-5 w-5 shrink-0 text-gray-400" />
                            <p>Your existing customers will show here.</p>
                        </div>
                    )}
                </section>
                {selectedCustomer ? (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-emerald-900">
                                {selectedCustomer}
                            </p>
                            <p className="text-xs text-emerald-700">
                                Customer details populated in the form below.
                                Review and edit if needed.
                            </p>
                        </div>
                    </div>
                ) : null}
                <section className="space-y-4">
                    <SectionHeader
                        title="Add New Customer"
                        subtitle="Enter customer details"
                    />
                    <div className="grid gap-4 md:grid-cols-3">
                        <SelectField
                            id="customerTitle"
                            name="customerTitle"
                            label="Title"
                            value={state.customerTitle}
                            onValueChange={(v) => onChange('customerTitle', v)}
                            options={[...TITLE_OPTIONS]}
                            placeholder="Select Title"
                        />
                        <InputField
                            id="firstName"
                            name="firstName"
                            label="First name"
                            placeholder="Enter first name"
                            value={state.firstName}
                            onChange={(e) =>
                                onChange('firstName', e.target.value)
                            }
                            required
                        />
                        <InputField
                            id="lastName"
                            name="lastName"
                            label="Last name"
                            placeholder="Enter Last name"
                            value={state.lastName}
                            onChange={(e) =>
                                onChange('lastName', e.target.value)
                            }
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                            id="customerEmail"
                            name="customerEmail"
                            label="Email Address"
                            type="email"
                            placeholder="Enter your Email Address"
                            value={state.customerEmailAddress}
                            onChange={(e) =>
                                onChange('customerEmailAddress', e.target.value)
                            }
                            required
                        />
                        <InputField
                            id="customerPhone"
                            name="customerPhone"
                            label="Phone Number"
                            placeholder="Enter Phone Number"
                            value={state.customerPhoneNumber}
                            onChange={(e) =>
                                onChange('customerPhoneNumber', e.target.value)
                            }
                            required
                        />
                        <InputField
                            id="company"
                            name="company"
                            label="Company/ Optional"
                            placeholder="Enter company name"
                            value={state.company}
                            onChange={(e) =>
                                onChange('company', e.target.value)
                            }
                        />
                        <SelectField
                            id="customerType"
                            name="customerType"
                            label="Customer type"
                            value={state.customerType}
                            onValueChange={(v) => onChange('customerType', v)}
                            options={[...CUSTOMER_TYPES]}
                            placeholder="Select Customer Type"
                        />
                    </div>
                </section>
                <section className="space-y-4">
                    <SectionHeader title="Billing Address" />
                    <div className="grid gap-4 md:grid-cols-3">
                        <SelectField
                            id="billingTitle"
                            name="billingTitle"
                            label="Title"
                            value={state.billingTitle}
                            onValueChange={(v) => onChange('billingTitle', v)}
                            options={[...TITLE_OPTIONS]}
                            placeholder="Select Title"
                        />
                        <InputField
                            id="billingFirstName"
                            name="billingFirstName"
                            label="First name"
                            placeholder="Enter first name"
                            value={state.billingFirstName}
                            onChange={(e) =>
                                onChange('billingFirstName', e.target.value)
                            }
                        />
                        <InputField
                            id="billingLastName"
                            name="billingLastName"
                            label="Last name"
                            placeholder="Enter Last name"
                            value={state.billingLastName}
                            onChange={(e) =>
                                onChange('billingLastName', e.target.value)
                            }
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                            id="billingAddress"
                            name="billingAddress"
                            label="Address"
                            placeholder="Enter Address"
                            value={state.billingAddress}
                            onChange={(e) =>
                                onChange('billingAddress', e.target.value)
                            }
                        />
                        <SelectField
                            id="billingState"
                            name="billingState"
                            label="State"
                            value={state.billingState}
                            onValueChange={(v) => onChange('billingState', v)}
                            options={STATE_OPTIONS}
                            placeholder="Select State"
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <SelectField
                            id="billingCounty"
                            name="billingCounty"
                            label="Country"
                            value={state.billingCounty}
                            onValueChange={(v) => onChange('billingCounty', v)}
                            options={COUNTRY_OPTIONS}
                            placeholder="Select country"
                        />
                        <InputField
                            id="billingPostalCode"
                            name="billingPostalCode"
                            label="Postal code (optional)"
                            placeholder="Enter Postal code"
                            value={state.billingPostalCode}
                            onChange={(e) =>
                                onChange('billingPostalCode', e.target.value)
                            }
                        />
                        <SelectField
                            id="billingCity"
                            name="billingCity"
                            label="City"
                            value={state.billingCity}
                            onValueChange={(v) => onChange('billingCity', v)}
                            options={CITY_OPTIONS}
                            placeholder="Select city"
                        />
                    </div>
                </section>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="saveCustomer"
                            checked={state.saveCustomer}
                            onCheckedChange={(c) =>
                                onChange('saveCustomer', !!c)
                            }
                        />
                        <Label
                            htmlFor="saveCustomer"
                            className="text-sm font-medium text-gray-900"
                        >
                            Save this customer for future booking
                        </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Customer will be available for search when next booking
                        is created.
                    </p>
                </div>
            </div>
        </div>
    );
}
