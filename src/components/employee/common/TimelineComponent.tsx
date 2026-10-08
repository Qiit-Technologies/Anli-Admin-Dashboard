'use client';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface Props {
    title: string;
    description: string;
    data: {
        id: number;
        name: string;
        start: string;
        end: string;
        color: string;
    }[];
    extend?: ReactNode;
}
export const TimelineComponent = ({
    title,
    description,
    data,
    extend,
}: Props) => {
    const [date] = useState(new Date());

    const timelineStart = '09:00';
    const timelineEnd = '12:00';
    const timeLabels = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];

    const timelineStartMinutes = timeToMinutes(timelineStart);
    const timelineEndMinutes = timeToMinutes(timelineEnd);
    const timelineDuration = timelineEndMinutes - timelineStartMinutes;

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-none">
            <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription className="mt-1">
                            {description}
                        </CardDescription>
                    </div>
                    {extend ?? (
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                                {date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </Button>
                    )}
                </div>
            </CardHeader>

            <div className="p-4">
                <div className="relative">
                    <div className="flex justify-between text-xs text-gray-500 mb-4 pl-8 pr-4">
                        {timeLabels.map((label) => (
                            <span
                                key={label}
                                className="transform -translate-x-1/2"
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    <div className="relative h-64">
                        {timeLabels.map((label, index) => (
                            <div
                                key={`grid-${label}`}
                                className="absolute top-0 h-full border-l-2 border-dashed border-gray-200"
                                style={{
                                    left: `${(index / (timeLabels.length - 1)) * 100}%`,
                                }}
                            ></div>
                        ))}

                        <div className="relative space-y-3 pt-2">
                            {data.map((event, index) => {
                                const eventStartMinutes = timeToMinutes(
                                    event.start,
                                );
                                const eventEndMinutes = timeToMinutes(
                                    event.end,
                                );

                                const leftPosition =
                                    ((eventStartMinutes -
                                        timelineStartMinutes) /
                                        timelineDuration) *
                                    100;
                                const width =
                                    ((eventEndMinutes - eventStartMinutes) /
                                        timelineDuration) *
                                    100;

                                const theme =
                                    colorThemes[
                                        event.color as keyof typeof colorThemes
                                    ] || colorThemes.lightBlue;

                                return (
                                    <div
                                        key={event.id}
                                        className={`absolute w-full h-10 flex items-center rounded-lg px-3 ${theme.bg}`}
                                        style={{
                                            left: `${leftPosition}%`,
                                            width: `${width}%`,
                                            top: `${index * 56}px`,
                                        }}
                                    >
                                        <div
                                            className={`flex items-center gap-3 w-full`}
                                        >
                                            <span
                                                className={`py-1 px-2.5 rounded-md text-xs font-bold ${theme.pillBg} ${theme.pillText}`}
                                            >
                                                {event.start}
                                            </span>
                                            <span
                                                className={`font-medium text-sm truncate ${theme.text}`}
                                            >
                                                {event.name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const colorThemes = {
    orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-900',
        pillBg: 'bg-orange-500',
        pillText: 'text-white',
    },
    darkBlue: {
        bg: 'bg-slate-800',
        text: 'text-white',
        pillBg: 'bg-slate-500',
        pillText: 'text-white',
    },
    lightBlue: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-900',
        pillBg: 'bg-yellow-500',
        pillText: 'text-white',
    },
    green: {
        bg: 'bg-green-100',
        text: 'text-green-900',
        pillBg: 'bg-green-600',
        pillText: 'text-white',
    },
};

const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};
