import { printBOT, printKOT, printReceipt } from '@/app/actions/order';
import { printToIP } from '@/app/actions/print';
import { printWithQZ } from '@/hooks/useQzPrint';
import {
    explainKitchenPrintError,
    savePendingKitchenPrint,
} from './kitchenPrintErrors';
import { getPrinterForType } from './printerConfig';
import { formatInternalAccountReceiptLines } from './internal-accounts/receipt';
import {
    createThermalPreviewHTML,
    ProfessionalReceiptFormatter,
} from './thermalPreview';

interface BackendPrintResponse {
    printData: {
        hotel?: string;
        email?: string;
        phone?: string;
        hotelId?: string;
        orderId: string;
        orderCreatedBy?: string;
        orderDate: Date | string;
        orderTime?: string;
        room?: string;
        table?: {
            number: string;
        };
        waiter?: {
            fullName: string;
        };
        paymentMethod?: string;
        receivingAccount?: string;
        paymentStatusBadge?: string;
        paymentAllocations?: Array<{
            paymentMethod?: string;
            receivingAccount?: string;
            amount?: number;
            transactionReference?: string;
            remarks?: string;
            createdAt?: string | Date;
        }>;
        settlementCashier?: string;
        settlementAt?: string | Date;
        settlementReference?: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
            specialInstructions: string;
        }>;
        billAmount: number;
        vat: number | string;
        vatRate?: number;
        totalTax: number | string;
        serviceCharge?: number | string;
        serviceChargeRate?: number;
        tip?: number | string;
        tipRate?: number;
        customCharges?: Array<{
            name: string;
            rate: number;
            amount: number;
        }>;
        totalCustomChargesAmount?: number;
        total: number;
        complimentaryAmount?: number;
        amountDue?: number;
        preparedBy?: string;
        takenBy?: string;
        mergedOrderInfo?: string;
    };
    printType: 'kot' | 'bot' | 'receipt';
    message: string;
}

const ESC = String.fromCharCode(27);
const GS = String.fromCharCode(29);

/** ~80mm thermal width for customer receipts (POS receipt spec — not used for KOT/BOT). */
const RECEIPT_THERMAL_CHARS = 48;

const COMMANDS = {
    INIT: ESC + '@',
    ALIGN_LEFT: ESC + 'a' + String.fromCharCode(0),
    ALIGN_CENTER: ESC + 'a' + String.fromCharCode(1),
    ALIGN_RIGHT: ESC + 'a' + String.fromCharCode(2),
    BOLD_ON: ESC + 'E' + String.fromCharCode(1),
    BOLD_OFF: ESC + 'E' + String.fromCharCode(0),
    INVERSE_ON: ESC + '}' + String.fromCharCode(1),
    INVERSE_OFF: ESC + '}' + String.fromCharCode(0),
    UNDERLINE_ON: ESC + '-' + String.fromCharCode(1),
    UNDERLINE_OFF: ESC + '-' + String.fromCharCode(0),
    DOUBLE_HEIGHT: ESC + '!' + String.fromCharCode(16),
    FONT_B: ESC + '!' + String.fromCharCode(1),
    NORMAL_SIZE: ESC + '!' + String.fromCharCode(0),
    FEED_LINES: ESC + 'd',
    CUT_PAPER: GS + 'V' + String.fromCharCode(1),
};

function formatBackendDataForQZ(backendResponse: BackendPrintResponse): any {
    const { printData, printType } = backendResponse;

    let formattedData: string;

    switch (printType) {
        case 'kot':
            formattedData = formatKOTFromBackend(printData);
            break;
        case 'bot':
            formattedData = formatBOTFromBackend(printData);
            break;
        case 'receipt':
            formattedData = formatReceiptFromBackend(printData);
            break;
        default:
            formattedData = formatReceiptFromBackend(printData);
    }

    return {
        type: 'raw',
        format: 'command',
        flavor: 'plain',
        data: formattedData,
        options: {
            language: 'ESCPOS',
            charset: 'UTF-8',
        },
    };
}

