import { PostedBill } from '@/types/internal-accounts-ledger';

/** Only approved bills can be submitted for reversal. */
export function canRequestBillReversal(bill: PostedBill): boolean {
    return bill.status === 'Approved';
}
