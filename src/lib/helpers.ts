import { format, isValid, parseISO } from 'date-fns';

const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-()]{8,}$/;
    return phoneRegex.test(phone);
};

type ValidationCriteria = {
    length: boolean;
    hasSpecial: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    equal: boolean;
};

const formatDate = (dateString: string): string => {
    if (!dateString) return 'Invalid date';

    const date = parseISO(dateString);

    if (!isValid(date)) return 'Invalid date';

    return format(date, "PP 'at' p");
};

const formatDateStacked = (
    dateString: string,
): { date: string; time: string } => {
    if (!dateString) return { date: 'Invalid date', time: '' };

    const date = parseISO(dateString);

    if (!isValid(date)) return { date: 'Invalid date', time: '' };

    return {
        date: format(date, 'PP'),
        time: format(date, 'p'),
    };
};

const getNights = (startDate: string | Date, endDate: string | Date) => {
    if (!startDate || !endDate) return 0;

    const getPureDate = (dateInput: string | Date) => {
        if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
            return dateInput.trim();
        }
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const pureStart = getPureDate(startDate);
    const pureEnd = getPureDate(endDate);

    if (!pureStart || !pureEnd) return 0;

    const [y1, m1, d1] = pureStart.split('-').map(Number);
    const [y2, m2, d2] = pureEnd.split('-').map(Number);

    const utcStart = Date.UTC(y1, m1 - 1, d1);
    const utcEnd = Date.UTC(y2, m2 - 1, d2);

    const diffDays = Math.round((utcEnd - utcStart) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

export { formatDate, formatDateStacked, getNights, validatePhone };
export type { ValidationCriteria };
