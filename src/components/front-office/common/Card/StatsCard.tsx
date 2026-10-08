import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type ValueType = 'currency' | 'percent' | 'number';

type IncomingOrdersStatCardProps = {
    title: string;
    currentValue: number;
    previousValue: number;
    percentageChange: any;
    /** Controls how currentValue is displayed. Defaults to 'number'. */
    valueType?: ValueType;
};

const formatValue = (val: number, type: ValueType): string => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    switch (type) {
        case 'currency':
            return formatCurrency(val);
        case 'percent':
            return `${Number(val).toLocaleString('en-NG', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            })}%`;
        case 'number':
        default:
            return Number(val).toLocaleString('en-NG', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
    }
};

export const FOStatCard = ({
    title,
    currentValue,
    previousValue,
    percentageChange,
    valueType = 'number',
}: IncomingOrdersStatCardProps) => {
    const isIncreasing = currentValue >= previousValue;
    const delta = Number(Math.abs(percentageChange));
    const deltaDisplay = isNaN(delta)
        ? '0'
        : delta.toLocaleString('en-NG', {
              minimumFractionDigits: delta % 1 === 0 ? 0 : 1,
              maximumFractionDigits: 1,
          });

    return (
        <div className="bg-white rounded-md p-4 border gap-2 flex flex-col">
            <div className="text-sm text-muted-foreground font-medium">{title}</div>
            <div className="flex flex-col items-start justify-between">
                <div className="text-2xl font-bold tracking-tight">
                    <span>{formatValue(currentValue, valueType)}</span>
                </div>
                <div
                    className={cn(
                        isIncreasing ? 'text-green-600' : 'text-red-600',
                        'flex items-center gap-1 h-5 text-xs rounded-full mt-1',
                    )}
                >
                    {isIncreasing ? (
                        <ArrowUp size={14} />
                    ) : (
                        <ArrowDown size={14} />
                    )}
                    {deltaDisplay}%
                    <span className="text-muted-foreground ml-0.5">vs last 24hr</span>
                </div>
            </div>
        </div>
    );
};
