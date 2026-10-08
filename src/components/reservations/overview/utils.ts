import { format } from 'date-fns';
import { DayInfo, Reservation, BlockedDate } from './types';

export const getBlockedInfoForDay = (
    date: Date,
    blockedDates: BlockedDate[],
): BlockedDate | undefined => {
    const dateStr = formatDateString(date);
    return blockedDates.find((block) => {
        const start = block.startDate.split('T')[0];
        const end = block.endDate.split('T')[0];
        return dateStr >= start && dateStr <= end;
    });
};

export const getDaysInMonth = (date: Date): DayInfo[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek =
        firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days: DayInfo[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        days.push({
            day: prevMonthLastDay - i,
            isCurrentMonth: false,
            date: new Date(prevYear, prevMonth, prevMonthLastDay - i),
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            isCurrentMonth: true,
            date: new Date(year, month, i),
        });
    }

    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            day: i,
            isCurrentMonth: false,
            date: new Date(nextYear, nextMonth, i),
        });
    }

    return days;
};

export const getWeekDays = (selectedDate: Date): Date[] => {
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const days: Date[] = [];
    for (let i = 0; i < 6; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        days.push(date);
    }

    return days;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
};

export const formatDateString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
};

export const getReservationsForDay = (
    date: Date,
    reservations: Reservation[],
): Reservation[] => {
    const dateStr = formatDateString(date);
    return reservations.filter((res) => res.date === dateStr);
};

export const hasReservations = (
    date: Date,
    reservations: Reservation[],
): boolean => {
    const dateStr = formatDateString(date);
    return reservations.some((res) => res.date === dateStr);
};

export const getReservationPosition = (
    startTime: string,
    endTime: string,
    hourHeight: number = 60,
    startHour: number = 9,
): { top: string; height: string } => {
    const [startH, startMin] = startTime.split(':').map(Number);
    const [endH, endMin] = endTime.split(':').map(Number);

    const startMinutes = (startH - startHour) * 60 + startMin;
    const endMinutes = (endH - startHour) * 60 + endMin;
    const duration = endMinutes - startMinutes;

    return {
        top: `${(startMinutes / 60) * hourHeight}px`,
        height: `${(duration / 60) * hourHeight}px`,
    };
};

export const formatHour = (hour: number): string => {
    const h = Math.floor(hour);
    const m = (hour - h) * 60;
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const period = h >= 12 ? 'PM' : 'AM';
    const minuteStr = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
    return `${displayHour}${minuteStr}${period}`;
};
