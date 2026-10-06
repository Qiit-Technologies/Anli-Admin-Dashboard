'use client';

import {
    createGroupGuest,
    createGroupReservation,
    deleteGroupReservation,
    updateGroupReservation,
    deleteGuestReservation,
    validateGroupParty,
} from '@/app/actions/group-reservation';
import { getCustomCharges } from '@/app/actions/hotel';
import { applyWaiver } from '@/app/actions/guest';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/useUser';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';
import { differenceInCalendarDays } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import {
    CREATE_STEPS,
    groupPanelClass,
    groupPanelTitleClass,
} from '../constants';
import type {
    AllocatedRoom,
    CreateStep,
    GroupBillingMode,
    GroupBooking,
    GroupBookingDraft,
    GroupGuestDraft,
    GroupPaymentMethod,
    RoomTypeOption,
} from '../types';
import {
    roomsForType,
    isRoomFreeForStay,
    useGroupOptions,
    type RoomRecord,
} from '../useGroupOptions';
import { AddGuestSection } from './AddGuestSection';
import {
    groupPartyErrors,
    isValidGroupPhone,
    resolveStay,
    stayDateKey,
} from './group-party';
import { allocateShares } from './groupBilling';
import { RoomsSelectionPanel } from './RoomsSelectionPanel';
import { AllocationStep } from './steps/AllocationStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { GroupDetailsStep } from './steps/GroupDetailsStep';
import {
    PaymentStep,
    type GroupPaymentAdjustments,
} from './steps/PaymentStep';

function notify(title: string, description: string, type: 'success' | 'error' = 'success') {
    toast.custom(() => (
        <Toast title={title} description={description} type={type} />
    ));
}

function createGuest(isMaster = false): GroupGuestDraft {
    return {
        id:
            typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `guest-${Date.now()}`,
        name: '',
        phoneNumber: '',
        email: '',
        roomTypeId: '',
        nationality: 'nigeria',
        roomNumber: '',
        guestType: 'adult',
        isMaster,
    };
}

function leftoverRoomTypeId(
    quantities: Record<string, number>,
    guests: GroupGuestDraft[],
) {
    const used: Record<string, number> = {};
    guests.forEach((guest) => {
        if (guest.isMaster || !guest.roomTypeId) return;
        used[guest.roomTypeId] = (used[guest.roomTypeId] || 0) + 1;
    });
    const leftover = Object.entries(quantities).find(
        ([id, qty]) => qty > (used[id] || 0),
    );
    if (leftover) return leftover[0];
    return (
        Object.entries(quantities).find(([, qty]) => qty > 0)?.[0] || ''
    );
}

function selectedTypeIds(quantities: Record<string, number>) {
    return new Set(
        Object.entries(quantities)
            .filter(([, qty]) => qty > 0)
            .map(([id]) => id),
    );
}

function sizedGuestList(
    prev: GroupGuestDraft[],
    draft: Pick<
        GroupBookingDraft,
        'contactName' | 'phoneNumber' | 'email' | 'numberOfGuests'
    >,
): GroupGuestDraft[] {
    const requested = Math.floor(Number(draft.numberOfGuests));
    if (!Number.isFinite(requested) || requested < 1) return prev;
    const count = requested;
    const masterSource =
        prev.find((guest) => guest.isMaster) || prev[0] || createGuest(true);
    const others = prev.filter((guest) => guest.id !== masterSource.id);
    const kept = others.slice(0, count - 1);
    const extra = Array.from(
        { length: Math.max(0, count - 1 - kept.length) },
        () => createGuest(false),
    );
    const next: GroupGuestDraft[] = [
        {
            ...masterSource,
            isMaster: true,
            name: draft.contactName.trim(),
            phoneNumber: draft.phoneNumber,
            email: draft.email,
        },
        ...kept,
        ...extra,
    ];
    if (
        prev.length === next.length &&
        prev.every((guest, index) => {
            const other = next[index];
            return (
                guest.id === other.id &&
                guest.name === other.name &&
                guest.phoneNumber === other.phoneNumber &&
                guest.email === other.email &&
                guest.isMaster === other.isMaster
            );
        })
    ) {
        return prev;
    }
    return next;
}

function buildRooms(
    quantities: Record<string, number>,
    roomTypes: RoomTypeOption[],
    inventory: RoomRecord[],
    guests: GroupGuestDraft[],
    arrivalDate?: Date | null,
    departureDate?: Date | null,
): AllocatedRoom[] {
    const rooms: AllocatedRoom[] = [];
    const used = new Set<string>();
    const seenTypes = new Set<string>();
    const remaining = [...guests];
    roomTypes.forEach((room) => {
        if (seenTypes.has(room.id)) return;
        seenTypes.add(room.id);
        const qty = quantities[room.id] ?? 0;
        if (qty <= 0) return;
        const available = roomsForType(
            inventory,
            room.id,
            arrivalDate,
            departureDate,
        ).filter((item) => !used.has(item.roomNumber));
        for (let i = 0; i < qty; i += 1) {
            const preferredIndex = remaining.findIndex(
                (guest) =>
                    guest.roomTypeId === room.id &&
                    guest.roomNumber &&
                    !used.has(guest.roomNumber),
            );
            const typeIndex =
                preferredIndex >= 0
                    ? preferredIndex
                    : remaining.findIndex(
                          (guest) => guest.roomTypeId === room.id,
                      );
            const guest =
                typeIndex >= 0
                    ? remaining.splice(typeIndex, 1)[0]
                    : undefined;
            const picked = available.find(
                (item) =>
                    item.roomNumber === guest?.roomNumber &&
                    !used.has(item.roomNumber),
            );
            const roomNumber = picked?.roomNumber || '';
            if (roomNumber) used.add(roomNumber);
            rooms.push({
                id: `${room.id}-${i}`,
                roomNumber,
                roomTypeId: room.id,
                guestIds: guest ? [guest.id] : [],
            });
        }
    });
    return rooms;
}

