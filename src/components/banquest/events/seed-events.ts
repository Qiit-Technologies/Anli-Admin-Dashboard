import { BookingForm } from '@/components/banquest/types';

function seed(
    partial: Pick<
        BookingForm,
        | 'id'
        | 'eventName'
        | 'eventType'
        | 'eventVenue'
        | 'eventDate'
        | 'eventTime'
        | 'bookingStatus'
        | 'paymentStatus'
        | 'customerEmailAddress'
        | 'customerPhoneNumber'
    >,
): BookingForm {
    return {
        ...partial,
        customerTitle: 'Mr',
        customerName: 'Demo Customer',
        amenities: [],
        food: [],
        total: 0,
        discount: 0,
        tax: 0,
    };
}

const HALLS = ['Banquet Hall A', 'Banquet Hall B', 'Banquet Hall C'] as const;

/** Calendar demo data aligned with the Events page mockup (March–April 2026) */
const CALENDAR_DEMO: Array<{
    day: number;
    month: number;
    name: string;
    type: string;
    time: string;
    hall: (typeof HALLS)[number];
}> = [
    { day: 1, month: 3, name: 'Birthday Party', type: 'Social', time: '09:30 AM', hall: 'Banquet Hall A' },
    { day: 1, month: 3, name: 'Charity Fundraising Gala', type: 'Social', time: '10:00 AM', hall: 'Banquet Hall B' },
    { day: 1, month: 3, name: 'Personal Anniversary Dinner', type: 'Private', time: '11:30 AM', hall: 'Banquet Hall C' },
    { day: 2, month: 3, name: 'Corporate Meeting', type: 'Corporate', time: '08:00 AM', hall: 'Banquet Hall A' },
    { day: 2, month: 3, name: 'Board Meeting', type: 'Corporate', time: '09:30 AM', hall: 'Banquet Hall B' },
    { day: 2, month: 3, name: 'Team Building', type: 'Corporate', time: '11:00 AM', hall: 'Banquet Hall C' },
    { day: 3, month: 3, name: 'Private Dinner', type: 'Private', time: '07:00 PM', hall: 'Banquet Hall A' },
    { day: 4, month: 3, name: 'Executive Retreat', type: 'Corporate', time: '08:30 AM', hall: 'Banquet Hall B' },
    { day: 5, month: 3, name: 'Product Launch', type: 'Corporate', time: '05:30 PM', hall: 'Banquet Hall C' },
    { day: 6, month: 3, name: 'Wedding Reception', type: 'Social', time: '07:30 AM', hall: 'Banquet Hall A' },
    { day: 7, month: 3, name: 'Sales Meeting', type: 'Corporate', time: '10:00 AM', hall: 'Banquet Hall B' },
    { day: 8, month: 3, name: 'Annual General Meeting', type: 'Corporate', time: '02:00 PM', hall: 'Banquet Hall C' },
    { day: 9, month: 3, name: 'Family Gathering', type: 'Private', time: '06:00 PM', hall: 'Banquet Hall A' },
    { day: 10, month: 3, name: 'Engagement Party', type: 'Social', time: '04:00 PM', hall: 'Banquet Hall B' },
    { day: 11, month: 3, name: 'Product Launch Event', type: 'Corporate', time: '05:30 PM', hall: 'Banquet Hall C' },
    { day: 12, month: 3, name: 'Family Reunion Dinner', type: 'Private', time: '07:30 PM', hall: 'Banquet Hall A' },
    { day: 12, month: 3, name: 'Graduation Celebration', type: 'Social', time: '08:30 PM', hall: 'Banquet Hall B' },
    { day: 13, month: 3, name: 'Anniversary Dining', type: 'Private', time: '07:00 PM', hall: 'Banquet Hall C' },
    { day: 14, month: 3, name: 'Corporate Training Workshop', type: 'Corporate', time: '12:30 PM', hall: 'Banquet Hall A' },
    { day: 15, month: 3, name: 'Executive Board Meeting', type: 'Corporate', time: '09:00 AM', hall: 'Banquet Hall B' },
    { day: 16, month: 3, name: 'Baby Shower Celebration', type: 'Social', time: '02:00 PM', hall: 'Banquet Hall C' },
    { day: 17, month: 3, name: 'Charity Fundraising Gala', type: 'Social', time: '06:30 PM', hall: 'Banquet Hall A' },
    { day: 18, month: 3, name: 'Board Meeting', type: 'Corporate', time: '10:00 AM', hall: 'Banquet Hall B' },
    { day: 19, month: 3, name: 'Private Dinner', type: 'Private', time: '08:00 PM', hall: 'Banquet Hall C' },
    { day: 20, month: 3, name: 'Wedding Reception', type: 'Social', time: '11:00 AM', hall: 'Banquet Hall A' },
    { day: 21, month: 3, name: 'Team Building', type: 'Corporate', time: '09:00 AM', hall: 'Banquet Hall B' },
    { day: 22, month: 3, name: 'Birthday Party', type: 'Social', time: '03:00 PM', hall: 'Banquet Hall C' },
    { day: 23, month: 3, name: 'Sales Meeting', type: 'Corporate', time: '01:00 PM', hall: 'Banquet Hall A' },
    { day: 24, month: 3, name: 'Family Gathering', type: 'Private', time: '05:00 PM', hall: 'Banquet Hall B' },
    { day: 25, month: 3, name: 'Engagement Party', type: 'Social', time: '04:30 PM', hall: 'Banquet Hall C' },
    { day: 26, month: 3, name: 'Corporate Meeting', type: 'Corporate', time: '08:00 AM', hall: 'Banquet Hall A' },
    { day: 27, month: 3, name: 'Anniversary Dining', type: 'Private', time: '07:30 PM', hall: 'Banquet Hall B' },
    { day: 28, month: 3, name: 'Product Launch', type: 'Corporate', time: '06:00 PM', hall: 'Banquet Hall C' },
    { day: 29, month: 3, name: 'Charity Fundraising Gala', type: 'Social', time: '10:00 AM', hall: 'Banquet Hall A' },
    { day: 29, month: 3, name: 'Executive Retreat', type: 'Corporate', time: '02:00 PM', hall: 'Banquet Hall B' },
    { day: 30, month: 3, name: 'Wedding Reception', type: 'Social', time: '09:00 AM', hall: 'Banquet Hall C' },
    { day: 31, month: 3, name: 'Annual General Meeting', type: 'Corporate', time: '11:00 AM', hall: 'Banquet Hall A' },
    { day: 3, month: 4, name: 'Baby Shower Celebration', type: 'Private', time: '02:00 PM', hall: 'Banquet Hall A' },
    { day: 5, month: 4, name: 'Corporate Meeting', type: 'Corporate', time: '09:00 AM', hall: 'Banquet Hall B' },
    { day: 8, month: 4, name: 'Birthday Party', type: 'Social', time: '04:00 PM', hall: 'Banquet Hall C' },
    { day: 10, month: 4, name: 'Tech Innovation Summit', type: 'Corporate', time: '10:00 AM', hall: 'Banquet Hall B' },
    { day: 12, month: 4, name: 'Engagement Party', type: 'Social', time: '05:00 PM', hall: 'Banquet Hall A' },
    { day: 15, month: 4, name: 'Private Dinner', type: 'Private', time: '07:00 PM', hall: 'Banquet Hall C' },
    { day: 18, month: 4, name: 'Sales Meeting', type: 'Corporate', time: '01:30 PM', hall: 'Banquet Hall B' },
    { day: 22, month: 4, name: 'Wedding Reception', type: 'Social', time: '08:00 AM', hall: 'Banquet Hall A' },
    { day: 25, month: 4, name: 'Board Meeting', type: 'Corporate', time: '10:30 AM', hall: 'Banquet Hall C' },
];

export const SEED_BANQUET_EVENTS: BookingForm[] = CALENDAR_DEMO.map((row, i) =>
    seed({
        id: 9000 + i,
        eventName: row.name,
        eventType: row.type,
        eventVenue: row.hall,
        eventDate: `2026-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`,
        eventTime: row.time,
        bookingStatus: 'confirmed',
        paymentStatus: i % 3 === 0 ? 'partial' : 'paid',
        customerEmailAddress: 'demo@example.com',
        customerPhoneNumber: `0800000${String(i).padStart(4, '0')}`,
    }),
);

const DEMO_EVENTS_ENABLED =
    process.env.NEXT_PUBLIC_BANQUET_DEMO_EVENTS === 'true';

/** API bookings only unless demo flag is enabled */
export function resolveEventBookings(bookings: BookingForm[]): BookingForm[] {
    const active = bookings.filter((b) => b.bookingStatus !== 'cancelled');

    if (!DEMO_EVENTS_ENABLED) {
        return active;
    }

    const map = new Map<number, BookingForm>();
    for (const event of SEED_BANQUET_EVENTS) {
        map.set(event.id, event);
    }
    for (const event of active) {
        map.set(event.id, event);
    }
    return Array.from(map.values());
}
