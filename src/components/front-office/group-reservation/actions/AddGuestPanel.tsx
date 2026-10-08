'use client';

import { useGuestSearch } from '@/components/front-office/common/Form/Reservation/hooks/useGuestSearch';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import {
    GUEST_TYPE_OPTIONS,
    NATIONALITY_OPTIONS,
    PHONE_MAX_DIGITS,
    limitPhoneDigits,
} from '../constants';
import {
    GroupSearchField,
    GroupSelectField,
    GroupTextField,
} from '../form/GroupFormFields';
import type { GroupGuestDraft } from '../types';
import { roomsForType, roomNumberPlaceholder, useGroupOptions } from '../useGroupOptions';
import { ActionFooter } from './ActionFooter';

const emptyDraft: Omit<GroupGuestDraft, 'id'> = {
    name: '',
    phoneNumber: '',
    email: '',
    roomTypeId: '',
    nationality: 'nigeria',
    roomNumber: '',
    guestType: 'adult',
};

function mapNationality(raw?: string) {
    if (!raw) return 'nigeria';
    const needle = raw.toLowerCase();
    const match = NATIONALITY_OPTIONS.find(
        (option) =>
            option.value === needle ||
            option.label.toLowerCase() === needle ||
            needle.includes(option.value.replace('-', ' ')),
    );
    return match?.value || 'other';
}

export function AddGuestPanel({
    onClose,
    onAdd,
    arrivalDate,
    departureDate,
}: {
    onClose: () => void;
    onAdd: (guest: Omit<GroupGuestDraft, 'id'>) => void | Promise<void>;
    arrivalDate?: Date;
    departureDate?: Date;
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
    const [draft, setDraft] = useState(emptyDraft);
    const [saving, setSaving] = useState(false);
    const { roomTypeOptions, rooms } = useGroupOptions();
    const hasStayDates = Boolean(arrivalDate && departureDate);
    const roomNumberOptions = roomsForType(
        rooms,
        draft.roomTypeId,
        arrivalDate,
        departureDate,
    ).map((room) => ({
        value: room.roomNumber,
        label: room.roomNumber,
    }));

    return (
        <>
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Add a new guest to this group. This does not attach an
                    existing reservation.
                </p>
                <GroupSearchField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    searching={searchingGuest}
                    showResults={showResults}
                    results={guestHistory}
                    onSelect={(guest) => {
                        setDraft((prev) => ({
                            ...prev,
                            name:
                                guest.fullName?.trim() ||
                                guest.name?.trim() ||
                                prev.name,
                            phoneNumber: limitPhoneDigits(
                                String(guest.phoneNumber || ''),
                            ),
                            email: guest.email || prev.email,
                            nationality: mapNationality(guest.nationality),
                        }));
                        setSearchQuery('');
                        setShowResults(false);
                        setGuestHistory([]);
                    }}
                />
                <p className="text-center text-xs text-muted-foreground">
                    Or Add guest manually
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <GroupTextField
                        id="add-guest-name"
                        label="Guest Name"
                        placeholder="Enter full name"
                        value={draft.name}
                        onChange={(name) => setDraft({ ...draft, name })}
                    />
                    <GroupTextField
                        id="add-guest-phone"
                        label="Phone Number"
                        placeholder="Enter phone number"
                        inputMode="tel"
                        maxLength={PHONE_MAX_DIGITS}
                        value={draft.phoneNumber}
                        onChange={(phoneNumber) =>
                            setDraft({
                                ...draft,
                                phoneNumber: limitPhoneDigits(phoneNumber),
                            })
                        }
                    />
                    <GroupTextField
                        id="add-guest-email"
                        label="Email Address"
                        placeholder="Enter email address"
                        type="email"
                        value={draft.email}
                        onChange={(email) => setDraft({ ...draft, email })}
                    />
                    <GroupSelectField
                        id="add-guest-room-type"
                        label="Room Type"
                        placeholder="Select room type"
                        value={draft.roomTypeId}
                        options={roomTypeOptions}
                        onChange={(roomTypeId) =>
                            setDraft({ ...draft, roomTypeId, roomNumber: '' })
                        }
                    />
                    <GroupSelectField
                        id="add-guest-room-number"
                        label="Room Number"
                        placeholder={roomNumberPlaceholder(
                            draft.roomTypeId,
                            roomNumberOptions.length,
                            hasStayDates,
                        )}
                        value={draft.roomNumber}
                        options={roomNumberOptions}
                        onChange={(roomNumber) =>
                            setDraft({ ...draft, roomNumber })
                        }
                    />
                    <GroupSelectField
                        id="add-guest-type"
                        label="Guest Type"
                        value={draft.guestType}
                        options={GUEST_TYPE_OPTIONS}
                        onChange={(guestType) =>
                            setDraft({
                                ...draft,
                                guestType:
                                    guestType as GroupGuestDraft['guestType'],
                            })
                        }
                    />
                </div>
            </div>
            <ActionFooter
                onCancel={onClose}
                confirm={{
                    label: 'Add Guest',
                    disabled:
                        saving ||
                        !draft.name.trim() ||
                        !draft.phoneNumber.trim() ||
                        !draft.roomTypeId,
                    loading: saving,
                    icon: <ArrowRight className="size-4" />,
                    onClick: async () => {
                        setSaving(true);
                        try {
                            await onAdd(draft);
                        } finally {
                            setSaving(false);
                        }
                    },
                }}
            />
        </>
    );
}
