import React, { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';

interface WorkPeriodItem {
    id: string;
    area?: string;
    start: string;
    startTime?: string; // Added for real-time tracking
    end?: string;
    duration?: string;
    isActive?: boolean;
    monthYearKey: string;
}

interface WorkPeriodHistoryProps {
    groupedPeriods: { [key: string]: WorkPeriodItem[] };
    onPeriodClick?: (id: string) => void;
    highlightedPeriodId?: string;
}

const HistoryItem = ({
    period,
    isFocused,
    isHighlighted,
    onFocus,
    onClick,
}: {
    period: WorkPeriodItem;
    isFocused: boolean;
    isHighlighted: boolean;
    onFocus: () => void;
    onClick?: () => void;
}) => {
    const [liveDuration, setLiveDuration] = useState(period.duration);

    useEffect(() => {
        if (!period.isActive || !period.startTime) return;

        const updateDuration = () => {
            const start = new Date(period.startTime!);
            const now = new Date();
            const totalSeconds = differenceInSeconds(now, start);

            if (totalSeconds < 0) return;

            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            setLiveDuration(`${h}h ${m}m`);
        };

        updateDuration();
        const interval = setInterval(updateDuration, 60000); // Update every minute for history list

        return () => clearInterval(interval);
    }, [period.isActive, period.startTime, period.duration]);

    return (
        <div
            onClick={() => {
                onFocus();
                onClick?.();
            }}
            className={`px-2 py-3 rounded-md transition-all cursor-pointer ${
                period.isActive
                    ? 'bg-[#FFF2E8] ring-1 ring-[#FFEDD5]'
                    : isFocused
                      ? 'bg-[#DBEAFE] ring-1 ring-[#3B82F6] shadow-sm'
                      : isHighlighted
                        ? 'bg-yellow-50 ring-2 ring-yellow-400'
                        : 'hover:bg-[#EFF6FF]'
            }`}
        >
            <p className="text-[13px] text-[#6B7281] leading-relaxed flex items-center gap-1.5 flex-wrap">
                <span className={isFocused ? 'text-[#1E40AF] font-bold' : ''}>
                    {period.start} {period.end ? `– ${period.end}` : ''}
                    {liveDuration ? ` ( Total work Hour ${liveDuration} )` : ''}
                </span>
                {period.area && (
                    <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            period.area === 'Fast Food'
                                ? 'bg-[#FFF0DB] text-[#B45309]'
                                : 'bg-[#EEF4FF] text-[#007BFF]'
                        }`}
                    >
                        {period.area}
                    </span>
                )}
            </p>
        </div>
    );
};

const WorkPeriodHistory = ({
    groupedPeriods,
    onPeriodClick,
    highlightedPeriodId,
}: WorkPeriodHistoryProps) => {
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const monthYearKeys = Object.keys(groupedPeriods);

    return (
        <div className="flex-1 pr-12">
            <div className="space-y-1 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                {monthYearKeys.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        No history found
                    </p>
                ) : (
                    monthYearKeys.map((monthYear) => (
                        <div key={monthYear} className="mb-4">
                            <h3 className="text-[18px] font-semibold text-[#000000] mb-2">
                                {monthYear}
                            </h3>
                            <div className="space-y-1">
                                {groupedPeriods[monthYear].map((period) => (
                                    <HistoryItem
                                        key={period.id}
                                        period={period}
                                        isFocused={focusedId === period.id}
                                        isHighlighted={
                                            highlightedPeriodId === period.id
                                        }
                                        onFocus={() => setFocusedId(period.id)}
                                        onClick={() =>
                                            onPeriodClick?.(period.id)
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WorkPeriodHistory;
