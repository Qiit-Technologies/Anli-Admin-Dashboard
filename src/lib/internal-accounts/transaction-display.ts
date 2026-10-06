import { InternalAccountTransaction } from '@/types/internal-accounts-ledger';

const RESTAURANT_SOURCE_MODULES = new Set([
    'Restaurant Orders',
    'Room Service',
    'Table Service',
    'Fast Food',
    'Home Delivery',
]);

const FRONT_DESK_SOURCE_MODULES = new Set([
    'Reservations',
    'Check-ins',
    'Guest Billing',
    'Room Upgrade',
    'Room Charges',
]);

/**
 * IA-030 display label — does not change stored values.
 */
export function formatLedgerSourceModuleDisplay(
    row: Pick<InternalAccountTransaction, 'type' | 'sourceModule'>,
): string {
    if (row.type === 'Opening Balance' || row.type === 'Funding') {
        return 'Manual';
    }

    const source = String(row.sourceModule ?? '').trim();
    if (!source) return '—';

    if (source === 'Manual') return 'Manual';
    if (RESTAURANT_SOURCE_MODULES.has(source)) return 'Restaurant';
    if (FRONT_DESK_SOURCE_MODULES.has(source)) return 'Front Desk';

    const lower = source.toLowerCase();
    if (
        lower.includes('restaurant') ||
        lower.includes('delivery') ||
        lower.includes('food') ||
        lower.includes('table') ||
        lower.includes('room service')
    ) {
        return 'Restaurant';
    }
    if (
        lower.includes('reservation') ||
        lower.includes('guest') ||
        lower.includes('check-in') ||
        lower.includes('front') ||
        lower.includes('room upgrade')
    ) {
        return 'Front Desk';
    }

    return source;
}

/**
 * IA-030 — shorten long TXN IDs for display only (stored ID unchanged).
 */
export function formatLedgerTransactionIdDisplay(transactionId: string): string {
    const id = String(transactionId ?? '').trim();
    if (!id) return '—';

    const match = /^TXN(\d{4})(\d{2})\d*(\d{2,3})$/.exec(id);
    if (match) {
        const [, year, month, suffix] = match;
        return `TXN${year}${month}${suffix.padStart(2, '0').slice(-2)}`;
    }

    return id.length > 12 ? `${id.slice(0, 12)}…` : id;
}

/**
 * IA-030 — invoice column display (Opening Balance → N/A).
 */
export function formatLedgerInvoiceNoDisplay(
    row: Pick<InternalAccountTransaction, 'type' | 'invoiceNo'>,
): string {
    if (row.type === 'Opening Balance') return 'N/A';
    const invoice = String(row.invoiceNo ?? '').trim();
    return invoice || '—';
}
