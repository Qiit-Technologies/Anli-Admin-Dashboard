'use client';

import {
    addGuestToGroup,
    bulkCheckInGroupGuests,
    bulkCheckOutGroupGuests,
    changeGroupGuestRoom,
    createGroupGuest,
    deleteGroupReservation,
    extendGroupGuestStay,
    getGroupReservation,
    getGroupReservations,
    getGroupRoomingList,
    getGroupStatement,
    mergeGroupReservation,
    pullOutGuestFromGroup,
    releaseGroupRooms,
    removeGuestFromGroup,
    splitGroupBills,
    transferGroupCharges,
    transferGuestBetweenGroups,
    updateGroupReservation,
    voidGroupReservation,
} from '@/app/actions/group-reservation';
import { StepperDialog } from '@/components/front-office/common/Form/StepperDialog';
import ShareBookingModal from '@/components/front-office/common/ShareBookingModal';
import Toast from '@/components/toast';
import { useUser } from '@/context/useUser';
import { getApiErrorMessage } from '@/lib/api-error';
import { differenceInCalendarDays, format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { GroupActionHandlers } from './actions/GroupActionHost';
import { mapGroupFromApi } from './api-mappers';
import { CreateGroupBookingForm } from './form/CreateGroupBookingForm';
import { GroupReservationDetail } from './GroupReservationDetail';
import { GroupReservationList } from './GroupReservationList';
import type {
    GroupBooking,
    GroupGuestDraft,
    GroupListTab,
    GroupModal,
    GroupType,
    SplitBillMode,
    StandaloneReservation,
} from './types';
import {
    isGroupFullyCheckedIn,
    shouldShowGroupOnReservationsList,
} from './booking-stats';
import { downloadCsv } from './download-csv';
import { useGroupOptions } from './useGroupOptions';
import { useGroupReservationQuery } from './useGroupReservationQuery';

function notify(
    title: string,
    description: string,
    type: 'success' | 'error' = 'success',
) {
    toast.custom(() => (
        <Toast title={title} description={description} type={type} />
    ));
}

function errorMessage(error: unknown) {
    return getApiErrorMessage(error, 'Please try again.');
}

/** Group actions move stays in and out of rooms, so the stay lists rendered
 * around this workspace have to reload too. */
function announceGuestDataChange() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event('guest-data-updated'));
}

/**
 * Every manage action talks to the API, so a rejection is surfaced as a toast
 * instead of leaving the dialog open with no feedback.
 */
function withFailureToast(handlers: GroupActionHandlers): GroupActionHandlers {
    return Object.fromEntries(
        Object.entries(handlers).map(([name, handler]) => [
            name,
            async (...args: unknown[]) => {
                try {
                    await (handler as (...a: unknown[]) => unknown)(...args);
                } catch (error: any) {
                    notify('Action failed', errorMessage(error), 'error');
                }
            },
        ]),
    ) as GroupActionHandlers;
}