function formatKOTFromBackend(
    printData: BackendPrintResponse['printData'],
): string {
    const width = 32;
    let receipt = COMMANDS.INIT;

    receipt +=
        COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON + COMMANDS.DOUBLE_HEIGHT;
    receipt += `${printData.hotel || 'RESTAURANT'}\n`;
    receipt += COMMANDS.NORMAL_SIZE + COMMANDS.BOLD_OFF;

    if (printData.email) {
        receipt += `${printData.email}\n`;
    }
    if (printData.phone) {
        receipt += `${printData.phone}\n`;
    }
    receipt += COMMANDS.ALIGN_LEFT;
    receipt += createSeparator('=', width);

    receipt += COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON;
    receipt += 'KITCHEN ORDER TICKET\n';
    receipt += COMMANDS.BOLD_OFF + COMMANDS.ALIGN_LEFT;
    receipt += createSeparator('-', width);

    receipt += `Order #: ${printData.orderId}\n`;
    receipt += `Date: ${formatDateTime(printData.orderDate)}\n`;

    if (printData.table?.number) {
        receipt += `Table: ${printData.table.number}\n`;
    }
    if (printData.room) {
        receipt += `Room: ${printData.room}\n`;
    }
    if (printData.waiter?.fullName) {
        receipt += `Waiter: ${printData.waiter.fullName}\n`;
    }
    receipt += createSeparator('-', width);

    receipt += COMMANDS.BOLD_ON;
    receipt += 'ITEMS:\n';
    receipt += COMMANDS.BOLD_OFF;

    printData.items.forEach((item, index) => {
        if (index > 0) receipt += '\n';

        receipt += `${item.quantity}x ${item.name}\n`;
        if (item.specialInstructions) {
            receipt += `    * ${item.specialInstructions}\n`;
        }
    });

    receipt += createSeparator('=', width);
    receipt += COMMANDS.ALIGN_CENTER;
    receipt += 'KITCHEN COPY\n';
    receipt += COMMANDS.ALIGN_LEFT;

    const kotTakenBy = printData.takenBy || printData.waiter?.fullName;
    if (kotTakenBy) {
        receipt += `Taken by: ${kotTakenBy}\n`;
    }

    receipt += `Print time: ${new Date().toLocaleTimeString('en-GB', { hour12: false })}\n`;

    receipt += COMMANDS.FEED_LINES + String.fromCharCode(3);
    receipt += COMMANDS.CUT_PAPER;

    return receipt;
}

function formatBOTFromBackend(
    printData: BackendPrintResponse['printData'],
): string {
    const width = 32;
    let receipt = COMMANDS.INIT;

    receipt +=
        COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON + COMMANDS.DOUBLE_HEIGHT;
    receipt += `${printData.hotel || 'RESTAURANT'}\n`;
    receipt += COMMANDS.NORMAL_SIZE + COMMANDS.BOLD_OFF;

    if (printData.email) {
        receipt += `${printData.email}\n`;
    }
    if (printData.phone) {
        receipt += `${printData.phone}\n`;
    }
    receipt += COMMANDS.ALIGN_LEFT;
    receipt += createSeparator('=', width);

    receipt += COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON;
    receipt += 'BAR ORDER TICKET\n';
    receipt += COMMANDS.BOLD_OFF + COMMANDS.ALIGN_LEFT;
    receipt += createSeparator('-', width);

    receipt += `Order #: ${printData.orderId}\n`;
    receipt += `Date: ${formatDateTime(printData.orderDate)}\n`;

    if (printData.table?.number) {
        receipt += `Table: ${printData.table.number}\n`;
    }
    if (printData.room) {
        receipt += `Room: ${printData.room}\n`;
    }
    if (printData.waiter?.fullName) {
        receipt += `Waiter: ${printData.waiter.fullName}\n`;
    }
    receipt += createSeparator('-', width);

    receipt += COMMANDS.BOLD_ON;
    receipt += 'DRINKS:\n';
    receipt += COMMANDS.BOLD_OFF;

    printData.items.forEach((item, index) => {
        if (index > 0) receipt += '\n';

        receipt += `${item.quantity}x ${item.name}\n`;
        if (item.specialInstructions) {
            receipt += `    * ${item.specialInstructions}\n`;
        }
    });

    receipt += createSeparator('=', width);
    receipt += COMMANDS.ALIGN_CENTER;
    receipt += 'BAR COPY\n';
    receipt += COMMANDS.ALIGN_LEFT;

    const botTakenBy = printData.takenBy || printData.waiter?.fullName;
    if (botTakenBy) {
        receipt += `Taken by: ${botTakenBy}\n`;
    }

    receipt += `Print time: ${new Date().toLocaleTimeString('en-GB', { hour12: false })}\n`;

    receipt += COMMANDS.FEED_LINES + String.fromCharCode(3);
    receipt += COMMANDS.CUT_PAPER;

    return receipt;
}

