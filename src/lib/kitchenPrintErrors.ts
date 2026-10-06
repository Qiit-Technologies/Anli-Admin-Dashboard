/**
 * ANLI-018 — human-readable kitchen / docket print errors + offline fallback queue.
 */

export type KitchenPrintType = 'kot' | 'bot' | 'receipt';

export type PendingKitchenPrint = {
    id: string;
    orderId: number;
    type: KitchenPrintType;
    escposData: string;
    createdAt: number;
    lastError?: string;
};

const PENDING_KEY = 'pendingKitchenPrints';
const MAX_PENDING = 40;

export function explainKitchenPrintError(
    raw: string | undefined,
    printType: KitchenPrintType,
): string {
    const message = (raw || 'Print failed').trim();
    const lower = message.toLowerCase();
    const station =
        printType === 'kot'
            ? 'kitchen (KOT)'
            : printType === 'bot'
              ? 'bar (BOT)'
              : 'receipt';

    if (
        lower.includes('qz') &&
        (lower.includes('not available') ||
            lower.includes('timeout') ||
            lower.includes('connection'))
    ) {
        return `QZ Tray is not running or not reachable for the ${station} printer. Start QZ Tray on this PC, or switch Printing Method to IP in Settings.`;
    }

    if (
        lower.includes('printer ip not configured') ||
        lower.includes('not configured')
    ) {
        return `No ${station} printer is configured. Set KOT/BOT/Receipt printers under Settings → Printing (QZ multi-printer or IP).`;
    }

    if (
        lower.includes('econnrefused') ||
        lower.includes('enotfound') ||
        lower.includes('cannot reach print gateway') ||
        lower.includes('gateway')
    ) {
        return `Cannot reach the print gateway or network printer for ${station}. Check printer IP/port, gateway URL, and that the printer is online.`;
    }

    if (lower.includes('authentication') || lower.includes('401')) {
        return 'Print gateway authentication failed. Check the gateway API key in Settings.';
    }

    if (lower.includes('timeout') || lower.includes('timed out')) {
        return `${station} printer timed out. Confirm the device is powered on and on the same network, then retry from Printer status.`;
    }

    return `${message} — If this keeps failing, use Settings → Printing to verify QZ Tray / IP routing for ${station}, then retry failed jobs from Kitchen.`;
}

export function listPendingKitchenPrints(): PendingKitchenPrint[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as PendingKitchenPrint[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function savePendingKitchenPrint(
    job: Omit<PendingKitchenPrint, 'id' | 'createdAt'> & {
        id?: string;
        createdAt?: number;
    },
): PendingKitchenPrint {
    const entry: PendingKitchenPrint = {
        id: job.id || `${job.type}-${job.orderId}-${Date.now()}`,
        orderId: job.orderId,
        type: job.type,
        escposData: job.escposData,
        createdAt: job.createdAt || Date.now(),
        lastError: job.lastError,
    };
    const existing = listPendingKitchenPrints().filter((p) => p.id !== entry.id);
    const next = [entry, ...existing].slice(0, MAX_PENDING);
    localStorage.setItem(PENDING_KEY, JSON.stringify(next));
    return entry;
}

export function removePendingKitchenPrint(id: string): void {
    if (typeof window === 'undefined') return;
    const next = listPendingKitchenPrints().filter((p) => p.id !== id);
    localStorage.setItem(PENDING_KEY, JSON.stringify(next));
}

export function clearPendingKitchenPrints(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PENDING_KEY);
}
