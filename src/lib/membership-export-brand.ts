export const ANLI_MEMBERSHIP_BRAND = {
    productName: 'Anli',
    inkRgb: [17, 17, 17] as [number, number, number],
    textRgb: [33, 33, 33] as [number, number, number],
    mutedTextRgb: [82, 82, 82] as [number, number, number],
    tableHeadRgb: [51, 51, 51] as [number, number, number],
    tableHeadTextRgb: [255, 255, 255] as [number, number, number],
    tableStripeRgb: [245, 245, 245] as [number, number, number],
    borderRgb: [180, 180, 180] as [number, number, number],
    footerBgRgb: [250, 250, 250] as [number, number, number],
    inkHex: '#111111',
    borderHex: '#B4B4B4',
} as const;

export type MembershipExportMeta = {
    businessName: string;
    businessAddress?: string;
    reportTitle: string;
    subtitle?: string;
    period?: string;
    recordCount?: number;
};

export function formatMembershipExportDateTime(date = new Date()) {
    return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function formatMembershipExportDate(date = new Date()) {
    return date.toLocaleDateString(undefined, {
        dateStyle: 'long',
    });
}

export function resolveMembershipBusinessName(
    organization?: {
        name?: string;
        printoutName?: string | null;
        printoutAddress?: string | null;
        address?: string;
    } | null,
) {
    return (
        organization?.printoutName?.trim() ||
        organization?.name?.trim() ||
        'Property'
    );
}

export function resolveMembershipBusinessAddress(
    organization?: {
        address?: string;
        printoutAddress?: string | null;
    } | null,
) {
    return (
        organization?.printoutAddress?.trim() || organization?.address?.trim()
    );
}