function formatReceiptFromBackend(
    printData: BackendPrintResponse['printData'],
): string {
    const width = RECEIPT_THERMAL_CHARS;
    let receipt = COMMANDS.INIT;

    const paymentBadge = printData.paymentStatusBadge?.trim().toUpperCase();
    if (paymentBadge) {
        receipt +=
            COMMANDS.ALIGN_CENTER +
            COMMANDS.INVERSE_ON +
            COMMANDS.BOLD_ON;
        receipt += ` ${paymentBadge} \n`;
        receipt += COMMANDS.BOLD_OFF + COMMANDS.INVERSE_OFF;
        receipt += createSeparator('-', width);
    }

    receipt += COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON;
    receipt += `${printData.hotel || 'RESTAURANT'}\n`;
    receipt += COMMANDS.BOLD_OFF;

    if (printData.email) {
        receipt += `${printData.email}\n`;
    }
    if (printData.phone) {
        receipt += `${printData.phone}\n`;
    }
    receipt += COMMANDS.ALIGN_LEFT;
    receipt += createSeparator('=', width);

    receipt += COMMANDS.ALIGN_CENTER + COMMANDS.BOLD_ON;
    receipt += 'RECEIPT\n';
    receipt += COMMANDS.BOLD_OFF + COMMANDS.ALIGN_LEFT;
    receipt += createSeparator('-', width);

    receipt += COMMANDS.FONT_B;
    receipt += `Order #: ${printData.orderId}  ${formatDateTime(printData.orderDate)}\n`;

    if (printData.table?.number) {
        receipt += `Table: ${printData.table.number}\n`;
    }
    if (printData.room) {
        receipt += `Room: ${printData.room}\n`;
    }
    if (printData.waiter?.fullName) {
        receipt += `Waiter: ${printData.waiter.fullName}\n`;
    }
    if (printData.orderCreatedBy) {
        receipt += `Created By: ${printData.orderCreatedBy}\n`;
    }

    const badge = (printData.paymentStatusBadge || '').toUpperCase();
    const allocations = printData.paymentAllocations ?? [];
    if (badge === 'SETTLED' || (badge === 'PAID' && allocations.length > 0)) {
        receipt += createSeparator('-', width);
        receipt += COMMANDS.BOLD_ON + 'SETTLEMENT DETAILS\n' + COMMANDS.BOLD_OFF;
        if (printData.settlementAt) {
            receipt += `Date: ${formatDateTime(printData.settlementAt)}\n`;
        }
        if (printData.settlementCashier) {
            receipt += `Cashier: ${printData.settlementCashier}\n`;
        }
        if (printData.settlementReference) {
            receipt += `Settlement Ref: ${printData.settlementReference}\n`;
        }
        if (allocations.length > 0) {
            allocations.forEach((payment, index) => {
                const method = (payment.paymentMethod || 'Payment')
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                receipt += `${index + 1}. ${method}: NGN ${Number(payment.amount || 0).toLocaleString('en-NG')}\n`;
                if (payment.receivingAccount) {
                    receipt += `   Acct: ${payment.receivingAccount}\n`;
                }
                if (payment.transactionReference) {
                    receipt += `   Ref: ${payment.transactionReference}\n`;
                }
                if (payment.remarks) {
                    receipt += `   Note: ${payment.remarks}\n`;
                }
            });
        } else {
            for (const line of formatInternalAccountReceiptLines({
                paymentMethod: printData.paymentMethod,
                receivingAccount: printData.receivingAccount,
            })) {
                receipt += `${line}\n`;
            }
        }
        if (badge === 'SETTLED') {
            receipt += 'Status: Fully Settled\n';
        }
    } else {
        for (const line of formatInternalAccountReceiptLines({
            paymentMethod: printData.paymentMethod,
            receivingAccount: printData.receivingAccount,
        })) {
            receipt += `${line}\n`;
        }
    }
    if (printData.mergedOrderInfo) {
        receipt += `${printData.mergedOrderInfo}\n`;
    }
    receipt += createSeparator('-', width);

    receipt += COMMANDS.FONT_B;
    printData.items.forEach((item) => {
        const itemTotal = item.quantity * item.price;
        receipt += formatCompactItemLine(
            item.quantity,
            item.name,
            itemTotal,
            width,
        );
        if (item.specialInstructions) {
            receipt += `  ${item.specialInstructions}\n`;
        }
    });
    receipt += COMMANDS.NORMAL_SIZE;

    receipt += createSeparator('-', width);

    receipt += formatSummaryLine('Subtotal', printData.billAmount, width);

    const vatNum = Number(printData.vat);
    if (!isNaN(vatNum) && vatNum > 0) {
        const vatLabel = printData.vatRate
            ? `VAT (${Number(printData.vatRate).toFixed(1)}%)`
            : 'VAT';
        receipt += formatSummaryLine(vatLabel, vatNum, width);
    }

    const serviceChargeNum = Number(printData.serviceCharge);
    if (!isNaN(serviceChargeNum) && serviceChargeNum > 0) {
        const scLabel = printData.serviceChargeRate
            ? `Service Charge (${Number(printData.serviceChargeRate).toFixed(0)}%)`
            : 'Service Charge';
        receipt += formatSummaryLine(scLabel, serviceChargeNum, width);
    }

    const tipNum = Number(printData.tip);
    if (!isNaN(tipNum) && tipNum > 0) {
        const tipLabel = printData.tipRate
            ? `Tip (${Number(printData.tipRate).toFixed(0)}%)`
            : 'Tip';
        receipt += formatSummaryLine(tipLabel, tipNum, width);
    }

    const customCharges = printData.customCharges ?? [];
    for (const charge of customCharges) {
        const amount = Number(charge.amount);
        if (isNaN(amount) || amount <= 0) continue;

        const hasRate =
            typeof charge.rate === 'number' && !isNaN(Number(charge.rate));
        const label = hasRate
            ? `${charge.name} (${Number(charge.rate).toFixed(1)}%)`
            : charge.name;

        receipt += formatSummaryLine(label, amount, width);
    }

    if (
        printData.totalTax &&
        printData.totalTax !== '' &&
        printData.totalTax !== printData.vat
    ) {
        receipt += formatSummaryLine('Tax', Number(printData.totalTax), width);
    }

    receipt += createSeparator('-', width);

    receipt += COMMANDS.BOLD_ON;
    receipt += formatSummaryLine('TOTAL', printData.total, width);
    receipt += COMMANDS.BOLD_OFF;

    const complimentaryAmount = Number(printData.complimentaryAmount ?? 0);
    if (!isNaN(complimentaryAmount) && complimentaryAmount > 0.009) {
        receipt += formatSummaryLine(
            'Complimentary',
            -complimentaryAmount,
            width,
        );
        receipt += COMMANDS.BOLD_ON;
        receipt += formatSummaryLine(
            'AMOUNT DUE',
            Number(printData.amountDue ?? 0),
            width,
        );
        receipt += COMMANDS.BOLD_OFF;
    }

    receipt += createSeparator('=', width);

    receipt += COMMANDS.ALIGN_CENTER;
    receipt += 'Thank you for your visit!\n';
    receipt += 'Please come again\n';
    receipt += COMMANDS.ALIGN_LEFT;

    const receiptTakenBy =
        printData.takenBy ||
        printData.waiter?.fullName ||
        (printData as { orderCreatedBy?: string }).orderCreatedBy;
    if (receiptTakenBy) {
        receipt += `Taken by: ${receiptTakenBy}\n`;
    }

    receipt += `Print time: ${new Date().toLocaleString('en-GB')}\n`;

    receipt += COMMANDS.FEED_LINES + String.fromCharCode(2);
    receipt += COMMANDS.CUT_PAPER;

    return receipt;
}

