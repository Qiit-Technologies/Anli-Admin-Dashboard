import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PieMetricChart } from '../../chart/PieChart';

interface CardProps {
    title: string;
    value: number | string;
    change: number;
    changeType: 'positive' | 'negative';
    dataPoints: { label: string; value: string | number; color?: string }[];
}
const DataPoints = ({
    color,
    label,
    value,
}: {
    color?: string;
    label: string;
    value: string | number;
}) => {
    return (
        <div className="flex items-center gap-2">
            <div
                style={{ backgroundColor: color }}
                className={cn('rounded-full w-2 h-2')}
            />
            <span>
                {value} {label}
            </span>
        </div>
    );
};
export const MetricCard = ({
    title,
    value,
    change,
    changeType,
    dataPoints,
}: CardProps) => {
    console.log(dataPoints);
    return (
        <Card className="w-full flex rounded-lg shadow-none py-2 px-4">
            <div className="relative w-[150px]">
                <PieMetricChart data={dataPoints as any[]} />
            </div>
            <div className="w-full">
                <CardContent className="px-0 py-2 flex items-center justify-between">
                    <div className="flex flex-col gap-4 w-full">
                        <h1>{title}</h1>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold">{value}</div>
                            <div
                                className={`px-3 py-1 text-xs rounded-full ${changeType === 'positive' ? 'text-green-800 bg-green-200' : 'text-red-500 bg-red-200'}`}
                            >
                                {change > 0
                                    ? `↑ ${change}%`
                                    : `↓ ${Math.abs(change)}%`}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {dataPoints?.map((item, index) => {
                                return (
                                    <DataPoints
                                        label={item.label}
                                        value={item.value}
                                        color={item.color}
                                        key={index}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};
