/** Single source for payment / refund-account filter values and display labels. */

import { formatBankAccountLabel } from '@/lib/utils';

export const PAYMENT_METHOD_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All payment methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'transfer', label: 'Bank transfer' },
    { value: 'pos', label: 'POS' },
];

export const REFUND_ACCOUNT_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All accounts' },
];

export function buildRefundAccountOptions(
    bankAccounts: Array<{
        accountName?: string | null;
        accountNumber?: string | number | null;
        bankName?: string | null;
    }>,
): { value: string; label: string }[] {
    const options = bankAccounts
        .map((account) => {
            const accountNumber = String(account.accountNumber ?? '').trim();
            if (!accountNumber) return null;

            return {
                value: accountNumber,
                label: formatBankAccountLabel(account as Parameters<typeof formatBankAccountLabel>[0]),
            };
        })
        .filter((option): option is { value: string; label: string } => !!option);

    return [{ value: 'all', label: 'All accounts' }, ...options];
}

export function paymentMethodLabel(value: string): string {
    return (
        PAYMENT_METHOD_OPTIONS.find((o) => o.value === value)?.label ?? value
    );
}

export function refundAccountLabel(
    value: string,
    accountOptions: { value: string; label: string }[] = REFUND_ACCOUNT_OPTIONS,
): string {
    return accountOptions.find((o) => o.value === value)?.label ?? value;
}
