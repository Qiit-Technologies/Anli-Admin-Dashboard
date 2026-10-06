import { Venue } from '../types';

export const getFullAddress = (venue: Venue): string => {
    const { address } = venue;
    const parts = [
        address?.street,
        address?.city,
        address?.state,
        address?.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Address not available';
};

export const getVenueDisplay = (venue: Venue): string => {
    return `${venue.name}, ${venue.address.city}`;
};
