import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    LedgerEntryStatus,
    PostedBillStatus,
    TransactionType,
} from '@/types/internal-accounts-ledger';

const TRANSACTION_TYPE_STYLES: Record<TransactionType, string> = {
    'Bill Posting': 'bg-blue-50 text-blue-700 border-blue-200',
    'Opening Balance': 'bg-purple-50 text-purple-700 border-purple-200',
    Adjustment: 'bg-orange-50 text-orange-700 border-orange-200',
    Reversal: 'bg-red-50 text-red-700 border-red-200',
    Funding: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const LEDGER_STATUS_STYLES: Record<LedgerEntryStatus, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In-Active': 'bg-orange-50 text-orange-700 border-orange-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-orange-50 text-orange-700 border-orange-200',
};

const BILL_STATUS_STYLES: Record<PostedBillStatus, string> = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-orange-50 text-orange-700 border-orange-200',
    Rejected: 'bg-slate-100 text-slate-700 border-slate-200',
    'Reversal Requested': 'bg-red-50 text-red-700 border-red-200',
    Reversed: 'bg-slate-100 text-slate-700 border-slate-300',
};

export function TransactionTypeBadge({
    type,
}: Readonly<{ type: TransactionType }>) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
                TRANSACTION_TYPE_STYLES[type],
            )}
        >
            {type}
        </Badge>
    );
}

export function LedgerStatusBadge({
    status,
}: Readonly<{ status: LedgerEntryStatus }>) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
                LEDGER_STATUS_STYLES[status],
            )}
        >
            {status}
        </Badge>
    );
}

export function PostedBillStatusBadge({
    status,
}: Readonly<{ status: PostedBillStatus }>) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium',
                BILL_STATUS_STYLES[status],
            )}
        >
            {status}
        </Badge>
    );
}
