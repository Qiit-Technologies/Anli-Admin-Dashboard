import type { DraftInvoice } from '@/types/draft-invoice';

const GENERIC_DRAFT_GUEST_NAMES = new Set([
    '',
    'invoice reservation',
    'n/a',
    'guest',
]);

/** Resolves the guest/customer name shown on draft invoice lists. */
export function resolveDraftGuestDisplayName(draft: DraftInvoice): string {
    const stored = draft.guestName?.trim() ?? '';
    if (stored && !GENERIC_DRAFT_GUEST_NAMES.has(stored.toLowerCase())) {
        return stored;
    }

    const fullName = String(draft.payload?.fullName ?? '').trim();
    if (fullName) return fullName;

    return stored || '—';
}
