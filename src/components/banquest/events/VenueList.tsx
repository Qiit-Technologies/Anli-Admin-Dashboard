'use client';

import { CalendarVenueRow } from './lib/types';
import VenueSection from './VenueSection';

interface VenueListProps {
    venues: CalendarVenueRow[];
}

export default function VenueList({ venues }: VenueListProps) {
    if (venues.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground text-sm">
                No events in this period. Create a booking or switch to another
                month or week.
            </div>
        );
    }

    return (
        <div className="divide-y relative">
            {venues.map((venue) => (
                <VenueSection key={venue.id} venue={venue} />
            ))}
        </div>
    );
}
