'use client';

import type {
    GroupBooking,
    GroupGuestDraft,
    GroupModal,
    GroupType,
    SplitBillMode,
    StandaloneReservation,
} from '../types';
import { AddExistingPanel } from './AddExistingPanel';
import { AddGuestPanel } from './AddGuestPanel';
import { AddRoomPanel } from './AddRoomPanel';
import { BulkStayActionPanel } from './BulkStayActionPanel';
import { ChangeRoomPanel } from './ChangeRoomPanel';
import { ConfirmGuestActionPanel } from './ConfirmGuestActionPanel';
import { EditGroupPanel } from './EditGroupPanel';
import { ExtendStayPanel } from './ExtendStayPanel';
import { InvoicesPanel } from './InvoicesPanel';
import { MergePanel } from './MergePanel';
import { PullOutPanel } from './PullOutPanel';
import { ReleaseRoomsPanel } from './ReleaseRoomsPanel';
import { RoomingListPanel } from './RoomingListPanel';
import { ChangeMasterPanel } from './ChangeMasterPanel';
import { SplitBillsPanel, type SplitShare } from './SplitBillsPanel';
import { StatementPanel } from './StatementPanel';
import { TransferChargesPanel } from './TransferChargesPanel';
import { TransferGuestsPanel } from './TransferGuestsPanel';
import { GroupDeletePanel, GroupVoidPanel } from './GroupVoidDeletePanel';

export type GroupActionHandlers = {
    onAddGuest: (guest: Omit<GroupGuestDraft, 'id'>) => void | Promise<void>;
    onAddRoom: (roomTypeId: string, quantity: number) => void | Promise<void>;
    onTransfer: (guestId: string, targetGroupId: string) => void | Promise<void>;
    onBulkCheckIn: (guestIds: string[]) => void | Promise<void>;
    onBulkCheckOut: (guestIds: string[]) => void | Promise<void>;
    onReleaseRooms: (roomNumbers: string[]) => void | Promise<void>;
    onGenerateStatement: () => void | Promise<void>;
    onSplitBills: (
        mode: SplitBillMode,
        shares: SplitShare[],
    ) => void | Promise<void>;
    onChangeMaster: (guestId: string) => void | Promise<void>;
    onCheckout: () => void | Promise<void>;
    onCheckIn: () => void | Promise<void>;
    onRemoveGuest: () => void | Promise<void>;
    onAddExisting: (reservation: StandaloneReservation) => void | Promise<void>;
    onMerge: (sourceGroupId: string) => void | Promise<void>;
    onPullOut: (guestId: string) => void | Promise<void>;
    onExtendStay: (guestId: string, departureDate: Date) => void | Promise<void>;
    onChangeRoom: (
        guestId: string,
        roomTypeId: string,
        roomNumber: string,
    ) => void | Promise<void>;
    onRoomingList: () => void | Promise<void>;
    onTransferCharges: (fromGuestId: string, to: 'master' | string) => void | Promise<void>;
    onEditGroup: (patch: {
        name: string;
        groupType: GroupType;
        contactName: string;
        contactPhone: string;
    }) => void | Promise<void>;
    onDeleteGroup: () => void | Promise<void>;
    onVoidGroup: (voidReason: string) => void | Promise<void>;
};

