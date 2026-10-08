/**
 * Protein Stock types & calculations — FRD §8.
 *
 * Proteins are tracked in PIECES (base unit). The UI displays and edits in
 * PTN (portions) + PCS (pieces) using the item's pieces-per-portion (PPP):
 *
 *   pieces = PTN × PPP + PCS
 *   PTN    = floor(pieces ÷ PPP)
 *   PCS    = pieces mod PPP
 */

export type ProteinStatus = 'STOCK AVAILABLE' | 'REORDER';

export type ProteinField =
    | 'unitCost'
    | 'inPtn'
    | 'inPcs'
    | 'outPtn'
    | 'outPcs'
    | 'rtnPtn'
    | 'rtnPcs'
    | 'bdPtn'
    | 'bdPcs';

/** One protein item's movement for a single day — all quantities in pieces. */
export type ProteinDayMovement = {
    itemId: string;
    itemName: string;
    unit: string;
    /** Pieces per portion (PPP). */
    ppp: number;
    /** Cost per piece. */
    unitCost: number;
    category: string;
    /** Reorder level in pieces. */
    minStock: number;
    /** Opening for the selected day, in pieces. */
    openingPieces: number;
    inPtn: number;
    inPcs: number;
    outPtn: number;
    outPcs: number;
    rtnPtn: number;
    rtnPcs: number;
    bdPtn: number;
    bdPcs: number;
    bdReason: string;
};

export type ProteinFilter = 'all' | 'moved' | 'reorder' | 'available';

export type ProteinDraftEntry = {
    inPtn: number;
    inPcs: number;
    outPtn: number;
    outPcs: number;
    rtnPtn: number;
    rtnPcs: number;
    bdPtn: number;
    bdPcs: number;
    bdReason?: string;
    /** Optional override of catalog unit price (per piece) for this day. */
    unitCost?: number;
};

export type ProteinDraftMap = Record<string, ProteinDraftEntry>;

export const BD_REASONS = [
    'Expired',
    'Spoiled',
    'Broken',
    'Spilled',
    'Contaminated',
    'Theft / Loss',
    'Other',
] as const;

/** Convert PTN + PCS to total pieces. */
export function toPieces(ptn: number, pcs: number, ppp: number): number {
    const safePpp = ppp > 0 ? Math.floor(ppp) : 1;
    return Math.max(0, Math.round(ptn) * safePpp + Math.round(pcs));
}

/** Split total pieces into { ptn, pcs } display parts. */
export function toPtnPcs(
    pieces: number,
    ppp: number,
): { ptn: number; pcs: number } {
    const safePpp = ppp > 0 ? Math.floor(ppp) : 1;
    const total = Math.max(0, Math.round(pieces));
    return { ptn: Math.floor(total / safePpp), pcs: total % safePpp };
}

/** Format pieces as "X PTN Y PCS" with total pieces underneath. */
export function formatPtnPcs(pieces: number, ppp: number): string {
    const { ptn, pcs } = toPtnPcs(pieces, ppp);
    return `${ptn} PTN ${pcs} PCS`;
}

export function calcProteinClosing(row: {
    openingPieces: number;
    ppp: number;
    inPtn: number;
    inPcs: number;
    outPtn: number;
    outPcs: number;
    rtnPtn: number;
    rtnPcs: number;
    bdPtn: number;
    bdPcs: number;
}): number {
    const ppp = row.ppp > 0 ? row.ppp : 1;
    const closing =
        row.openingPieces +
        toPieces(row.inPtn, row.inPcs, ppp) -
        toPieces(row.outPtn, row.outPcs, ppp) +
        toPieces(row.rtnPtn, row.rtnPcs, ppp) -
        toPieces(row.bdPtn, row.bdPcs, ppp);
    return Math.max(0, Math.round(closing));
}

export function proteinValue(pieces: number, unitCost: number): number {
    return Math.round(pieces * unitCost * 100) / 100;
}

export function resolveProteinStatus(
    closingPieces: number,
    minStock: number,
): ProteinStatus {
    if (closingPieces <= 0 || (minStock > 0 && closingPieces < minStock)) {
        return 'REORDER';
    }
    return 'STOCK AVAILABLE';
}
