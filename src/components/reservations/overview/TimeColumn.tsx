'use client';

import { formatHour } from './utils';

interface TimeColumnProps {
    hours: number[];
    hourHeight?: number;
}

export default function TimeColumn({
    hours,
    hourHeight = 80,
}: TimeColumnProps) {
    return (
        <div className="border-r border-gray-200 bg-[#F9FAFB] sticky left-0 z-10 w-20">
            {hours.map((hour) => (
                <div
                    key={hour}
                    className="border-b border-gray-100 pr-3 text-right"
                    style={{ height: `${hourHeight}px` }}
                >
                    <span className="text-xs text-gray-500 -mt-2 inline-block">
                        {formatHour(hour)}
                    </span>
                </div>
            ))}
        </div>
    );
}
