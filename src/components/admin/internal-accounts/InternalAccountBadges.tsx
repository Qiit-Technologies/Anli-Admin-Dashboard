import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    InternalAccountStatus,
    InternalAccountType,
} from '@/types/internal-accounts';

const ACCOUNT_TYPE_STYLES: Record<InternalAccountType, string> = {
    'Director Ledger': 'bg-blue-50 text-blue-700 border-blue-200',
    'House Account': 'bg-purple-50 text-purple-700 border-purple-200',
    'Owner Account': 'bg-red-50 text-red-700 border-red-200',
    'Staff Account': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'VIP Account': 'bg-pink-50 text-pink-700 border-pink-200',
};

const STATUS_STYLES: Record<InternalAccountStatus, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In-Active': 'bg-orange-50 text-orange-700 border-orange-200',
};

export function InternalAccountTypeBadge({
    type,
}: {
    type: InternalAccountType;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                ACCOUNT_TYPE_STYLES[type],
            )}
        >
            {type}
        </Badge>
    );
}

export function InternalAccountStatusBadge({
    status,
}: {
    status: InternalAccountStatus;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                STATUS_STYLES[status],
            )}
        >
            {status}
        </Badge>
    );
}
