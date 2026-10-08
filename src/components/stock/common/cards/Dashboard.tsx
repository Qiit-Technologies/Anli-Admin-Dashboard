import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';

type StockStatCardProps = {
    title: string;
    currentValue: number;
    previousValue: number;
    percentageChange: number;
    href?: string;
};

export const StockStatCard = ({
    title,
    currentValue,
    previousValue,
    percentageChange,
    href,
}: StockStatCardProps) => {
    const isIncreasing = currentValue >= previousValue;

    const content = (
        <div
            className={cn(
                'bg-white rounded-md px-3 py-2.5 border gap-1 flex flex-col h-full',
                href &&
                    'transition-colors hover:border-orion-blue/40 hover:bg-gray-50/80 cursor-pointer',
            )}
        >
            <div className="text-xs text-muted-foreground leading-tight">
                {title}
            </div>
            <div className="flex items-center justify-between gap-2">
                <div className="text-lg font-semibold tabular-nums">
                    <span>{currentValue}</span>
                </div>
                <div
                    className={cn(
                        isIncreasing
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600',
                        'flex items-center px-1.5 gap-0.5 h-5 text-[10px] rounded-md',
                    )}
                >
                    {isIncreasing ? (
                        <ArrowUp size={10} />
                    ) : (
                        <ArrowDown size={10} />
                    )}
                    {Math.abs(percentageChange)}%
                </div>
            </div>
        </div>
    );

    if (!href) return content;

    return (
        <Link href={href} aria-label={`View ${title}`} className="block h-full">
            {content}
        </Link>
    );
};

export const STOCK_DASHBOARD_STAT_HREFS: Record<string, string> = {
    'Total Items in Stock': '/stock/items',
    'High Stock Items': '/stock/items?status=Available',
    'Low Stock Items': '/stock/items?status=Low',
    'Out of Stock Items': '/stock/items?status=OutOfStock',
};

export const STOCK_REQUEST_STAT_HREFS: Record<string, string> = {
    'Total Departments': '/stock/stock-requests',
    'Pending Approval': '/stock/stock-requests?status=PENDING',
    'Approved Requests': '/stock/stock-requests?status=APPROVED',
    'Rejected Requests': '/stock/stock-requests?status=REJECTED',
};

export const PURCHASE_ORDER_STAT_HREFS: Record<string, string> = {
    'Number of low stock': '/stock/items?status=Low',
    'Out of stock items': '/stock/items?status=OutOfStock',
};

export const TRANSFER_STAT_HREFS: Record<string, string> = {
    'Total Transfers': '/stock/transfer-management',
    Pending: '/stock/transfer-management?status=PENDING',
    Approved: '/stock/transfer-management?status=APPROVED',
    'In Transit':
        '/stock/transfer-management?status=IN_TRANSIT',
    Received: '/stock/transfer-management?status=RECEIVED',
    Rejected: '/stock/transfer-management?status=REJECTED',
};