function createSeparator(char: string, width: number): string {
    return char.repeat(width) + '\n';
}

function formatDateTime(orderDate: Date | string): string {
    const date =
        typeof orderDate === 'string' ? new Date(orderDate) : orderDate;

    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatCompactItemLine(
    qty: number,
    name: string,
    total: number,
    width: number,
): string {
    const totalStr = `NGN ${Math.round(total)}`;
    const left = `${qty}x ${name}`.trim();
    const maxLeft = width - totalStr.length - 1;
    if (left.length <= maxLeft) {
        return `${left}${' '.repeat(Math.max(1, width - left.length - totalStr.length))}${totalStr}\n`;
    }
    const wrapped = left.slice(0, maxLeft);
    return `${wrapped}\n${' '.repeat(Math.max(0, width - totalStr.length))}${totalStr}\n`;
}

function formatItemLine(
    qty: number,
    price: number,
    total: number,
    width: number,
): string {
    const priceStr = `NGN ${Math.round(price)}`;
    const totalStr = `NGN ${Math.round(total)}`;
    const spaces = width - priceStr.length - totalStr.length;
    return `${priceStr}${' '.repeat(Math.max(1, spaces))}${totalStr}\n`;
}

function formatSummaryLine(
    label: string,
    amount: number,
    width: number,
): string {
    const amountStr = `NGN ${Math.round(amount)}`;
    const spaces = width - label.length - amountStr.length;
    return `${label}${' '.repeat(Math.max(1, spaces))}${amountStr}\n`;
}

async function isQZTrayAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
        const qzModule = await import('qz-tray').catch(() => null);

        if (!qzModule || !qzModule.default) {
            return false;
        }

        const qz = qzModule.default;

        if (qz.websocket && qz.websocket.isActive()) {
            return true;
        }

        try {
            const connectPromise = qz.websocket.connect();
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 2000),
            );

            await Promise.race([connectPromise, timeoutPromise]);

            const isActive = qz.websocket.isActive();

            if (isActive) {
                try {
                    await qz.websocket.disconnect();
                } catch {
                    // Ignore disconnect errors
                }
            }

            return isActive;
        } catch {
            return false;
        }
    } catch {
        return false;
    }
}

