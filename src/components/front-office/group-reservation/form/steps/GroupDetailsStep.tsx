'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    GROUP_TYPE_OPTIONS,
    NATIONALITY_OPTIONS,
    PHONE_MAX_DIGITS,
    groupFieldClass,
    groupPanelClass,
    groupPanelSubtitleClass,
    groupPanelTitleClass,
    limitPhoneDigits,
} from '../../constants';
import type { GroupBookingDraft, GroupGuestDraft, GroupType } from '../../types';
import {
    GroupDateField,
    GroupSelectField,
    GroupTextField,
    GroupTimeField,
} from '../GroupFormFields';
import { GroupGuestNameField } from '../GroupGuestNameField';
import { IdUploadDropzone } from '../IdUploadDropzone';

export function GroupDetailsStep({
    draft,
    idFile,
    master,
    roomTypeOptions,
    roomNumberOptions,
    heading = 'Create group reservation',
    allowPastArrival = false,
    onChange,
    onIdFile,
    onMasterRoom,
}: {
    draft: GroupBookingDraft;
    idFile: File | null;
    master: GroupGuestDraft;
    roomTypeOptions: { value: string; label: string }[];
    roomNumberOptions: { value: string; label: string }[];
    heading?: string;
    allowPastArrival?: boolean;
    onChange: (patch: Partial<GroupBookingDraft>) => void;
    onIdFile: (file: File | null) => void;
    onMasterRoom: (patch: Partial<GroupGuestDraft>) => void;
}) {
    return (
        <div className={cn(groupPanelClass, 'p-4')}>
            <h2 className={groupPanelTitleClass}>{heading}</h2>
            <p className={groupPanelSubtitleClass}>Enter reservation details</p>

            <div className="mt-4 space-y-4">
                <GroupGuestNameField
                    id="contact-name"
                    label="Master"
                    required
                    value={draft.contactName}
                    onValueChange={(contactName) =>
                        onChange({ contactName })
                    }
                    onSelect={(guest) => {
                        onChange({
                            contactName:
                                guest.fullName?.trim() ||
                                guest.name?.trim() ||
                                draft.contactName,
                            phoneNumber: limitPhoneDigits(
                                String(guest.phoneNumber || ''),
                            ),
                            email: guest.email || draft.email,
                        });
                        if (guest.nationality) {
                            const needle = guest.nationality.toLowerCase();
                            const match = NATIONALITY_OPTIONS.find(
                                (option) =>
                                    option.value === needle ||
                                    option.label.toLowerCase() === needle ||
                                    needle.includes(
                                        option.value.replace('-', ' '),
                                    ),
                            );
                            onMasterRoom({
                                nationality: match?.value || 'other',
                            });
                        }
                    }}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <GroupSelectField
                        id="group-type"
                        label="Group Type"
                        placeholder="Select group type"
                        required
                        value={draft.groupType}
                        options={GROUP_TYPE_OPTIONS}
                        onChange={(groupType) =>
                            onChange({ groupType: groupType as GroupType })
                        }
                    />
                    <GroupTextField
                        id="phone"
                        label="Phone Number"
                        placeholder="Enter Phone number"
                        required
                        inputMode="tel"
                        maxLength={PHONE_MAX_DIGITS}
                        value={draft.phoneNumber}
                        onChange={(phoneNumber) =>
                            onChange({
                                phoneNumber: limitPhoneDigits(phoneNumber),
                            })
                        }
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <GroupTextField
                        id="email"
                        label="Email Address"
                        placeholder="Enter your Email Address"
                        type="email"
                        value={draft.email}
                        onChange={(email) => onChange({ email })}
                    />
                    <div>
                        <GroupTextField
                            id="guest-count"
                            label="Number of Guests"
                            placeholder="Including the Master"
                            type="number"
                            min={1}
                            max={50}
                            required
                            value={draft.numberOfGuests}
                            onChange={(numberOfGuests) => {
                                const cleaned = numberOfGuests.replace(
                                    /[^\d]/g,
                                    '',
                                );
                                onChange({
                                    numberOfGuests: cleaned
                                        ? String(
                                              Math.min(
                                                  50,
                                                  Math.max(
                                                      1,
                                                      Math.floor(
                                                          Number(cleaned),
                                                      ),
                                                  ),
                                              ),
                                          )
                                        : '',
                                });
                            }}
                            onBlur={() => {
                                const count = Number(draft.numberOfGuests);
                                if (!Number.isFinite(count) || count < 1) {
                                    onChange({ numberOfGuests: '1' });
                                }
                            }}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Includes the Master. You can select at most this
                            many rooms.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <GroupDateField
                        id="arrival-date"
                        label="Arrival Date"
                        required
                        disablePast={!allowPastArrival}
                        value={draft.arrivalDate}
                        onChange={(arrivalDate) => onChange({ arrivalDate })}
                    />
                    <GroupTimeField
                        id="arrival-time"
                        label="Expected Arrival Time"
                        value={draft.expectedArrivalTime}
                        onChange={(expectedArrivalTime) =>
                            onChange({ expectedArrivalTime })
                        }
                    />
                    <GroupDateField
                        id="departure-date"
                        label="Departure Date"
                        required
                        disablePast={!allowPastArrival}
                        value={draft.departureDate}
                        onChange={(departureDate) =>
                            onChange({ departureDate })
                        }
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <GroupSelectField
                        id="master-room-type"
                        label="Master Room Type"
                        placeholder={
                            roomTypeOptions.length === 0
                                ? 'Select rooms on the right first'
                                : 'Select room type'
                        }
                        required
                        value={master.roomTypeId}
                        options={roomTypeOptions}
                        disabled={roomTypeOptions.length === 0}
                        onChange={(roomTypeId) =>
                            onMasterRoom({ roomTypeId, roomNumber: '' })
                        }
                    />
                    <GroupSelectField
                        id="master-room-number"
                        label="Master Room Number"
                        placeholder={
                            !master.roomTypeId
                                ? 'Select room type first'
                                : !draft.arrivalDate || !draft.departureDate
                                  ? 'Select arrival and departure first'
                                  : roomNumberOptions.length === 0
                                    ? 'No rooms free for these dates'
                                    : 'Select room number'
                        }
                        required
                        value={master.roomNumber}
                        options={roomNumberOptions}
                        disabled={
                            !master.roomTypeId ||
                            !draft.arrivalDate ||
                            !draft.departureDate
                        }
                        onChange={(roomNumber) => onMasterRoom({ roomNumber })}
                    />
                </div>

                <div className="rounded-md border border-gray-200 p-3">
                    <p className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-foreground">
                            Upload ID number
                        </span>
                        <span className="text-xs text-muted-foreground">
                            (Optional)
                        </span>
                    </p>
                    <Input
                        id="id-number"
                        value={draft.idNumber}
                        placeholder="Enter ID number"
                        onChange={(e) => onChange({ idNumber: e.target.value })}
                        className={cn(groupFieldClass, 'mt-2.5')}
                    />
                    <div className="mt-2.5">
                        <IdUploadDropzone file={idFile} onFile={onIdFile} />
                    </div>
                </div>
            </div>
        </div>
    );
}
