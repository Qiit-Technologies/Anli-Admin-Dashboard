export function isReservationAssignedRoomDirty(
    reservation:
        | {
              room?: { status?: string; isDirty?: boolean } | null;
          }
        | null
        | undefined,
): boolean {
    const room = reservation?.room;
    if (!room) return false;

    // A room is dirty if it's explicitly marked dirty OR its status is 'DIRTY'
    const isDirtyFlag = room.isDirty === true;
    const isStatusDirty = String(room.status ?? '').toUpperCase() === 'DIRTY';

    return isDirtyFlag || isStatusDirty;
}

export function getReservationRoomDisplayLabel(reservation: {
    roomNumber?: number | string | null;
    room?: { roomNumber?: number | string | null } | null;
}): string {
    const n = reservation.room?.roomNumber ?? reservation.roomNumber;
    if (n === null || n === undefined || n === '') return 'N/A';
    return String(n);
}
