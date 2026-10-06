'use client';
import useStayViewStore from '@/store/useSV';
import { format } from 'date-fns';

interface CalendarHeaderProps {
    dates: Date[];
}

const CalendarHeader = ({ dates }: CalendarHeaderProps) => {
    const setSelectedDate = useStayViewStore((state) => state.setSelectedDate);

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `200px repeat(${dates.length}, minmax(100px, 1fr))`,
    };

    return (
        <div style={gridStyle} className="w-full">
            <div className="p-2 text-sm border-b flex items-center justify-center font-medium border-r sticky left-0 bg-gray-100 z-10">
                Room Type / Number
            </div>

            {dates.map((date, index) => {
                const isToday =
                    format(date, 'yyyy-MM-dd') ===
                    format(new Date(), 'yyyy-MM-dd');

                return (
                    <div
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 text-xs text-center font-medium border-r border-r-black last:border-r-0 ${
                            isToday
                                ? 'bg-hexbrand text-white'
                                : 'bg-black text-white'
                        }`}
                    >
                        <div>{format(date, 'EEE')}</div>
                        <div className="text-xs">{format(date, 'd')}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default CalendarHeader;
