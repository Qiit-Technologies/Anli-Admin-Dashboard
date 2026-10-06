'use client';

import { UserRoundPlus } from 'lucide-react';
import {
    GUEST_TYPE_OPTIONS,
    NATIONALITY_OPTIONS,
    PHONE_MAX_DIGITS,
    groupPanelClass,
    groupPanelTitleClass,
    limitPhoneDigits,
} from '../constants';
import type { GroupGuestDraft, RoomTypeOption } from '../types';
import {
    roomsForType,
    roomNumberPlaceholder,
    type RoomRecord,
} from '../useGroupOptions';
import { GroupGuestNameField } from './GroupGuestNameField';
import { GroupSelectField, GroupTextField } from './GroupFormFields';

export function AddGuestSection({
    guests,
    roomTypes,
    rooms,
    arrivalDate,
    departureDate,
    onChangeGuest,
    onAddGuest,
    onRemoveGuest,
}: {
    guests: GroupGuestDraft[];
    roomTypes: RoomTypeOption[];
    rooms: RoomRecord[];
    arrivalDate?: Date;
    departureDate?: Date;
    onChangeGuest: (id: string, patch: Partial<GroupGuestDraft>) => void;
    onAddGuest: () => void;
    onRemoveGuest: (id: string) => void;
}) {
    const roomTypeOptions = (roomTypes ?? []).map((room) => ({
        value: room.id,
        label: room.name,
    }));
    const extras = guests.filter((guest) => !guest.isMaster);
    const takenNumbers = new Set(
        guests.map((guest) => guest.roomNumber).filter(Boolean),
    );
    const hasStayDates = Boolean(arrivalDate && departureDate);

    if (extras.length === 0) {
        return (
            <div className="flex justify-end px-1">
                <button
                    type="button"
                    onClick={onAddGuest}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-orion-blue"
                >
                    <UserRoundPlus className="size-4" />
                    Add Guest
                </button>
            </div>
        );
    }

    return (
        <div className={groupPanelClass}>
            <div className="border-b border-gray-100 px-4 py-3.5">
                <h3 className={groupPanelTitleClass}>Other guests</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    The Master is guest 1 of {guests.length}. Name the other{' '}
                    {extras.length} here.
                </p>
            </div>
            <div className="divide-y divide-gray-100">
                {extras.map((guest, index) => {
                    const typeRooms = roomsForType(
                        rooms,
                        guest.roomTypeId,
                        arrivalDate,
                        departureDate,
                    );
                    const roomNumberOptions = typeRooms
                        .filter(
                            (room) =>
                                room.roomNumber === guest.roomNumber ||
                                !takenNumbers.has(room.roomNumber),
                        )
                        .map((room) => ({
                            value: room.roomNumber,
                            label: room.roomNumber,
                        }));

                    return (
                        <div key={guest.id} className="space-y-4 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Guest {index + 2} of {guests.length}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => onRemoveGuest(guest.id)}
                                    disabled={
                                        guests.length <= 1 || guest.isMaster
                                    }
                                    className="text-[13px] font-medium text-destructive disabled:opacity-40"
                                >
                                    Remove Guest
                                </button>
                            </div>
                            <GroupGuestNameField
                                id={`${guest.id}-name`}
                                label="Guest Name"
                                value={guest.name}
                                onValueChange={(name) =>
                                    onChangeGuest(guest.id, { name })
                                }
                                onSelect={(selected) =>
                                    onChangeGuest(guest.id, {
                                        name:
                                            selected.fullName?.trim() ||
                                            selected.name?.trim() ||
                                            guest.name,
                                        phoneNumber: selected.phoneNumber
                                            ? limitPhoneDigits(
                                                  String(selected.phoneNumber),
                                              )
                                            : guest.phoneNumber,
                                        email: selected.email || guest.email,
                                        nationality: (() => {
                                            if (!selected.nationality) {
                                                return guest.nationality;
                                            }
                                            const needle =
                                                selected.nationality.toLowerCase();
                                            const match =
                                                NATIONALITY_OPTIONS.find(
                                                    (option) =>
                                                        option.value ===
                                                            needle ||
                                                        option.label.toLowerCase() ===
                                                            needle ||
                                                        needle.includes(
                                                            option.value.replace(
                                                                '-',
                                                                ' ',
                                                            ),
                                                        ),
                                                );
                                            return (
                                                match?.value ||
                                                guest.nationality
                                            );
                                        })(),
                                    })
                                }
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <GroupTextField
                                    id={`${guest.id}-phone`}
                                    label="Phone Number"
                                    placeholder="Enter Phone Number"
                                    inputMode="tel"
                                    maxLength={PHONE_MAX_DIGITS}
                                    value={guest.phoneNumber}
                                    onChange={(phoneNumber) =>
                                        onChangeGuest(guest.id, {
                                            phoneNumber:
                                                limitPhoneDigits(phoneNumber),
                                        })
                                    }
                                />
                                <GroupTextField
                                    id={`${guest.id}-email`}
                                    label="Email Address"
                                    placeholder="Enter email address"
                                    type="email"
                                    value={guest.email}
                                    onChange={(email) =>
                                        onChangeGuest(guest.id, { email })
                                    }
                                />
                                <GroupSelectField
                                    id={`${guest.id}-room-type`}
                                    label="Room Type"
                                    placeholder={
                                        roomTypeOptions.length === 0
                                            ? 'Select rooms first'
                                            : 'Select room type'
                                    }
                                    value={guest.roomTypeId}
                                    options={roomTypeOptions}
                                    disabled={roomTypeOptions.length === 0}
                                    onChange={(roomTypeId) =>
                                        onChangeGuest(guest.id, {
                                            roomTypeId,
                                            roomNumber: '',
                                        })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <GroupSelectField
                                    id={`${guest.id}-nationality`}
                                    label="Nationality"
                                    value={guest.nationality}
                                    options={NATIONALITY_OPTIONS}
                                    onChange={(nationality) =>
                                        onChangeGuest(guest.id, {
                                            nationality,
                                        })
                                    }
                                />
                                <GroupSelectField
                                    id={`${guest.id}-room-number`}
                                    label="Room Number"
                                    placeholder={roomNumberPlaceholder(
                                        guest.roomTypeId,
                                        roomNumberOptions.length,
                                        hasStayDates,
                                    )}
                                    value={guest.roomNumber}
                                    options={roomNumberOptions}
                                    disabled={
                                        !guest.roomTypeId || !hasStayDates
                                    }
                                    onChange={(roomNumber) =>
                                        onChangeGuest(guest.id, {
                                            roomNumber,
                                        })
                                    }
                                />
                                <GroupSelectField
                                    id={`${guest.id}-guest-type`}
                                    label="Guest Type"
                                    value={guest.guestType}
                                    options={GUEST_TYPE_OPTIONS}
                                    onChange={(guestType) =>
                                        onChangeGuest(guest.id, {
                                            guestType:
                                                guestType as GroupGuestDraft['guestType'],
                                        })
                                    }
                                />
                                {index === extras.length - 1 && (
                                    <div className="flex h-11 items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={onAddGuest}
                                            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-orion-blue"
                                        >
                                            <UserRoundPlus className="size-4" />
                                            Add Guest
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
