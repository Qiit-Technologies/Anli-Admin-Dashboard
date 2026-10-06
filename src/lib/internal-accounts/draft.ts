import { InternalAccountFormDraft } from '@/types/internal-accounts';

export const INTERNAL_ACCOUNT_DRAFT_KEY = 'internal-account-create-draft';

export function saveInternalAccountDraft(draft: InternalAccountFormDraft) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(INTERNAL_ACCOUNT_DRAFT_KEY, JSON.stringify(draft));
}

export function loadInternalAccountDraft(): InternalAccountFormDraft | null {
    if (typeof window === 'undefined') return null;

    const raw = sessionStorage.getItem(INTERNAL_ACCOUNT_DRAFT_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as InternalAccountFormDraft;
    } catch {
        return null;
    }
}

export function clearInternalAccountDraft() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(INTERNAL_ACCOUNT_DRAFT_KEY);
}