export function GroupActionHost({
    modal,
    booking,
    bookings,
    guestId,
    onClose,
    handlers,
}: {
    modal: GroupModal;
    booking: GroupBooking;
    bookings: GroupBooking[];
    guestId: string | null;
    onClose: () => void;
    handlers: GroupActionHandlers;
}) {
    switch (modal) {
        case 'addGuest':
            return (
                <AddGuestPanel
                    onClose={onClose}
                    onAdd={handlers.onAddGuest}
                    arrivalDate={
                        booking.arrivalIso
                            ? new Date(booking.arrivalIso)
                            : booking.startDate
                              ? new Date(booking.startDate)
                              : undefined
                    }
                    departureDate={
                        booking.departureIso
                            ? new Date(booking.departureIso)
                            : booking.endDate
                              ? new Date(booking.endDate)
                              : undefined
                    }
                />
            );
        case 'addRoom':
            return (
                <AddRoomPanel onClose={onClose} onAdd={handlers.onAddRoom} />
            );
        case 'transfer':
            return (
                <TransferGuestsPanel
                    booking={booking}
                    bookings={bookings}
                    selectedGuestId={guestId}
                    onClose={onClose}
                    onTransfer={handlers.onTransfer}
                />
            );
        case 'bulkCheckIn':
            return (
                <BulkStayActionPanel
                    booking={booking}
                    stayStatus="expected"
                    emptyLabel="No expected guests to check in."
                    confirmLabel="Check In"
                    onClose={onClose}
                    onConfirm={handlers.onBulkCheckIn}
                />
            );
        case 'bulkCheckOut':
            return (
                <BulkStayActionPanel
                    booking={booking}
                    stayStatus="checked-in"
                    emptyLabel="No checked-in guests to check out."
                    confirmLabel="Check Out"
                    onClose={onClose}
                    onConfirm={handlers.onBulkCheckOut}
                />
            );
        case 'releaseRooms':
            return (
                <ReleaseRoomsPanel
                    booking={booking}
                    onClose={onClose}
                    onRelease={handlers.onReleaseRooms}
                />
            );
        case 'statement':
            return (
                <StatementPanel
                    booking={booking}
                    onClose={onClose}
                    onGenerate={handlers.onGenerateStatement}
                />
            );
        case 'invoices':
            return <InvoicesPanel booking={booking} onClose={onClose} />;
        case 'splitBills':
            return (
                <SplitBillsPanel
                    booking={booking}
                    onClose={onClose}
                    onApply={handlers.onSplitBills}
                />
            );
        case 'changeMaster':
            return (
                <ChangeMasterPanel
                    booking={booking}
                    onClose={onClose}
                    onSave={handlers.onChangeMaster}
                />
            );
        case 'checkout':
            return (
                <ConfirmGuestActionPanel
                    confirmLabel="Yes, Check Out Guest"
                    onClose={onClose}
                    onConfirm={handlers.onCheckout}
                />
            );
        case 'checkIn':
            return (
                <ConfirmGuestActionPanel
                    confirmLabel="Yes, Check In Guest"
                    onClose={onClose}
                    onConfirm={handlers.onCheckIn}
                />
            );
        case 'removeGuest':
            return (
                <ConfirmGuestActionPanel
                    confirmLabel="Yes, Remove Guest"
                    onClose={onClose}
                    onConfirm={handlers.onRemoveGuest}
                />
            );
        case 'pullOut':
            return (
                <PullOutPanel
                    booking={booking}
                    selectedGuestId={guestId}
                    onClose={onClose}
                    onConfirm={handlers.onPullOut}
                />
            );
        case 'addExisting':
            return (
                <AddExistingPanel
                    onClose={onClose}
                    onAdd={handlers.onAddExisting}
                />
            );
        case 'merge':
            return (
                <MergePanel
                    booking={booking}
                    bookings={bookings}
                    onClose={onClose}
                    onMerge={handlers.onMerge}
                />
            );
        case 'extendStay':
            return (
                <ExtendStayPanel
                    booking={booking}
                    selectedGuestId={guestId}
                    onClose={onClose}
                    onExtend={handlers.onExtendStay}
                />
            );
        case 'upgradeRoom':
        case 'downgradeRoom':
        case 'transferRoom':
            return (
                <ChangeRoomPanel
                    booking={booking}
                    selectedGuestId={guestId}
                    mode={
                        modal === 'upgradeRoom'
                            ? 'upgrade'
                            : modal === 'downgradeRoom'
                              ? 'downgrade'
                              : 'transfer'
                    }
                    onClose={onClose}
                    onChange={handlers.onChangeRoom}
                />
            );
        case 'roomingList':
            return (
                <RoomingListPanel
                    booking={booking}
                    onClose={onClose}
                    onGenerate={handlers.onRoomingList}
                />
            );
        case 'transferCharges':
            return (
                <TransferChargesPanel
                    booking={booking}
                    selectedGuestId={guestId}
                    onClose={onClose}
                    onTransfer={handlers.onTransferCharges}
                />
            );
        case 'edit':
            return (
                <EditGroupPanel
                    booking={booking}
                    onClose={onClose}
                    onSave={handlers.onEditGroup}
                />
            );
        case 'deleteGroup':
            return (
                <GroupDeletePanel
                    groupName={booking.name}
                    onClose={onClose}
                    onConfirm={handlers.onDeleteGroup}
                />
            );
        case 'voidGroup':
            return (
                <GroupVoidPanel
                    onClose={onClose}
                    onConfirm={handlers.onVoidGroup}
                />
            );
        default:
            return null;
    }
}
