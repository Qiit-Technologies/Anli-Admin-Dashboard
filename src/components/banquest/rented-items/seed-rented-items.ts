import { RentalStats, RentedItemRow } from './types';

const SPEAKER_IMG =
    'https://images.unsplash.com/photo-1598488035139-bdcb1f65bdea?w=120&h=120&fit=crop';
const TABLE_IMG =
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=120&h=120&fit=crop';
const PROJECTOR_IMG =
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=120&h=120&fit=crop';
const LIGHT_IMG =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop';

const DEFAULT_CONTACT = {
    title: 'Mr',
    firstName: 'John',
    lastName: 'Tobi',
    email: 'Movidaulu@gmail.com',
    address: 'No23 kunle ajayi street lekki lagos',
    phone: '(+234) 802 345 0003',
};

export const SEED_RENTED_ITEMS: RentedItemRow[] = [
    {
        id: 'rent-1',
        amenityId: 'sound-system',
        amenityName: 'Sound System',
        amenitySubtitle: '500w system',
        imageUrl: SPEAKER_IMG,
        category: 'Audio',
        description: 'Premium professional sound system',
        renterPhone: '0909876548',
        renterName: 'John Okafor',
        rentedDate: '24th-june-2028',
        rentedTime: '10:00 AM',
        eventType: 'Corporate event',
        dueDate: '25th-june-2028',
        dueTime: '10:00 AM',
        rentedQuantity: 3,
        condition: 'excellent',
        status: 'returned',
        amountPaid: 125000,
        returnedDate: '24th-june-2028',
        returnedTime: '11:00 AM',
        createdBy: 'Frankly',
        dateCreated: '24th-june-2028',
        contact: DEFAULT_CONTACT,
    },
    {
        id: 'rent-2',
        amenityId: 'round-table',
        amenityName: 'Round Table',
        amenitySubtitle: 'Seating 8 people',
        imageUrl: TABLE_IMG,
        category: 'Furniture',
        description: 'Elegant round banquet table',
        renterPhone: '0801234567',
        renterName: 'Faith Obi',
        rentedDate: '24th-june-2028',
        rentedTime: '10:00 AM',
        eventType: 'Project Lunch',
        dueDate: '25th-june-2028',
        dueTime: '10:00 AM',
        rentedQuantity: 20,
        condition: 'good',
        status: 'rented',
        amountPaid: 300000,
        createdBy: 'Frankly',
        dateCreated: '24th-june-2028',
        contact: {
            ...DEFAULT_CONTACT,
            firstName: 'Faith',
            lastName: 'Obi',
        },
    },
    {
        id: 'rent-3',
        amenityId: 'projector',
        amenityName: 'Projector',
        amenitySubtitle: '4k projector',
        imageUrl: PROJECTOR_IMG,
        category: 'Visuals',
        description: 'HD conference projector',
        renterPhone: '0709876543',
        renterName: 'Musa Abul',
        rentedDate: '24th-june-2028',
        rentedTime: '10:00 AM',
        eventType: 'Birthday Party',
        dueDate: '25th-june-2028',
        dueTime: '10:00 AM',
        rentedQuantity: 8,
        condition: 'excellent',
        status: 'rented',
        amountPaid: 280000,
        createdBy: 'Frankly',
        dateCreated: '24th-june-2028',
        contact: {
            ...DEFAULT_CONTACT,
            firstName: 'Musa',
            lastName: 'Abul',
        },
    },
    {
        id: 'rent-4',
        amenityId: 'led-light',
        amenityName: 'LED Light',
        amenitySubtitle: 'Stage Lighting',
        imageUrl: LIGHT_IMG,
        category: 'Light',
        description: 'Professional stage lighting',
        renterPhone: '0812345678',
        renterName: 'Yul Manu',
        rentedDate: '24th-june-2028',
        rentedTime: '10:00 AM',
        eventType: 'Church Event',
        dueDate: '25th-june-2028',
        dueTime: '10:00 AM',
        rentedQuantity: 15,
        condition: 'good',
        status: 'over-due',
        amountPaid: 270000,
        createdBy: 'Frankly',
        dateCreated: '24th-june-2028',
        contact: {
            ...DEFAULT_CONTACT,
            firstName: 'Yul',
            lastName: 'Manu',
        },
    },
];

export const SEED_RENTAL_STATS: RentalStats = {
    totalRented: 40,
    currentlyRented: 24,
    returnedThisMonth: 15,
    overdue: 3,
    totalTrend: 12,
    rentedTrend: 10,
    returnedTrend: 10,
    overdueTrend: -10,
};

export function computeRentalStats(items: RentedItemRow[]): RentalStats {
    const currentlyRented = items.filter((i) => i.status === 'rented').length;
    const returned = items.filter((i) => i.status === 'returned').length;
    const overdue = items.filter((i) => i.status === 'over-due').length;
    return {
        ...SEED_RENTAL_STATS,
        totalRented: items.length || SEED_RENTAL_STATS.totalRented,
        currentlyRented: currentlyRented || SEED_RENTAL_STATS.currentlyRented,
        returnedThisMonth: returned || SEED_RENTAL_STATS.returnedThisMonth,
        overdue: overdue || SEED_RENTAL_STATS.overdue,
    };
}

export function getRentedItemById(
    items: RentedItemRow[],
    id: string,
): RentedItemRow | undefined {
    return (
        items.find((i) => i.id === id) ??
        SEED_RENTED_ITEMS.find((i) => i.id === id)
    );
}
