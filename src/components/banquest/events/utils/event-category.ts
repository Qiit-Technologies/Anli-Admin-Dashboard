import { BookingForm } from '../../types';

export type EventCategory = 'social' | 'corporate' | 'private';

export const EVENT_CATEGORY_META: Record<
    EventCategory,
    {
        label: string;
        summaryLabel: string;
        dot: string;
        accentBar: string;
        topAccent: string;
        cardBorder: string;
        cardBg: string;
        titleText: string;
        pill: string;
        pillText: string;
    }
> = {
    social: {
        label: 'Social Event',
        summaryLabel: 'Social Event',
        dot: 'bg-emerald-600',
        accentBar: 'bg-emerald-700',
        topAccent: 'border-t-emerald-700',
        cardBorder: 'border-emerald-200',
        cardBg: 'bg-[#F0F9F4]',
        titleText: 'text-emerald-800',
        pill: 'bg-[#F0F9F4]',
        pillText: 'text-emerald-800',
    },
    corporate: {
        label: 'Cooperative Event',
        summaryLabel: 'Corporate Event',
        dot: 'bg-sky-600',
        accentBar: 'bg-sky-700',
        topAccent: 'border-t-sky-700',
        cardBorder: 'border-sky-200',
        cardBg: 'bg-[#EFF6FF]',
        titleText: 'text-sky-800',
        pill: 'bg-[#EFF6FF]',
        pillText: 'text-sky-800',
    },
    private: {
        label: 'Private Event',
        summaryLabel: 'Private Event',
        dot: 'bg-orange-600',
        accentBar: 'bg-orange-600',
        topAccent: 'border-t-orange-600',
        cardBorder: 'border-orange-200',
        cardBg: 'bg-[#FFF7ED]',
        titleText: 'text-orange-800',
        pill: 'bg-[#FFF7ED]',
        pillText: 'text-orange-800',
    },
};

export function getEventCategory(
    eventType: string,
    eventCategory?: string | null,
): EventCategory {
    const cat = (eventCategory || '').toLowerCase().trim();
    if (cat === 'social') return 'social';
    if (cat === 'corporate' || cat === 'cooperative') return 'corporate';
    if (cat === 'private') return 'private';

    const t = (eventType || '').toLowerCase().trim();
    if (t === 'social') return 'social';
    if (t === 'corporate' || t === 'cooperative' || t === 'conference')
        return 'corporate';
    if (t === 'private' || t === 'wedding') return 'private';
    if (
        t.includes('corporate') ||
        t.includes('conference') ||
        t.includes('seminar') ||
        t.includes('meeting') ||
        t.includes('retreat') ||
        t.includes('launch') ||
        t.includes('sales') ||
        t.includes('board') ||
        t.includes('team')
    ) {
        return 'corporate';
    }
    if (
        t.includes('private') ||
        t.includes('birthday') ||
        t.includes('party') ||
        t.includes('dinner') ||
        t.includes('anniversary') ||
        t.includes('family') ||
        t.includes('gathering')
    ) {
        return 'private';
    }
    return 'social';
}

export function summarizeEventsByCategory(bookings: BookingForm[]) {
    const active = bookings.filter((b) => b.bookingStatus !== 'cancelled');
    const counts: Record<EventCategory, number> = {
        social: 0,
        corporate: 0,
        private: 0,
    };
    for (const b of active) {
        counts[getEventCategory(b.eventType, b.eventCategory)] += 1;
    }
    return { total: active.length, counts };
}
