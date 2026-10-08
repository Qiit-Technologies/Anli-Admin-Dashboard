import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

export interface ReportsCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down';
    percent: number;
}
const ReportsCard = ({ trend, title, value, percent }: ReportsCardProps) => {
    return (
        <Card className="shadow-none rounded-lg p-4 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <span>{title}</span>
            </div>
            <div>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold">{value}</span>
                    <Badge
                        variant={'default'}
                        className={cn(
                            'flex shadow-none rounded-full items-center justify-center',
                            trend === 'up'
                                ? 'bg-emerald-100 text-emerald-500'
                                : 'bg-danger-100 text-danger-500',
                        )}
                    >
                        {trend === 'up' ? (
                            <ArrowUp className="w-3 h-3" />
                        ) : (
                            <ArrowDown className="w-3 h-3" />
                        )}
                        {percent}%
                    </Badge>
                </div>
            </div>
        </Card>
    );
};

export default ReportsCard;