type PrintingMethodPreference = 'auto' | 'qz' | 'ip';

function getPreferredPrintingMethod(): PrintingMethodPreference {
    if (typeof window === 'undefined') {
        return 'auto';
    }

    try {
        const stored = window.localStorage?.getItem('printerMethod');

        if (stored === 'qz' || stored === 'ip' || stored === 'auto') {
            return stored;
        }

        return 'auto';
    } catch {
        return 'auto';
    }
}

async function printWithIP(
    escposData: string,
    printType: 'kot' | 'bot' | 'receipt',
): Promise<{ success: boolean; message: string }> {
    try {
        let printerIp: string | undefined;
        let printerPort: number | undefined;

        if (typeof window !== 'undefined') {
            try {
                const typed = localStorage.getItem('printerIpConfig');
                if (typed) {
                    const config = JSON.parse(typed) as Record<
                        string,
                        { ip?: string; port?: string | number }
                    >;
                    const station = config[printType];
                    if (station?.ip) {
                        printerIp = station.ip;
                        const port = parseInt(String(station.port || '9100'), 10);
                        if (!isNaN(port) && port > 0 && port <= 65535) {
                            printerPort = port;
                        }
                    }
                }
            } catch {
                // fall through to single-printer config
            }

            if (!printerIp) {
                const savedIp = localStorage.getItem('printerIp');
                const savedPort = localStorage.getItem('printerPort');
                if (savedIp) {
                    printerIp = savedIp;
                }
                if (savedPort) {
                    const port = parseInt(savedPort, 10);
                    if (!isNaN(port) && port > 0 && port <= 65535) {
                        printerPort = port;
                    }
                }
            }
        }

        const response = await printToIP(
            escposData,
            printType,
            printerIp,
            printerPort,
        );

        if (response.error) {
            return { success: false, message: response.error };
        }

        return { success: true, message: 'Printed successfully via IP' };
    } catch (error: any) {
        return {
            success: false,
            message: `IP print error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

async function tryPrintWithQZThenIP(
    backendResponse: BackendPrintResponse,
    escposData: string,
    printerName: string | undefined,
    printType: 'kot' | 'bot' | 'receipt',
    successMessage: string,
    allowIPFallback: boolean = true,
): Promise<{ success: boolean; message: string }> {
    try {
        const qzData = formatBackendDataForQZ(backendResponse);
        const result = await printWithQZ(qzData, printerName);

        if (result.success) {
            return { success: true, message: successMessage };
        }

        // If IP fallback is not allowed (e.g., preference is 'qz'), return error
        if (!allowIPFallback) {
            return {
                success: false,
                message: explainKitchenPrintError(
                    result.error || 'QZ Tray printing failed',
                    printType,
                ),
            };
        }

        const ipResult = await printWithIP(escposData, printType);
        if (ipResult.success) {
            return {
                success: true,
                message: `${successMessage} (via network printer — QZ Tray unavailable)`,
            };
        }
        return {
            success: false,
            message: explainKitchenPrintError(ipResult.message, printType),
        };
    } catch (error: any) {
        // If IP fallback is not allowed, return error
        if (!allowIPFallback) {
            return {
                success: false,
                message: explainKitchenPrintError(
                    error instanceof Error
                        ? error.message
                        : 'QZ Tray printing failed',
                    printType,
                ),
            };
        }

        const ipResult = await printWithIP(escposData, printType);
        if (ipResult.success) {
            return {
                success: true,
                message: `${successMessage} (via network printer — QZ Tray unavailable)`,
            };
        }
        return {
            success: false,
            message: explainKitchenPrintError(ipResult.message, printType),
        };
    }
}

async function finalizeKitchenPrintResult(
    orderId: number,
    printType: 'kot' | 'bot',
    escposData: string,
    result: { success: boolean; message: string },
): Promise<{ success: boolean; message: string }> {
    if (result.success) {
        return result;
    }
    const explained = {
        success: false as const,
        message: explainKitchenPrintError(result.message, printType),
    };
    savePendingKitchenPrint({
        orderId,
        type: printType,
        escposData,
        lastError: explained.message,
    });
    return {
        ...explained,
        message: `${explained.message} Job saved offline — retry from Kitchen printer status when the printer is back.`,
    };
}

export async function printOrderKOT(
    orderId: number,
    newItemsOnly: boolean = false,
    printerName?: string,
    forceIP: boolean = false,
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await printKOT(orderId, newItemsOnly);

        if (response.error) {
            return { success: false, message: response.error };
        }
        if (!response.data.printData && newItemsOnly) {
            return {
                success: false,
                message:
                    response.data.message ||
                    'No new kitchen items to print. Use Print All KOT to reprint.',
                isNoNewItems: true,
            } as any;
        }

        if (!response.data.printData) {
            return {
                success: false,
                message: response.data.message,
                isNoNewItems: true,
            } as any;
        }

        const escposData = formatKOTFromBackend(response.data.printData);
        const preference = getPreferredPrintingMethod();

        const configuredKitchenPrinter = getPrinterForType('kot');
        const kitchenPrinterName = configuredKitchenPrinter ?? printerName;

        let result: { success: boolean; message: string };
        if (forceIP || preference === 'ip') {
            result = await printWithIP(escposData, 'kot');
        } else if (preference === 'qz') {
            result = await tryPrintWithQZThenIP(
                response.data,
                escposData,
                kitchenPrinterName,
                'kot',
                'KOT printed to kitchen',
                false,
            );
        } else {
            const qzAvailable = await isQZTrayAvailable();
            if (!qzAvailable) {
                result = await printWithIP(escposData, 'kot');
            } else {
                result = await tryPrintWithQZThenIP(
                    response.data,
                    escposData,
                    kitchenPrinterName,
                    'kot',
                    'KOT printed to kitchen',
                );
            }
        }
        return finalizeKitchenPrintResult(orderId, 'kot', escposData, result);
    } catch (error: any) {
        return {
            success: false,
            message: explainKitchenPrintError(
                `Print error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'kot',
            ),
        };
    }
}