function stepOneError({
    guestCount,
    namedCount,
    totalRooms,
    selectedRooms,
    guests,
}: {
    guestCount: number;
    namedCount: number;
    totalRooms: number;
    selectedRooms: RoomTypeOption[];
    guests: GroupGuestDraft[];
}): { title: string; description: string } | null {
    if (!Number.isFinite(guestCount) || guestCount < 1) {
        return {
            title: 'Number of guests required',
            description:
                'Enter how many guests are in this group, including the Master.',
        };
    }
    if (selectedRooms.length === 0 || totalRooms < 1) {
        return {
            title: 'Rooms required',
            description:
                'Select room types and quantities on the right. Guest room types are limited to those rooms.',
        };
    }
    if (totalRooms !== guestCount) {
        return {
            title:
                totalRooms > guestCount
                    ? 'Too many rooms'
                    : 'Not enough rooms',
            description:
                totalRooms > guestCount
                    ? `This group has ${guestCount} guest${guestCount === 1 ? '' : 's'}, including the Master. Select exactly ${guestCount} room${guestCount === 1 ? '' : 's'}.`
                    : `Select one room per guest (${guestCount} guest${guestCount === 1 ? '' : 's'}, including the Master).`,
        };
    }
    if (namedCount !== guestCount) {
        const missing = Math.max(guestCount - namedCount, 0);
        return {
            title: 'Guest names incomplete',
            description: `Name all ${guestCount} guests. The Master counts as one of them. ${missing} name${missing === 1 ? '' : 's'} still missing.`,
        };
    }
    if (guests.some((guest) => !guest.roomTypeId)) {
        return {
            title: 'Room type required',
            description:
                'Choose a room type for every guest from the rooms selected on the right. The Master is one of these guests, not an extra room.',
        };
    }
    if (guests.some((guest) => !guest.roomNumber.trim())) {
        return {
            title: 'Room number required',
            description:
                'Choose a free room number for every guest for the selected stay dates.',
        };
    }
    if (guests.some((guest) => !isValidGroupPhone(guest.phoneNumber))) {
        return {
            title: 'Phone number required',
            description:
                'Every guest needs an 11-digit phone number, including the Master.',
        };
    }
    return null;
}

function draftFromSeed(seed?: GroupBooking): GroupBookingDraft {
    if (!seed) {
        return {
            groupName: '',
            groupType: 'corporate',
            contactName: '',
            phoneNumber: '',
            email: '',
            numberOfGuests: '1',
            arrivalDate: undefined,
            expectedArrivalTime: '02:30 PM',
            departureDate: undefined,
            purposeOfVisit: '',
            idNumber: '',
        };
    }
    return {
        groupName: seed.name,
        groupType: seed.groupType,
        contactName: seed.contactName,
        phoneNumber: seed.contactPhone,
        email: seed.contactEmail || '',
        numberOfGuests: String(Math.max(1, seed.guests.length || 1)),
        arrivalDate: seed.arrivalIso ? new Date(seed.arrivalIso) : undefined,
        expectedArrivalTime: '02:30 PM',
        departureDate: seed.departureIso
            ? new Date(seed.departureIso)
            : undefined,
        purposeOfVisit: seed.purposeOfVisit || '',
        idNumber: '',
    };
}

function guestsFromSeed(seed?: GroupBooking): GroupGuestDraft[] {
    if (!seed || seed.guests.length === 0) return [createGuest(true)];
    const masterIndex = Math.max(
        0,
        seed.guests.findIndex(
            (guest) =>
                guest.name.trim().toLowerCase() ===
                seed.contactName.trim().toLowerCase(),
        ),
    );
    return seed.guests.map((guest, index) => ({
        id: guest.id,
        name: guest.name,
        phoneNumber: guest.phoneNumber,
        email: guest.email,
        roomTypeId: '',
        nationality: guest.nationality || 'nigeria',
        roomNumber: guest.roomNumber === '—' ? '' : guest.roomNumber,
        guestType: guest.guestType,
        isMaster: index === masterIndex,
    }));
}

