export type CloseAccountVariant = 'zero' | 'negative' | 'positive';

export function getCloseAccountVariant(
    balance: number,
): CloseAccountVariant {
    if (balance === 0) return 'zero';
    if (balance < 0) return 'negative';
    return 'positive';
}

export function formatModalAmount(amount: number): string {
    return `₦${Math.abs(amount).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