export async function printOrderBOT(
    orderId: number,
    newItemsOnly: boolean = false,
    printerName?: string,
    forceIP: boolean = false,
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await printBOT(orderId, newItemsOnly);

        if (response.error) {
            return { success: false, message: response.error };
        }

        if (!response.data.printData && newItemsOnly) {
            return {
                success: false,
                message:
                    response.data.message ||
                    'No new bar items to print. Use Print All BOT to reprint.',
                isNoNewItems: true,
            } as any;
        }

        // Handle case where no new items to print
        if (!response.data.printData) {
            return {
                success: false,
                message: response.data.message,
                isNoNewItems: true,
            } as any;
        }

        const escposData = formatBOTFromBackend(response.data.printData);
        const preference = getPreferredPrintingMethod();

        const configuredBarPrinter = getPrinterForType('bot');
        const barPrinterName = configuredBarPrinter ?? printerName;

        let result: { success: boolean; message: string };
        if (forceIP || preference === 'ip') {
            result = await printWithIP(escposData, 'bot');
        } else if (preference === 'qz') {
            result = await tryPrintWithQZThenIP(
                response.data,
                escposData,
                barPrinterName,
                'bot',
                'BOT printed to bar',
                false,
            );
        } else {
            const qzAvailable = await isQZTrayAvailable();
            if (!qzAvailable) {
                result = await printWithIP(escposData, 'bot');
            } else {
                result = await tryPrintWithQZThenIP(
                    response.data,
                    escposData,
                    barPrinterName,
                    'bot',
                    'BOT printed to bar',
                );
            }
        }
        return finalizeKitchenPrintResult(orderId, 'bot', escposData, result);
    } catch (error: any) {
        return {
            success: false,
            message: explainKitchenPrintError(
                `Print error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'bot',
            ),
        };
    }
}

export async function printOrderReceipt(
    orderId: number,
    printerName?: string,
    forceIP: boolean = false,
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await printReceipt(orderId);

        if (response.error) {
            return { success: false, message: response.error };
        }

        const escposData = formatReceiptFromBackend(response.data.printData);
        const preference = getPreferredPrintingMethod();

        if (forceIP || preference === 'ip') {
            return await printWithIP(escposData, 'receipt');
        }

        const configuredPrinter = getPrinterForType('receipt');
        const finalPrinterName = configuredPrinter || printerName;

        if (preference === 'qz') {
            // User explicitly wants QZ Tray, skip availability check and don't fall back to IP
            return await tryPrintWithQZThenIP(
                response.data,
                escposData,
                finalPrinterName,
                'receipt',
                'Receipt printed successfully',
                false, // Don't allow IP fallback
            );
        }

        // Auto mode: check availability first
        const qzAvailable = await isQZTrayAvailable();

        if (!qzAvailable) {
            return await printWithIP(escposData, 'receipt');
        }

        return await tryPrintWithQZThenIP(
            response.data,
            escposData,
            finalPrinterName,
            'receipt',
            'Receipt printed successfully',
        );
    } catch (error: any) {
        return {
            success: false,
            message: `Print error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
    }
}

function buildQZPayloadForRawEscpos(escposData: string) {
    return {
        type: 'raw' as const,
        format: 'command' as const,
        flavor: 'plain' as const,
        data: escposData,
        options: {
            language: 'ESCPOS',
            charset: 'UTF-8',
        },
    };
}

async function tryPrintRawEscposWithQZThenIP(
    escposData: string,
    printerName: string | undefined,
    successMessage: string,
    allowIPFallback: boolean = true,
): Promise<{ success: boolean; message: string }> {
    try {
        const qzData = buildQZPayloadForRawEscpos(escposData);
        const result = await printWithQZ(qzData, printerName);

        if (result.success) {
            return { success: true, message: successMessage };
        }

        if (!allowIPFallback) {
            return {
                success: false,
                message: result.error || 'QZ Tray printing failed',
            };
        }

        return await printWithIP(escposData, 'receipt');
    } catch (error: any) {
        if (!allowIPFallback) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'QZ Tray printing failed',
            };
        }

        return await printWithIP(escposData, 'receipt');
    }
}

