export interface GuestProfileOverview {
    guestId: string;
    name: string;
    loyaltyTier: string;
    loyaltyPoints: number;
    nationality: string;
    memberSince: string;
    customerType: string;
    totalVisits: number;
    lastVisit: string;
    totalBilled: number;
    totalPaid: number;
    outstandingBalance: number;
    contact: {
        phone: string;
        email: string;
        address: string;
        preferredContact: string;
        emailConsent: boolean;
    };
}

export interface VisitRecord {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string;
    roomTable: string;
    amount: number;
    paymentMethod: string;
    status: 'Completed' | 'Upcoming' | 'Cancelled';
    notes?: string;
}

export interface BillingTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    paymentMethod: string;
    status: 'Paid' | 'Unpaid';
}

export interface FeedbackNote {
    id: string | number;
    title: string;
    content: string;
    createdAt: string;
    author: string;
    room?: string;
    rating?: number;
    ratingDate?: string;
    isStaffNote?: boolean;
}

