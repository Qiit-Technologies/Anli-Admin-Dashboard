import { Activity, DollarSign, Users } from 'lucide-react';
import React from 'react';

interface CardProps {
    title: string;
    value: number;
    description: string;
    icon: React.JSX.Element;
}

export const tableStats = [
    {
        title: 'Total number of reserved Tables',
        description: '+20.1% from last month',
        value: 234,
        icon: <DollarSign size={18} />,
    },
    {
        title: 'Total number of Empty Tables',
        description: '+180.1% from last month',
        value: 23,
        icon: <Users size={18} />,
    },
    {
        title: 'Total number of Dine in Areas',
        description: '+19% from last month',
        value: 1234,
        icon: <Activity size={18} />,
    },
];

export const TableStatsCard = ({
    title,
    description,
    value,
    icon,
}: CardProps) => {
    return (
        <div className="bg-white border relative rounded-lg px-4 py-6">
            <div className="absolute top-5 right-5 w-5 h-5 bg-white rounded-lg opacity-50">
                {icon}
            </div>
            <div className="relative w-full">
                <span>{title}</span>
            </div>
            <div className="flex flex-col gap-0">
                <h1 className="text-xl font-bold">{value}</h1>
                <span className="text-xs text-muted-foreground leading-none">
                    {description}
                </span>
            </div>
        </div>
    );
};
