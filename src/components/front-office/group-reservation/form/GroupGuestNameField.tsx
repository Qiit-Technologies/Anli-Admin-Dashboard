'use client';

import { GuestSearch } from '@/components/front-office/common/Form/Reservation/GuestSearch';
import { useGuestSearch } from '@/components/front-office/common/Form/Reservation/hooks/useGuestSearch';
import { groupFieldClass, limitPhoneDigits } from '../constants';

export type GuestSearchSelection = {
    fullName?: string;
    name?: string;
    email?: string;
    phoneNumber?: string | number;
    nationality?: string;
};

export function GroupGuestNameField({
    id,
    label,
    required,
    value,
    placeholder = 'Enter guest name, email, or phone number...',
    onValueChange,
    onSelect,
}: {
    id: string;
    label: string;
    required?: boolean;
    value: string;
    placeholder?: string;
    onValueChange: (value: string) => void;
    onSelect: (guest: GuestSearchSelection) => void;
}) {
    const {
        searchQuery,
        setSearchQuery,
        searchingGuest,
        showResults,
        guestHistory,
        setShowResults,
        setGuestHistory,
    } = useGuestSearch();

    return (
        <GuestSearch
            id={id}
            name={id}
            label={label}
            required={required}
            placeholder={placeholder}
            inputClass={groupFieldClass}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchingGuest={searchingGuest}
            showResults={showResults}
            guestHistory={guestHistory}
            setShowResults={setShowResults}
            setGuestHistory={setGuestHistory}
            value={value}
            onValueChange={onValueChange}
            autoFillGuestData={(guest) => {
                onSelect({
                    ...guest,
                    phoneNumber: guest.phoneNumber
                        ? limitPhoneDigits(String(guest.phoneNumber))
                        : '',
                });
                setSearchQuery('');
                setShowResults(false);
                setGuestHistory([]);
            }}
        />
    );
}
