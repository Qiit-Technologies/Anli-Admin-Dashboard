interface Coordinates {
    latitude: number;
    longitude: number;
}

interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: Coordinates;
}

interface Contact {
    phone: string;
    email: string;
    website?: string;
}

interface Venue {
    name: string;
    address: Address;
    contact: Contact;
}

interface Price {
    amount: number;
    currency: string;
    early_bird?: {
        amount: number;
        deadline: string;
    };
}

interface Organizer {
    name: string;
    contact: string;
    phone: string;
}

interface Speaker {
    id: number;
    name: string;
    title: string;
    company: string;
    bio: string;
    image: string;
}

interface AgendaItem {
    time: string;
    title: string;
    speaker?: string;
    speakers?: string[];
    duration: number;
}

type EventStatus = 'upcoming' | 'past' | 'cancelled' | 'postponed';
type EventType =
    | 'Conference'
    | 'Workshop'
    | 'Masterclass'
    | 'Forum'
    | 'Panel'
    | 'Networking'
    | 'Webinar';

interface AnliEvent {
    id: number;
    title: string;
    description: string;
    images: string[];
    date: string;
    time: string;
    timeDisplay: string;
    venue: Venue;
    type: EventType;
    status: EventStatus;
    capacity: number;
    registrationRequired: boolean;
    registrationUrl?: string;
    price?: Price;
    organizer: Organizer;
    tags: string[];
    speakers: Speaker[];
    agenda: AgendaItem[];
    requirements: string[];
    amenities: string[];
}

type AnliEvents = AnliEvent[];

export type {
    Address,
    AgendaItem,
    AnliEvent,
    AnliEvents,
    Contact,
    Coordinates,
    EventStatus,
    EventType,
    Organizer,
    Price,
    Speaker,
    Venue,
};