export function CreateGroupBookingForm({
    onCreated,
    onCancel,
    seed,
}: {
    onCreated: (groupCode: string) => void;
    onCancel?: () => void;
    seed?: GroupBooking;
}) {
    const { user } = useUser();

    const [step, setStep] = useState<CreateStep>(1);
    const [draft, setDraft] = useState<GroupBookingDraft>(() =>
        draftFromSeed(seed),
    );
    const [idFile, setIdFile] = useState<File | null>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [guests, setGuests] = useState<GroupGuestDraft[]>(() =>
        guestsFromSeed(seed),
    );
    const [rooms, setRooms] = useState<AllocatedRoom[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<GroupPaymentMethod | ''>(
        seed?.paymentMethod || '',
    );
    const [receivingAccount, setReceivingAccount] = useState('');
    const [billingMode, setBillingMode] = useState<GroupBillingMode>(
        seed?.billingMode === 'individual' ? 'individual' : 'group',
    );
    const [deposit, setDeposit] = useState(
        seed?.deposit ? String(seed.deposit) : '',
    );
    const [adjustments, setAdjustments] = useState<GroupPaymentAdjustments>({
        standardize: false,
        standardRate: '',
        discountType: '',
        discountValue: '',
        waiveVat: false,
        waiveServiceCharge: false,
        waiveTip: false,
        waiveCustomCharges: false,
        waiverReason: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const submitLock = useRef(false);
    const { roomTypes, rooms: inventoryRooms, loading: inventoryLoading } =
        useGroupOptions();
    const { data: customChargesData } = useSWR('custom-charges', async () => {
        const result = await getCustomCharges();
        if ('error' in result) return [];
        return (result.data || []).filter(
            (charge: { isActive?: boolean }) => charge.isActive === true,
        );
    });
    const [seedRoomsReady, setSeedRoomsReady] = useState(!seed);

    useEffect(() => {
        if (!seed || seedRoomsReady || roomTypes.length === 0) return;
        const typeIdFor = (roomName: string) =>
            roomTypes.find(
                (room) =>
                    room.name.trim().toLowerCase() ===
                    roomName.trim().toLowerCase(),
            )?.id || '';
        setGuests((prev) =>
            prev.map((guest) => {
                const source = seed.guests.find((item) => item.id === guest.id);
                return {
                    ...guest,
                    roomTypeId: typeIdFor(source?.roomName || ''),
                };
            }),
        );
        const nextQuantities: Record<string, number> = {};
        seed.guests.forEach((guest) => {
            const typeId = typeIdFor(guest.roomName);
            if (!typeId) return;
            nextQuantities[typeId] = (nextQuantities[typeId] || 0) + 1;
        });
        setQuantities(nextQuantities);
        setSeedRoomsReady(true);
    }, [seed, seedRoomsReady, roomTypes]);

    const nights = useMemo(() => {
        if (!draft.arrivalDate || !draft.departureDate) return 1;
        const diff = differenceInCalendarDays(
            draft.departureDate,
            draft.arrivalDate,
        );
        return diff > 0 ? diff : 1;
    }, [draft.arrivalDate, draft.departureDate]);

    const totalRooms = Object.values(quantities).reduce(
        (sum, qty) => sum + qty,
        0,
    );
    const catalogRoomTotal = roomTypes.reduce((sum, room) => {
        const qty = quantities[room.id] ?? 0;
        return sum + qty * room.pricePerNight * nights;
    }, 0);
    const org = (user as { hotel?: { organization?: Record<string, unknown> } })
        ?.hotel?.organization;
    const vatRate = Number(
        org?.frontOfficeVatRate ?? org?.vatRate ?? 7.5,
    );
    const serviceChargeRate = Number(
        org?.frontOfficeServiceChargeRate ?? org?.serviceChargeRate ?? 5,
    );
    const tipRate = Number(org?.frontOfficeTipRate ?? org?.tipRate ?? 0);
    const standardRate = Math.max(0, Number(adjustments.standardRate) || 0);
    const roomSubtotal =
        adjustments.standardize && standardRate > 0
            ? totalRooms * standardRate * nights
            : catalogRoomTotal;
    const discountRaw = Math.max(0, Number(adjustments.discountValue) || 0);
    const discountAmount =
        adjustments.discountType === 'PERCENTAGE'
            ? roomSubtotal * (Math.min(discountRaw, 100) / 100)
            : adjustments.discountType === 'FIXED_AMOUNT'
              ? Math.min(discountRaw, roomSubtotal)
              : 0;
    const afterDiscount = Math.max(0, roomSubtotal - discountAmount);
    const unwaivedVat = afterDiscount * (vatRate / 100);
    const unwaivedServiceCharge = afterDiscount * (serviceChargeRate / 100);
    const unwaivedTip = afterDiscount * (tipRate / 100);
    const customChargeLines = (customChargesData || [])
        .filter((charge: { rate?: number }) => Number(charge.rate) > 0)
        .map(
            (charge: { id: number; name: string; rate: number }) => {
                const rate = Math.min(Math.max(Number(charge.rate) || 0, 0), 100);
                return {
                    id: charge.id,
                    name: charge.name,
                    rate,
                    amount: afterDiscount * (rate / 100),
                };
            },
        );
    const unwaivedCustomCharges = customChargeLines.reduce(
        (sum, charge) => sum + charge.amount,
        0,
    );
    const vat = adjustments.waiveVat ? 0 : unwaivedVat;
    const serviceCharge = adjustments.waiveServiceCharge
        ? 0
        : unwaivedServiceCharge;
    const tip = adjustments.waiveTip ? 0 : unwaivedTip;
    const customChargesTotal = adjustments.waiveCustomCharges
        ? 0
        : unwaivedCustomCharges;
    const totalAmount =
        afterDiscount + vat + serviceCharge + tip + customChargesTotal;
    const depositAmount = Math.min(
        Math.max(0, Number(deposit) || 0),
        totalAmount,
    );
    const namedGuests = guests.filter((guest) => guest.name.trim());
    const guestCount = guests.length;
    const selectedRooms = useMemo(
        () => roomTypes.filter((room) => (quantities[room.id] ?? 0) > 0),
        [roomTypes, quantities],
    );
    const roomCountByType = useMemo(() => {
        const counts: Record<string, number> = {};
        inventoryRooms.forEach((room) => {
            if (!room.roomTypeId) return;
            if (
                draft.arrivalDate &&
                draft.departureDate &&
                !isRoomFreeForStay(
                    room,
                    draft.arrivalDate,
                    draft.departureDate,
                )
            ) {
                return;
            }
            counts[room.roomTypeId] = (counts[room.roomTypeId] || 0) + 1;
        });
        return counts;
    }, [inventoryRooms, draft.arrivalDate, draft.departureDate]);

    // Guest list length is the number entered, and the Master is guest 1 of that number.
    useEffect(() => {
        setGuests((prev) => sizedGuestList(prev, draft));
    }, [draft]);

    // Drop room numbers that are no longer free for the selected stay dates.
    useEffect(() => {
        if (!draft.arrivalDate || !draft.departureDate) return;
        setGuests((prev) => {
            let changed = false;
            const next = prev.map((guest) => {
                if (!guest.roomNumber || !guest.roomTypeId) return guest;
                const stillFree = roomsForType(
                    inventoryRooms,
                    guest.roomTypeId,
                    draft.arrivalDate,
                    draft.departureDate,
                ).some((room) => room.roomNumber === guest.roomNumber);
                if (stillFree) return guest;
                changed = true;
                return { ...guest, roomNumber: '' };
            });
            return changed ? next : prev;
        });
    }, [draft.arrivalDate, draft.departureDate, inventoryRooms]);

    const extraTypeKey = guests
        .filter((guest) => !guest.isMaster)
        .map((guest) => guest.roomTypeId)
        .join('|');

    useEffect(() => {
        const allowed = selectedTypeIds(quantities);
        setGuests((prev) => {
            let changed = false;
            const cleared = prev.map((guest) => {
                if (guest.isMaster) return guest;
                if (!guest.roomTypeId || allowed.has(guest.roomTypeId)) {
                    return guest;
                }
                changed = true;
                return { ...guest, roomTypeId: '', roomNumber: '' };
            });
            const fallbackType =
                leftoverRoomTypeId(quantities, cleared) ||
                [...allowed][0] ||
                '';
            const next = cleared.map((guest) => {
                if (guest.isMaster) return guest;
                if (guest.roomTypeId && allowed.has(guest.roomTypeId)) {
                    return guest;
                }
                // Only fill guests that still have no type — do not reassign.
                if (guest.roomTypeId || !fallbackType) {
                    return guest;
                }
                changed = true;
                return { ...guest, roomTypeId: fallbackType, roomNumber: '' };
            });
            return changed ? next : prev;
        });
    }, [quantities, extraTypeKey]);

    // Keep selected room quantities within the guest count.
    useEffect(() => {
        const guestLimit = Math.max(
            1,
            Math.floor(Number(draft.numberOfGuests) || 1),
        );
        setQuantities((prev) => {
            const total = Object.values(prev).reduce((sum, qty) => sum + qty, 0);
            if (total <= guestLimit) return prev;
            const next = { ...prev };
            let excess = total - guestLimit;
            for (const id of Object.keys(next).reverse()) {
                if (excess <= 0) break;
                const current = next[id] || 0;
                const cut = Math.min(current, excess);
                next[id] = current - cut;
                excess -= cut;
            }
            return next;
        });
    }, [draft.numberOfGuests]);

    const party = useMemo(
        () => sizedGuestList(guests, draft),
        [guests, draft],
    );
    const stays = useMemo(
        () => party.map((guest) => resolveStay(guest, rooms)),
        [party, rooms],
    );
    const allowPastArrival = user?.roles?.name === 'administrator';

    const canContinue = (() => {
        if (submitting) return false;
        if (step === 1) {
            const guestCount = Math.max(
                1,
                Math.floor(Number(draft.numberOfGuests) || 0),
            );
            if (!Number.isFinite(guestCount) || guestCount < 1) return false;
            if (
                !draft.contactName.trim() ||
                !isValidGroupPhone(draft.phoneNumber) ||
                !draft.arrivalDate ||
                !draft.departureDate
            ) {
                return false;
            }
            if (draft.arrivalDate >= draft.departureDate) return false;
            if (totalRooms !== guestCount) return false;
            if (inventoryLoading) return false;
            return !stepOneError({
                guestCount,
                namedCount: guests.filter((guest) => guest.name.trim()).length,
                totalRooms,
                selectedRooms,
                guests,
            });
        }
        if (step === 2) {
            return party.every((guest) => {
                const stay = resolveStay(guest, rooms);
                return Boolean(stay.roomNumber && stay.roomTypeId);
            });
        }
        if (step === 3) {
            const paying = Math.max(0, Number(deposit) || 0) > 0;
            if (paying && !paymentMethod) return false;
            if ((paying || paymentMethod) && !receivingAccount.trim()) {
                return false;
            }
            return true;
        }
        return true;
    })();

    /**
     * One child reservation per guest, on the room already validated for these
     * dates. A failure rolls the group and every guest created in this submit
     * back, so a guest is never dropped from a booking that was accepted.
     */
    const createChildReservations = async (groupId: number) => {
        const fallbackEmail = draft.email.trim() || 'guest@orion.local';
        const roomCharges = stays.map((stay) => {
            const roomType = roomTypes.find(
                (item) => item.id === stay.roomTypeId,
            );
            const nightly =
                adjustments.standardize && standardRate > 0
                    ? standardRate
                    : roomType?.pricePerNight || 0;
            return nightly * nights;
        });
        const deposits = allocateShares(depositAmount, roomCharges);
        const fixedDiscounts =
            adjustments.discountType === 'FIXED_AMOUNT'
                ? allocateShares(discountAmount, roomCharges)
                : stays.map(() => 0);
        const createdGuestIds: number[] = [];

        try {
            for (const [index, stay] of stays.entries()) {
                const roomType = roomTypes.find(
                    (item) => item.id === stay.roomTypeId,
                );
                if (!roomType) {
                    throw new Error(
                        `${stay.guest.name.trim() || 'Guest'}: no room type selected.`,
                    );
                }
                const percentDiscount =
                    adjustments.discountType === 'PERCENTAGE'
                        ? Math.min(
                              100,
                              Math.max(0, Number(adjustments.discountValue) || 0),
                          )
                        : 0;
                const fixedDiscount = fixedDiscounts[index] || 0;
                let discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | undefined;
                let discountValue: number | undefined;
                if (percentDiscount > 0) {
                    discountType = 'PERCENTAGE';
                    discountValue = percentDiscount;
                } else if (fixedDiscount > 0) {
                    discountType = 'FIXED_AMOUNT';
                    discountValue = fixedDiscount;
                }
                const created = await createGroupGuest(groupId, {
                    fullName: stay.guest.name.trim(),
                    email:
                        stay.guest.email.trim() ||
                        fallbackEmail.replace('@', `+${index + 1}@`),
                    phoneNumber: stay.guest.phoneNumber.replace(/\D/g, ''),
                    nationality: stay.guest.nationality,
                    roomtype: Number(roomType.id),
                    roomNumber: stay.roomNumber,
                    property: user?.hotel?.name || '',
                    startDate: stayDateKey(draft.arrivalDate!),
                    endDate: stayDateKey(draft.departureDate!),
                    bookingAmount: roomCharges[index],
                    amountPaid: deposits[index] || 0,
                    discountType,
                    discountValue,
                    includeTip: tipRate > 0,
                    paymentMethod: paymentMethod || undefined,
                    receivingAccount: receivingAccount || undefined,
                });
                createdGuestIds.push(created.guestId);
                if (
                    adjustments.waiveVat ||
                    adjustments.waiveServiceCharge ||
                    adjustments.waiveTip ||
                    adjustments.waiveCustomCharges
                ) {
                    const waiver = await applyWaiver(created.guestId, {
                        vat: adjustments.waiveVat,
                        serviceCharge: adjustments.waiveServiceCharge,
                        tip: adjustments.waiveTip,
                        customCharges: adjustments.waiveCustomCharges,
                        waiverReason: adjustments.waiverReason || undefined,
                    });
                    if ('error' in waiver && waiver.error) {
                        throw new Error(
                            waiver.error ||
                                'Charge waiver could not be applied. The booking was rolled back.',
                        );
                    }
                }
            }
        } catch (error) {
            await Promise.all(
                createdGuestIds.map((guestId) =>
                    deleteGuestReservation(guestId).catch(() => undefined),
                ),
            );
            throw error;
        }
        return createdGuestIds.length;
    };

    const createReservation = async () => {
        if (submitLock.current || submitting) return;
        submitLock.current = true;
        setSubmitting(true);
        const localErrors = groupPartyErrors({
            arrivalDate: draft.arrivalDate,
            departureDate: draft.departureDate,
            guests: party,
            rooms,
            allowPastArrival,
            inventory: inventoryRooms,
        });
        if (localErrors.length > 0) {
            notify('Cannot create group', localErrors.slice(0, 3).join(' '), 'error');
            submitLock.current = false;
            setSubmitting(false);
            return;
        }
        try {
            if (seed?.backendId) {
                await updateGroupReservation(seed.backendId, {
                    groupName: draft.contactName.trim() || draft.groupName,
                    groupType: draft.groupType,
                    contactName: draft.contactName.trim(),
                    contactPhone: draft.phoneNumber,
                    contactEmail: draft.email,
                    arrivalDate: draft.arrivalDate
                        ? stayDateKey(draft.arrivalDate)
                        : undefined,
                    departureDate: draft.departureDate
                        ? stayDateKey(draft.departureDate)
                        : undefined,
                    expectedArrivalTime: draft.expectedArrivalTime,
                    billingMode: billingMode.toUpperCase() as
                        | 'GROUP'
                        | 'INDIVIDUAL',
                    paymentMethod: paymentMethod || undefined,
                    numberOfGuests: party.length,
                    numberOfRooms: stays.length,
                    totalAmount,
                    totalDeposits: depositAmount,
                    totalDiscounts: discountAmount,
                    outstandingBalance: Math.max(0, totalAmount - depositAmount),
                });
                notify('Group updated', 'Group reservation details saved.');
                onCreated(seed.id);
                return;
            }
            await validateGroupParty({
                arrivalDate: stayDateKey(draft.arrivalDate!),
                departureDate: stayDateKey(draft.departureDate!),
                guests: stays.map((stay) => ({
                    fullName: stay.guest.name.trim(),
                    phoneNumber: stay.guest.phoneNumber.replace(/\D/g, ''),
                    roomTypeId: Number(stay.roomTypeId),
                    roomNumber: stay.roomNumber,
                })),
            });
            const response = await createGroupReservation({
                groupName: draft.contactName.trim(),
                groupType: draft.groupType,
                contactName: draft.contactName.trim(),
                contactPhone: draft.phoneNumber,
                contactEmail: draft.email,
                arrivalDate: draft.arrivalDate
                    ? stayDateKey(draft.arrivalDate)
                    : undefined,
                departureDate: draft.departureDate
                    ? stayDateKey(draft.departureDate)
                    : undefined,
                expectedArrivalTime: draft.expectedArrivalTime,
                billingMode: billingMode.toUpperCase() as
                    | 'GROUP'
                    | 'INDIVIDUAL',
                paymentMethod: paymentMethod || undefined,
                numberOfGuests: party.length,
                numberOfRooms: stays.length,
                totalAmount,
                totalDeposits: depositAmount,
                totalDiscounts: discountAmount,
                outstandingBalance: Math.max(0, totalAmount - depositAmount),
            });

            const groupId = Number(response?.id);
            if (!Number.isFinite(groupId)) {
                throw new TypeError('Group was created but no id was returned.');
            }
            let createdCount = 0;
            try {
                createdCount = await createChildReservations(groupId);
            } catch (error) {
                await deleteGroupReservation(groupId).catch(() => undefined);
                throw error;
            }
            notify(
                'Group created',
                `${createdCount} guest reservation(s) created under this group.`,
            );
            onCreated(String(response?.groupCode || response?.id || ''));
        } catch (error: unknown) {
            notify(
                seed ? 'Failed to update group' : 'Failed to create group',
                getApiErrorMessage(error, 'Please try again.'),
                'error',
            );
        } finally {
            submitLock.current = false;
            setSubmitting(false);
        }
    };

    const goNext = async () => {
        if (step === 1) {
            const party = sizedGuestList(guests, draft);
            if (party !== guests) setGuests(party);
            const error = stepOneError({
                guestCount: party.length,
                namedCount: party.filter((guest) => guest.name.trim()).length,
                totalRooms,
                selectedRooms,
                guests: party,
            });
            if (error) {
                notify(error.title, error.description, 'error');
                return;
            }
            const dateErrors = groupPartyErrors({
                arrivalDate: draft.arrivalDate,
                departureDate: draft.departureDate,
                guests: party,
                rooms: [],
                allowPastArrival,
                requireRooms: false,
                inventory: inventoryRooms,
            });
            if (dateErrors.length > 0) {
                notify('Cannot continue', dateErrors[0], 'error');
                return;
            }
            const stays = party.map((guest) => resolveStay(guest, []));
            const missingRoom = stays.find((stay) => !stay.roomNumber);
            if (missingRoom) {
                notify(
                    'Room required',
                    `${missingRoom.guest.name.trim() || 'Guest'}: choose a free room for these dates.`,
                    'error',
                );
                return;
            }
            const roomReadyErrors = groupPartyErrors({
                arrivalDate: draft.arrivalDate,
                departureDate: draft.departureDate,
                guests: party,
                rooms: [],
                allowPastArrival,
                inventory: inventoryRooms,
            });
            if (roomReadyErrors.length > 0) {
                notify(
                    'Room not available',
                    roomReadyErrors.slice(0, 3).join(' '),
                    'error',
                );
                return;
            }
            try {
                setSubmitting(true);
                await validateGroupParty({
                    arrivalDate: stayDateKey(draft.arrivalDate!),
                    departureDate: stayDateKey(draft.departureDate!),
                    guests: stays.map((stay) => ({
                        fullName: stay.guest.name.trim(),
                        phoneNumber: stay.guest.phoneNumber.replace(/\D/g, ''),
                        roomTypeId: Number(stay.roomTypeId),
                        roomNumber: stay.roomNumber,
                    })),
                });
            } catch (error: unknown) {
                notify(
                    'Room not available',
                    getApiErrorMessage(
                        error,
                        'One or more rooms are already booked for these dates.',
                    ),
                    'error',
                );
                return;
            } finally {
                setSubmitting(false);
            }
            setRooms(
                buildRooms(
                    quantities,
                    roomTypes,
                    inventoryRooms,
                    party,
                    draft.arrivalDate,
                    draft.departureDate,
                ),
            );
        }
        if (step === 2) {
            const roomErrors = groupPartyErrors({
                arrivalDate: draft.arrivalDate,
                departureDate: draft.departureDate,
                guests: party,
                rooms,
                allowPastArrival,
                inventory: inventoryRooms,
            });
            if (roomErrors.length > 0) {
                notify(
                    'Rooms incomplete',
                    roomErrors.slice(0, 3).join(' '),
                    'error',
                );
                return;
            }
            try {
                setSubmitting(true);
                const stays = party.map((guest) => resolveStay(guest, rooms));
                await validateGroupParty({
                    arrivalDate: stayDateKey(draft.arrivalDate!),
                    departureDate: stayDateKey(draft.departureDate!),
                    guests: stays.map((stay) => ({
                        fullName: stay.guest.name.trim(),
                        phoneNumber: stay.guest.phoneNumber.replace(/\D/g, ''),
                        roomTypeId: Number(stay.roomTypeId),
                        roomNumber: stay.roomNumber,
                    })),
                });
            } catch (error: unknown) {
                notify(
                    'Room not available',
                    getApiErrorMessage(
                        error,
                        'One or more rooms are already booked for these dates.',
                    ),
                    'error',
                );
                return;
            } finally {
                setSubmitting(false);
            }
        }
        if (step === 3) {
            const paying = Math.max(0, Number(deposit) || 0) > 0;
            if (paying && !paymentMethod) {
                notify(
                    'Payment method required',
                    'Select a payment method when an amount is paid.',
                    'error',
                );
                return;
            }
            if ((paying || paymentMethod) && !receivingAccount.trim()) {
                notify(
                    'Account required',
                    'Select the account to pay into.',
                    'error',
                );
                return;
            }
        }
        if (step === 4) {
            void createReservation();
            return;
        }
        setStep((prev) => Math.min(4, prev + 1) as CreateStep);
    };

    const title = CREATE_STEPS.find((item) => item.step === step)?.label || '';

    return (
        <div className="space-y-4">
            {step === 1 ? (
                <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
                    <div className="flex min-h-0 flex-col gap-4">
                        <GroupDetailsStep
                            heading={
                                seed
                                    ? 'Edit group reservation'
                                    : 'Create group reservation'
                            }
                            draft={draft}
                            idFile={idFile}
                            allowPastArrival={allowPastArrival}
                            master={
                                guests.find((guest) => guest.isMaster) ||
                                guests[0]
                            }
                            roomTypeOptions={selectedRooms.map((room) => ({
                                value: room.id,
                                label: room.name,
                            }))}
                            roomNumberOptions={roomsForType(
                                inventoryRooms,
                                guests.find((guest) => guest.isMaster)
                                    ?.roomTypeId || '',
                                draft.arrivalDate,
                                draft.departureDate,
                            )
                                .filter((room) => {
                                    const taken = new Set(
                                        guests
                                            .filter((guest) => !guest.isMaster)
                                            .map((guest) => guest.roomNumber)
                                            .filter(Boolean),
                                    );
                                    const masterNumber =
                                        guests.find((guest) => guest.isMaster)
                                            ?.roomNumber || '';
                                    return (
                                        room.roomNumber === masterNumber ||
                                        !taken.has(room.roomNumber)
                                    );
                                })
                                .map((room) => ({
                                    value: room.roomNumber,
                                    label: room.roomNumber,
                                }))}
                            onMasterRoom={(patch) =>
                                setGuests((prev) =>
                                    prev.map((guest) =>
                                        guest.isMaster
                                            ? { ...guest, ...patch }
                                            : guest,
                                    ),
                                )
                            }
                            onChange={(patch) =>
                                setDraft((prev) => {
                                    const next = { ...prev, ...patch };
                                    if (patch.contactName !== undefined) {
                                        next.groupName =
                                            patch.contactName.trim();
                                    }
                                    return next;
                                })
                            }
                            onIdFile={setIdFile}
                        />
                        <AddGuestSection
                            guests={guests}
                            roomTypes={selectedRooms}
                            rooms={inventoryRooms}
                            arrivalDate={draft.arrivalDate}
                            departureDate={draft.departureDate}
                            onChangeGuest={(id, patch) =>
                                setGuests((prev) =>
                                    prev.map((guest) =>
                                        guest.id === id
                                            ? { ...guest, ...patch }
                                            : guest,
                                    ),
                                )
                            }
                            onAddGuest={() =>
                                setGuests((prev) => {
                                    const next = [
                                        ...prev,
                                        createGuest(false),
                                    ];
                                    setDraft((draftPrev) => ({
                                        ...draftPrev,
                                        numberOfGuests: String(next.length),
                                    }));
                                    return next;
                                })
                            }
                            onRemoveGuest={(id) =>
                                setGuests((prev) => {
                                    if (prev.length <= 1) return prev;
                                    const next = prev.filter(
                                        (guest) => guest.id !== id,
                                    );
                                    setDraft((draftPrev) => ({
                                        ...draftPrev,
                                        numberOfGuests: String(next.length),
                                    }));
                                    return next;
                                })
                            }
                        />
                    </div>
                    <div className="h-full min-h-[24rem]">
                        <RoomsSelectionPanel
                            rooms={roomTypes}
                            quantities={quantities}
                            availableByType={roomCountByType}
                            nights={nights}
                            guestLimit={Math.max(
                                1,
                                Math.floor(Number(draft.numberOfGuests) || 1),
                            )}
                            onQuantityChange={(roomId, quantity) => {
                                const guestLimit = Math.max(
                                    1,
                                    Math.floor(
                                        Number(draft.numberOfGuests) || 1,
                                    ),
                                );
                                setQuantities((prev) => {
                                    const ofType =
                                        roomCountByType[roomId] ?? 0;
                                    const inventoryMax = Math.max(0, ofType);
                                    const requested = Math.max(
                                        0,
                                        Math.min(quantity, inventoryMax),
                                    );
                                    const otherRooms = Object.entries(
                                        prev,
                                    ).reduce(
                                        (sum, [id, qty]) =>
                                            sum + (id === roomId ? 0 : qty),
                                        0,
                                    );
                                    if (otherRooms + requested > guestLimit) {
                                        notify(
                                            'Increase the number of guests',
                                            `This group has ${guestLimit} guest${guestLimit === 1 ? '' : 's'}, including the Master. Increase the number of guests before adding another room.`,
                                            'error',
                                        );
                                        return prev;
                                    }
                                    return {
                                        ...prev,
                                        [roomId]: requested,
                                    };
                                });
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className={cn(groupPanelClass, 'p-4')}>
                    <h2 className={cn(groupPanelTitleClass, 'mb-4')}>{title}</h2>
                    {step === 2 ? (
                        <AllocationStep
                            rooms={rooms}
                            roomTypes={roomTypes}
                            guestCount={guestCount}
                            guests={namedGuests}
                            onAssign={(roomId, guestId) => {
                                const target = rooms.find(
                                    (room) => room.id === roomId,
                                );
                                setRooms((prev) =>
                                    prev.map((room) => {
                                        if (room.id !== roomId) {
                                            return {
                                                ...room,
                                                guestIds: room.guestIds.filter(
                                                    (id) => id !== guestId,
                                                ),
                                            };
                                        }
                                        return {
                                            ...room,
                                            guestIds: guestId ? [guestId] : [],
                                        };
                                    }),
                                );
                                if (guestId && target) {
                                    setGuests((prev) =>
                                        prev.map((guest) =>
                                            guest.id === guestId
                                                ? {
                                                      ...guest,
                                                      roomTypeId:
                                                          target.roomTypeId ||
                                                          guest.roomTypeId,
                                                      roomNumber:
                                                          target.roomNumber ||
                                                          guest.roomNumber,
                                                  }
                                                : guest,
                                        ),
                                    );
                                }
                            }}
                            onAutoAllocate={() => {
                                const remaining = [...namedGuests];
                                const nextRooms = rooms.map((room) => {
                                    const matchIndex = remaining.findIndex(
                                        (guest) =>
                                            guest.roomTypeId ===
                                                room.roomTypeId ||
                                            !guest.roomTypeId,
                                    );
                                    if (matchIndex < 0) {
                                        return { ...room, guestIds: [] as string[] };
                                    }
                                    const [guest] = remaining.splice(
                                        matchIndex,
                                        1,
                                    );
                                    return {
                                        ...room,
                                        guestIds: [guest.id],
                                    };
                                });
                                setRooms(nextRooms);
                                setGuests((prev) =>
                                    prev.map((guest) => {
                                        const assigned = nextRooms.find(
                                            (room) =>
                                                room.guestIds.includes(guest.id),
                                        );
                                        if (!assigned?.roomNumber) return guest;
                                        return {
                                            ...guest,
                                            roomTypeId:
                                                assigned.roomTypeId ||
                                                guest.roomTypeId,
                                            roomNumber: assigned.roomNumber,
                                        };
                                    }),
                                );
                            }}
                        />
                    ) : null}
                    {step === 3 ? (
                        <PaymentStep
                            nights={nights}
                            totalRooms={totalRooms}
                            breakdown={{
                                roomSubtotal,
                                discountAmount,
                                afterDiscount,
                                vat,
                                serviceCharge,
                                grandTotal: totalAmount,
                                vatRate,
                                serviceChargeRate,
                                tip,
                                tipRate,
                                unwaivedVat,
                                unwaivedServiceCharge,
                                unwaivedTip,
                                customChargeLines,
                                unwaivedCustomCharges,
                                unwaivedTotal:
                                    afterDiscount +
                                    unwaivedVat +
                                    unwaivedServiceCharge +
                                    unwaivedTip +
                                    unwaivedCustomCharges,
                            }}
                            paymentMethod={paymentMethod}
                            receivingAccount={receivingAccount}
                            billingMode={billingMode}
                            deposit={deposit}
                            adjustments={adjustments}
                            onPaymentMethod={(value) => {
                                setPaymentMethod(value);
                                setReceivingAccount('');
                            }}
                            onReceivingAccount={setReceivingAccount}
                            onBillingMode={setBillingMode}
                            onDeposit={setDeposit}
                            onAdjustments={(patch) =>
                                setAdjustments((prev) => ({
                                    ...prev,
                                    ...patch,
                                }))
                            }
                        />
                    ) : null}
                    {step === 4 ? (
                        <ConfirmationStep
                            groupId={seed?.id || 'Auto-generated'}
                            draft={draft}
                            guests={namedGuests}
                            rooms={rooms}
                            nights={nights}
                            totalAmount={totalAmount}
                            deposit={depositAmount}
                            discountAmount={discountAmount}
                            paymentMethod={paymentMethod}
                            receivingAccount={receivingAccount}
                            billingMode={billingMode}
                        />
                    ) : null}
                </div>
            )}

            <div className="sticky bottom-0 flex items-center gap-3 border-t border-gray-100 bg-background pt-3">
                <Button
                    variant="outline"
                    className="h-11 min-w-[7rem] shadow-none"
                    onClick={() => {
                        if (step > 1) {
                            setStep(
                                (prev) => Math.max(1, prev - 1) as CreateStep,
                            );
                            return;
                        }
                        onCancel?.();
                    }}
                >
                    Back
                </Button>
                <BrandButton
                    className="h-11 min-w-[9.5rem] rounded-lg text-sm font-semibold shadow-none"
                    disabled={!canContinue || submitting}
                    loading={submitting}
                    onClick={goNext}
                >
                    {step === 4 ? 'Create Reservation' : 'Continue'}
                </BrandButton>
            </div>
        </div>
    );
}
