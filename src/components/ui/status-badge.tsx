import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status:
        | 'Pending'
        | 'Paid'
        | 'failed'
        | 'Approved'
        | 'Rejected'
        | 'Active'
        | 'Blacklisted'
        | 'Completed'
        | 'Pending Payment';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Paid':
            case 'Approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'failed':
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                'px-2 py-1 text-xs font-medium rounded-md',
                getStatusStyles(status),
            )}
        >
            {status}
        </Badge>
    );
}