/**
 * Print a report (raw ESC/POS string) to the receipt printer using the same flow as
 * KOT/BOT/receipt: QZ Tray first (popup) when available, then IP fallback.
 * Respects printerMethod (qz / ip / auto) from localStorage.
 */
export async function printReportToReceiptPrinter(
    escposData: string,
): Promise<{ success: boolean; message: string }> {
    const preference = getPreferredPrintingMethod();

    if (preference === 'ip') {
        return await printWithIP(escposData, 'receipt');
    }

    const printerName = getPrinterForType('receipt');

    if (preference === 'qz') {
        return await tryPrintRawEscposWithQZThenIP(
            escposData,
            printerName,
            'Report sent to printer.',
            false,
        );
    }

    const qzAvailable = await isQZTrayAvailable();
    if (!qzAvailable) {
        return await printWithIP(escposData, 'receipt');
    }

    return await tryPrintRawEscposWithQZThenIP(
        escposData,
        printerName,
        'Report sent to printer.',
    );
}

export function previewReceipt(receiptData: string): void {
    const previewWindow = window.open(
        '',
        '_blank',
        'width=500,height=800,scrollbars=yes',
    );
    if (previewWindow) {
        const htmlContent = createThermalPreviewHTML(receiptData);
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();

        previewWindow.focus();
    }
}

export function generateProfessionalReceipt(orderData: any): string {
    return ProfessionalReceiptFormatter.formatProfessionalReceipt(orderData);
}
