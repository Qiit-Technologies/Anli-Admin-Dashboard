import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

type IncomingOrdersStatCardProps = {
    title: string;
    currentValue: number;
    previousValue: number;
    percentageChange: any;
};

export const IncomingOrdersStatCard = ({
    title,
    currentValue,
    previousValue,
    percentageChange,
}: IncomingOrdersStatCardProps) => {
    const isIncreasing = currentValue >= previousValue;

    return (
        <div className="bg-white rounded-md p-4 border gap-2 flex flex-col">
            <div>{title}</div>
            <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                    <span>{currentValue}</span>
                </div>
                <div
                    className={cn(
                        isIncreasing
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600',
                        'flex items-center px-2 gap-1 h-5 text-xs rounded-full',
                    )}
                >
                    {isIncreasing ? (
                        <ArrowUp size={12} />
                    ) : (
                        <ArrowDown size={12} />
                    )}
                    {Math.abs(percentageChange)}%
                </div>
            </div>
        </div>
    );
};
