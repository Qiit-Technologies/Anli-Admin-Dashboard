export function parseStayTimeToMinutes(
    t: string | null | undefined,
    fallbackHour = 12,
): number {
    if (!t || !String(t).trim()) return fallbackHour * 60;
    const parts = String(t).trim().split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1] ?? 0);
    if (!Number.isFinite(h)) return fallbackHour * 60;
    return h * 60 + (Number.isFinite(m) ? m : 0);
}

export function isReservationDueOut(reservation: {
    isCheckedIn?: boolean;
    isCheckedOut?: boolean;
    isVoid?: boolean;
    endDate: string;
    endTime?: string | null;
}): boolean {
    if (
        !reservation.isCheckedIn ||
        reservation.isCheckedOut ||
        reservation.isVoid
    ) {
        return false;
    }
    const now = new Date();
    const end = new Date(reservation.endDate);
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (endDay.getTime() < today.getTime()) return true;
    if (endDay.getTime() > today.getTime()) return false;
    const dueAt = parseStayTimeToMinutes(reservation.endTime ?? null, 12);
    const nowM = now.getHours() * 60 + now.getMinutes();
    return nowM >= dueAt;
}

export type StayShellCategory =
    | 'void'
    | 'complimentary'
    | 'discount'
    | 'checkedOut'
    | 'dueOut'
    | 'inHouse'
    | 'reserved';

export function getStayShellCategory(reservation: {
    isVoid?: boolean;
    isComplimentary?: boolean;
    discountType?: string | null;
    isCheckedOut?: boolean;
    isCheckedIn?: boolean;
    endDate: string;
    endTime?: string | null;
}): StayShellCategory {
    if (reservation.isVoid) return 'void';
    if (reservation.isCheckedOut) return 'checkedOut';
    if (!reservation.isCheckedIn) return 'reserved';
    if (isReservationDueOut(reservation)) return 'dueOut';
    if (reservation.isComplimentary) return 'complimentary';
    if (reservation.discountType) return 'discount';
    return 'inHouse';
}

/** Tailwind class sets for chips / avatars (Check Ins & Outs, Stay View). */
export const stayShellAvatarClass: Record<StayShellCategory, string> = {
    void: 'bg-red-700 hover:bg-red-800 text-white',
    complimentary: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    discount: 'bg-orion-blue hover:bg-orion-blue text-white',
    checkedOut: 'bg-slate-500 hover:bg-slate-600 text-white',
    dueOut: 'bg-[#6e0d1e] hover:bg-[#5c0c19] text-white',
    inHouse: 'bg-green-500 hover:bg-green-600 text-white',
    reserved: 'bg-red-500 hover:bg-red-600 text-white',
};

export const stayShellPopoverClass: Record<StayShellCategory, string> = {
    void: 'bg-red-800 text-gray-100',
    complimentary: 'bg-yellow-700 text-gray-100',
    discount: 'bg-orion-blue text-gray-100',
    checkedOut: 'bg-slate-700 text-gray-100',
    dueOut: 'bg-[#5c0c19] text-gray-100',
    inHouse: 'bg-green-700 text-gray-100',
    reserved: 'bg-red-700 text-gray-100',
};

export const stayShellCardStripClass: Record<StayShellCategory, string> = {
    void: 'bg-red-50 border-l-red-700 text-black',
    complimentary: 'bg-yellow-50 border-l-yellow-600 text-black',
    discount: 'bg-blue-50 border-l-orion-blue text-black',
    checkedOut: 'bg-slate-100 border-l-slate-600 text-black',
    dueOut: 'bg-[#fce8ec] border-l-[#6e0d1e] text-black',
    inHouse: 'bg-green-100 border-l-green-600 text-black',
    reserved: 'bg-red-50 border-l-red-600 text-black',
};
