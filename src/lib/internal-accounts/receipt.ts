import { isInternalAccountPaymentMethod } from './settlement';

/** Receipt lines for Internal Account settlements (IA-028). */
export function formatInternalAccountReceiptLines(input: {
    paymentMethod?: string | null;
    receivingAccount?: string | null;
}): string[] {
    if (!isInternalAccountPaymentMethod(input.paymentMethod)) {
        return input.paymentMethod ? [`Payment: ${input.paymentMethod}`] : [];
    }

    const lines = ['Payment: Internal Account'];
    if (input.receivingAccount) {
        lines.push(`Posted To: ${input.receivingAccount}`);
    }
    return lines;
}