function toApiStatus(tab: GroupListTab) {
    if (tab === 'all') return undefined;
    return tab.toUpperCase() as 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

export function GroupReservationWorkspace({
    onCreate,
    hideList = false,
    reloadToken = 0,
    onBookings,
}: {
    onCreate: () => void;
    hideList?: boolean;
    reloadToken?: number;
    onBookings?: (bookings: GroupBooking[]) => void;
}) {
    const { user } = useUser();
    const query = useGroupReservationQuery();
    const [shareOpen, setShareOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [bookings, setBookings] = useState<GroupBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const { roomByNumber, roomTypes } = useGroupOptions();

    const selected = bookings.find((item) => item.id === query.recordId) || null;
    const selectedGuest =
        selected?.guests.find((guest) => guest.id === query.guestId) || null;

    const loadBookings = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const response = await getGroupReservations(
                hideList
                    ? undefined
                    : {
                          q: query.q || undefined,
                          groupType: query.groupType || undefined,
                          status: toApiStatus(query.tab),
                      },
            );
            const rows = Array.isArray(response)
                ? response
                : Array.isArray((response as { data?: unknown })?.data)
                  ? (response as { data: unknown[] }).data
                  : [];
            const mapped = rows.map(mapGroupFromApi);
            setBookings(mapped);
        } catch (error: any) {
            setLoadError(
                `Could not load group reservations. ${errorMessage(error)}`,
            );
        } finally {
            setLoading(false);
        }
    }, [hideList, query.groupType, query.q, query.tab]);

    useEffect(() => {
        void loadBookings();
    }, [loadBookings, reloadToken]);

    useEffect(() => {
        onBookings?.(bookings);
    }, [bookings, onBookings]);

    const filtered = useMemo(
        () => bookings.filter(shouldShowGroupOnReservationsList),
        [bookings],
    );

    const closeAction = () =>
        query.setParams({
            modal: null,
            guestId: null,
            recordId: query.manage ? query.recordId : null,
        });

    const selectedGroupId = selected?.backendId;

    const handleAddGuest = async (draft: Omit<GroupGuestDraft, 'id'>) => {
        if (!selectedGroupId || !selected) return;
        const roomTypeId = Number(draft.roomTypeId);
        if (!Number.isFinite(roomTypeId)) {
            notify('Room type required', 'Select a room type for this guest.');
            return;
        }
        try {
            const start = selected.arrivalIso
                ? new Date(selected.arrivalIso)
                : new Date();
            const end = selected.departureIso
                ? new Date(selected.departureIso)
                : start;
            const nights = Math.max(1, differenceInCalendarDays(end, start) || 1);
            const roomType = roomTypes.find(
                (item) => item.id === String(roomTypeId),
            );
            await createGroupGuest(selectedGroupId, {
                fullName: draft.name.trim(),
                email: draft.email.trim() || selected.contactEmail || 'guest@orion.local',
                phoneNumber: draft.phoneNumber,
                nationality: draft.nationality,
                roomtype: roomTypeId,
                roomNumber: draft.roomNumber || undefined,
                property: user?.hotel?.name || '',
                startDate: selected.arrivalIso || new Date().toISOString(),
                endDate: selected.departureIso || undefined,
                bookingAmount: (roomType?.pricePerNight || 0) * nights,
                includeTip: false,
            });
            await loadBookings();
            closeAction();
            notify(
                'Guest added',
                `${draft.name.trim()} has been added to this reservation.`,
            );
        } catch (error: any) {
            notify('Failed to add guest', errorMessage(error), 'error');
        }
    };

    const handleCheckIn = async (guestIds: string[]) => {
        if (!selectedGroupId) return;
        const numericGuestIds = guestIds
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id));
        if (numericGuestIds.length === 0) return;
        await bulkCheckInGroupGuests(selectedGroupId, numericGuestIds);
        await loadBookings();
        announceGuestDataChange();
        closeAction();
        notify('Checked in', `${numericGuestIds.length} guest(s) checked in.`);
        if (selectedGroupId) {
            const detail = await getGroupReservation(selectedGroupId);
            if (isGroupFullyCheckedIn(mapGroupFromApi(detail))) {
                query.setParams({ manage: null, recordId: null, modal: null });
            }
        }
    };

    const handleCheckout = async () => {
        if (!selectedGroupId || !query.guestId) return;
        await bulkCheckOutGroupGuests(selectedGroupId, [Number(query.guestId)]);
        await loadBookings();
        announceGuestDataChange();
        closeAction();
        notify(
            'Checked out',
            `${selectedGuest?.name || 'Guest'} has been checked out.`,
        );
    };

    const handleRemove = async () => {
        if (!selectedGroupId || !query.guestId) return;
        await removeGuestFromGroup(selectedGroupId, Number(query.guestId));
        await loadBookings();
        closeAction();
        notify('Guest removed', 'Guest removed from this group reservation.');
    };

    const handleTransfer = async (guestId: string, targetGroupId: string) => {
        if (!selectedGroupId) return;
        const target = bookings.find((group) => group.id === targetGroupId);
        if (!target?.backendId) return;
        await transferGuestBetweenGroups(selectedGroupId, {
            guestId: Number(guestId),
            targetGroupId: target.backendId,
        });
        await loadBookings();
        closeAction();
        notify('Guest transferred', `Guest moved to ${target.name}.`);
    };

    const handleSplit = async (
        mode: SplitBillMode,
        shares: { guestId: string; amount: number }[],
    ) => {
        if (!selectedGroupId) return;
        await splitGroupBills(
            selectedGroupId,
            mode,
            mode === 'custom'
                ? shares.map((share) => ({
                      guestId: Number(share.guestId),
                      amount: share.amount,
                  }))
                : undefined,
        );
        await loadBookings();
        closeAction();
        notify('Split applied', 'Bill split updated for this group.');
    };

    const openModal = (modal: GroupModal, guestId?: string) => {
        query.setParams({
            modal,
            guestId: guestId || null,
        });
    };

    const rawHandlers: GroupActionHandlers = {
        onAddGuest: handleAddGuest,
        onAddRoom: async (_roomTypeId, quantity) => {
            if (!selectedGroupId || !selected) return;
            await updateGroupReservation(selectedGroupId, {
                numberOfRooms: selected.roomCount + quantity,
            });
            await loadBookings();
            closeAction();
            notify('Rooms added', `${quantity} room(s) added to this group.`);
        },
        onTransfer: handleTransfer,
        onBulkCheckIn: handleCheckIn,
        onBulkCheckOut: async (guestIds) => {
            if (!selectedGroupId) return;
            const numericGuestIds = guestIds
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id));
            if (numericGuestIds.length === 0) return;
            await bulkCheckOutGroupGuests(selectedGroupId, numericGuestIds);
            await loadBookings();
            announceGuestDataChange();
            closeAction();
            notify('Checked out', `${guestIds.length} guest(s) checked out.`);
        },
        onReleaseRooms: async (roomNumbers) => {
            if (!selectedGroupId || !selected) return;
            const guestIds = selected.guests
                .filter((guest) => roomNumbers.includes(guest.roomNumber))
                .map((guest) => Number(guest.id))
                .filter((id) => Number.isFinite(id));
            await releaseGroupRooms(selectedGroupId, guestIds);
            await loadBookings();
            closeAction();
            notify('Rooms released', `${roomNumbers.length} room(s) released.`);
        },
        onGenerateStatement: async () => {
            if (!selectedGroupId || !selected) return;
            const statement = await getGroupStatement(selectedGroupId);
            downloadCsv(
                `statement-${statement?.groupCode || selected.id}.csv`,
                ['Field', 'Value'],
                [
                    ['Group Code', statement?.groupCode],
                    ['Group Name', statement?.groupName],
                    ['Total Guests', statement?.totalGuests],
                    ['Total Rooms', statement?.totalRooms],
                    ['Total Amount', statement?.totalAmount],
                    ['Total Deposits', statement?.totalDeposits],
                    ['Total Discounts', statement?.totalDiscounts],
                    ['Outstanding Balance', statement?.outstandingBalance],
                ],
            );
            closeAction();
            notify('Statement generated', 'Master folio statement downloaded.');
        },
        onSplitBills: handleSplit,
        onCheckout: handleCheckout,
        onCheckIn: async () => {
            if (!selectedGroupId || !query.guestId) return;
            await bulkCheckInGroupGuests(selectedGroupId, [
                Number(query.guestId),
            ]);
            await loadBookings();
            closeAction();
            notify(
                'Checked in',
                `${selectedGuest?.name || 'Guest'} has been checked in.`,
            );
            const detail = await getGroupReservation(selectedGroupId);
            if (isGroupFullyCheckedIn(mapGroupFromApi(detail))) {
                query.setParams({ manage: null, recordId: null, modal: null });
            }
        },
        onRemoveGuest: handleRemove,
        onAddExisting: async (reservation: StandaloneReservation) => {
            if (!selectedGroupId) return;
            const parsedId =
                reservation.backendId ??
                Number(String(reservation.id).replace(/\D/g, ''));
            if (!Number.isFinite(parsedId) || parsedId <= 0) {
                notify(
                    'Not found',
                    'Could not resolve reservation id to attach.',
                );
                return;
            }
            await addGuestToGroup(selectedGroupId, parsedId);
            await loadBookings();
            closeAction();
            notify(
                'Reservation added',
                `${reservation.name} (${reservation.id}) is now a child of this group.`,
            );
        },
        onMerge: async (sourceGroupId: string) => {
            if (!selectedGroupId || !selected) return;
            const source = bookings.find((item) => item.id === sourceGroupId);
            if (!source?.backendId) return;
            await mergeGroupReservation(selectedGroupId, source.backendId);
            await loadBookings();
            closeAction();
            notify(
                'Groups merged',
                `${source.name} was merged into ${selected.name}.`,
            );
        },
        onPullOut: async (guestId: string) => {
            if (!selectedGroupId) return;
            const guest = selected?.guests.find((item) => item.id === guestId);
            await pullOutGuestFromGroup(selectedGroupId, Number(guestId));
            await loadBookings();
            closeAction();
            notify(
                'Guest pulled out',
                `${guest?.name || 'Guest'} is now a standalone reservation (${guest?.reservationId || 'RES'}). History is kept.`,
            );
        },
        onExtendStay: async (guestId: string, departureDate: Date) => {
            if (!selectedGroupId) return;
            await extendGroupGuestStay(selectedGroupId, {
                guestId: Number(guestId),
                newDepartureDate: format(departureDate, 'yyyy-MM-dd'),
            });
            await loadBookings();
            closeAction();
            const guest = selected?.guests.find((item) => item.id === guestId);
            notify(
                'Stay extended',
                `${guest?.name || 'Guest'} departure updated to ${format(departureDate, 'MMM d')}.`,
            );
        },
        onChangeRoom: async (guestId, _roomTypeId, roomNumber) => {
            if (!selectedGroupId) return;
            const room = roomByNumber(roomNumber);
            await changeGroupGuestRoom(selectedGroupId, {
                guestId: Number(guestId),
                roomId: room?.id,
                roomNumber,
            });
            await loadBookings();
            closeAction();
            notify('Room updated', `Moved to room ${roomNumber}.`);
        },
        onRoomingList: async () => {
            if (!selectedGroupId || !selected) return;
            const list = await getGroupRoomingList(selectedGroupId);
            downloadCsv(
                `rooming-list-${list?.groupCode || selected.id}.csv`,
                ['Room Number', 'Room Type', 'Guest', 'Reservation'],
                (list?.rooms || []).map((room: any) => [
                    room?.roomNumber,
                    room?.roomType,
                    room?.guestName,
                    room?.reservationId,
                ]),
            );
            closeAction();
            notify('Rooming list generated', 'Rooming list downloaded.');
        },
        onTransferCharges: async (fromGuestId, to) => {
            if (!selectedGroupId) return;
            const payload =
                to === 'master'
                    ? {
                          fromGuestId: Number(fromGuestId),
                          toType: 'master' as const,
                      }
                    : {
                          fromGuestId: Number(fromGuestId),
                          toGuestId: Number(to),
                      };
            await transferGroupCharges(selectedGroupId, payload);
            await loadBookings();
            closeAction();
            const from = selected?.guests.find(
                (item) => item.id === fromGuestId,
            );
            notify(
                'Charges transferred',
                `Charges from ${from?.name || 'guest'} were moved to ${to === 'master' ? 'the master folio' : 'another guest'}.`,
            );
        },
        onChangeMaster: async (guestId: string) => {
            if (!selectedGroupId || !selected) return;
            const guest = selected.guests.find((item) => item.id === guestId);
            if (!guest) return;
            await updateGroupReservation(selectedGroupId, {
                contactName: guest.name,
                contactPhone: guest.phoneNumber,
                contactEmail: guest.email,
            });
            await loadBookings();
            closeAction();
            notify('Master updated', `${guest.name} is now the group master.`);
        },
        onEditGroup: async (patch: {
            name: string;
            groupType: GroupType;
            contactName: string;
            contactPhone: string;
        }) => {
            if (!selectedGroupId) return;
            await updateGroupReservation(selectedGroupId, {
                groupName: patch.name,
                groupType: patch.groupType,
                contactName: patch.contactName,
                contactPhone: patch.contactPhone,
            });
            await loadBookings();
            closeAction();
            notify('Group updated', 'Group reservation details saved.');
        },
        onDeleteGroup: async () => {
            if (!selectedGroupId) return;
            await deleteGroupReservation(selectedGroupId);
            await loadBookings();
            announceGuestDataChange();
            query.setParams({
                manage: null,
                recordId: null,
                modal: null,
                guestId: null,
            });
            notify(
                'Group deleted',
                'This group reservation and its guest bookings were removed.',
            );
        },
        onVoidGroup: async (voidReason: string) => {
            if (!selectedGroupId) return;
            await voidGroupReservation(selectedGroupId, voidReason);
            await loadBookings();
            announceGuestDataChange();
            // A voided group drops off the reservations list, so close the
            // panel instead of leaving it open on a record that is gone.
            query.setParams({
                manage: null,
                recordId: null,
                modal: null,
                guestId: null,
            });
            notify(
                'Group voided',
                'Guest reservations in this group were voided and taken off the reservations list.',
            );
        },
    };

    const actionHandlers = withFailureToast(rawHandlers);

    return (
        <>
            {hideList ? null : (
                <GroupReservationList
                    bookings={filtered}
                    loading={loading}
                    error={loadError}
                    onRetry={() => void loadBookings()}
                    search={query.q}
                    tab={query.tab}
                    groupType={query.groupType}
                    onSearch={(q) => query.setParams({ q: q || null })}
                    onTab={(tab: GroupListTab) =>
                        query.setParams({ tab: tab === 'all' ? null : tab })
                    }
                    onGroupType={(type) => query.setParams({ groupType: type })}
                    onManage={(recordId) =>
                        query.setParams({ recordId, manage: '1' })
                    }
                    onCreate={onCreate}
                    onShare={() => setShareOpen(true)}
                    onAction={(recordId, modal) =>
                        query.setParams({ recordId, modal })
                    }
                />
            )}
            <GroupReservationDetail
                open={Boolean(selected) && query.manage}
                booking={selected}
                bookings={bookings}
                guestSearch={query.detailQ}
                modal={query.modal}
                guestId={query.guestId}
                onBack={() =>
                    query.setParams({
                        recordId: null,
                        manage: null,
                        detailQ: null,
                        modal: null,
                        guestId: null,
                    })
                }
                onCloseAction={closeAction}
                onGuestSearch={(detailQ) =>
                    query.setParams({
                        detailQ: detailQ || null,
                    })
                }
                onOpenModal={(modal) => openModal(modal)}
                onEditFull={() => setEditOpen(true)}
                onCheckout={(guestId) => openModal('checkout', guestId)}
                onRemove={(guestId) => openModal('removeGuest', guestId)}
                onTransfer={(guestId) => openModal('transfer', guestId)}
                onGuestAction={(guestId, modal) => openModal(modal, guestId)}
                actionHandlers={actionHandlers}
            />
            <StepperDialog
                open={editOpen && Boolean(selected)}
                onOpenChange={setEditOpen}
                title="Edit Group Reservation"
                description="Review the reservation from the start and change what you need."
                content={
                    selected ? (
                        <CreateGroupBookingForm
                            key={selected.backendId || selected.id}
                            seed={selected}
                            onCreated={() => {
                                setEditOpen(false);
                                void loadBookings();
                            }}
                            onCancel={() => setEditOpen(false)}
                        />
                    ) : null
                }
            />
            <ShareBookingModal
                open={shareOpen}
                onOpenChange={setShareOpen}
                hotelName={user?.hotel?.name || ''}
                hotelId={user?.hotel?.id || ''}
            />
        </>
    );
}
