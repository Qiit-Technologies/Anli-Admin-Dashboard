import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { differenceInSeconds } from 'date-fns';

interface WorkPeriodActiveCardProps {
    areaName?: string;
    dayOfWork: string;
    timeOfWork: string;
    startTime?: string;
    onEnd: () => void;
    onClick?: () => void;
}

const WorkPeriodActiveCard = ({
    areaName,
    dayOfWork,
    timeOfWork,
    startTime,
    onEnd,
    onClick,
}: WorkPeriodActiveCardProps) => {
    const [duration, setDuration] = useState('0h 0m');

    useEffect(() => {
        if (!startTime) return;

        const updateDuration = () => {
            const start = new Date(startTime);
            const now = new Date();
            const totalSeconds = differenceInSeconds(now, start);

            if (totalSeconds < 0) {
                setDuration('0h 0m');
                return;
            }

            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);

            // For a "WOW" effect, maybe show seconds?
            // The user said "time to be updting real time",
            // usually h/m is enough, but seeing seconds tick is more "real time".
            const s = totalSeconds % 60;
            setDuration(`${h}h ${m}m ${s}s`);
        };

        updateDuration();
        const interval = setInterval(updateDuration, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div
            onClick={onClick}
            className="w-[380px] p-4 bg-white rounded-[20px] border border-[#E5E7EB] h-fit cursor-pointer hover:border-[#007BFF] hover:shadow-md transition-all group"
        >
            {areaName && (
                <p className="text-[#007BFF] font-semibold text-[13px] mb-3 uppercase tracking-wide">
                    {areaName}
                </p>
            )}
            <div className="space-y-4 mb-10">
                <div className="flex flex-col">
                    <span className="text-[#5E6470] text-[14px]">
                        Day of work : {dayOfWork}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[#5E6470] text-[14px]">
                        Time of work : {timeOfWork}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[#5E6470] text-[14px]">
                        Total work Hour : {duration}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEnd();
                    }}
                    className="w-full bg-[#007BFF] hover:bg-[#0069D9] text-white py-6 rounded-[10px] font-bold text-[14px] shadow-sm transition-all"
                >
                    End Work Period
                </Button>
            </div>
        </div>
    );
};

export default WorkPeriodActiveCard;
