/** Naira amounts with a real space so ₦0 cannot read as "NO". */
export function folioMoney(value: number | string | null | undefined) {
    const amount = Math.round(Number(value) || 0);
    return `₦\u00a0${amount.toLocaleString('en-NG')}`;
}
