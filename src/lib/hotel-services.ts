/**
 * Parses hotel services string into an array of objects with label and value properties
 * @param servicesString - Comma-separated string of services (e.g., "front_office,housekeeping,restaurant")
 * @returns Array of objects with label (formatted) and value (original) properties
 */
export function parseHotelServices(servicesString: string): Array<{ label: string; value: string }> {
    if (!servicesString || typeof servicesString !== 'string') {
        return [];
    }

    return servicesString
        .split(',')
        .map((service: string) => {
            const trimmedService = service.trim();
            return {
                label: trimmedService
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                value: trimmedService,
            };
        })
        .filter(service => service.value.length > 0);
}

/**
 * Hook to get formatted hotel services from hotel response
 * @param hotelResponse - Response object from hotel API
 * @returns Array of formatted hotel services
 */
export function useHotelServices(hotelResponse: any): Array<{ label: string; value: string }> {
    const servicesString = hotelResponse?.data?.services || '';
    return parseHotelServices(servicesString);
}
