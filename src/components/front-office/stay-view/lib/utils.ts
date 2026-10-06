import { addDays, startOfDay } from 'date-fns';

export function generateDates(startDate: Date, numberOfDays: number): Date[] {
    const dates: Date[] = [];
    const normalizedStartDate = startOfDay(startDate);

    for (let i = 0; i < numberOfDays; i++) {
        dates.push(addDays(normalizedStartDate, i));
    }

    return dates;
}
