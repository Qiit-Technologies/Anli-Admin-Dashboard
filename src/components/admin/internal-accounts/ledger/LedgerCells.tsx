import { formatCurrency } from '@/lib/utils';

export function DateTimeCell({ value }: Readonly<{ value: string }>) {
    const date = new Date(value);
    const dateLabel = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const timeLabel = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div className="whitespace-nowrap">
            <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
            <p className="text-xs text-muted-foreground">{timeLabel}</p>
        </div>
    );
}

export function LedgerAmountCell({
    amount,
}: Readonly<{ amount: number | null }>) {
    if (amount === null || amount === undefined) {
        return <span className="text-muted-foreground">-----</span>;
    }

    return (
        <span className="tabular-nums font-medium">
            {formatCurrency(amount)}
        </span>
    );
}

export function EmptyCell({ value }: Readonly<{ value: string | null }>) {
    if (!value || value === '-------') {
        return <span className="text-muted-foreground">-------</span>;
    }
    return <span>{value}</span>;
}
