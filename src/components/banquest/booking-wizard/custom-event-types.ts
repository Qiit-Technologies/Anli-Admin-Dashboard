const STORAGE_KEY = 'banquet-custom-event-types';

export function loadCustomEventTypes(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((value): value is string => typeof value === 'string')
            : [];
    } catch {
        return [];
    }
}

export function saveCustomEventType(name: string): string[] {
    const trimmed = name.trim();
    if (!trimmed) return loadCustomEventTypes();

    const existing = loadCustomEventTypes();
    if (
        existing.some(
            (eventType) => eventType.toLowerCase() === trimmed.toLowerCase(),
        )
    ) {
        return existing;
    }

    const updated = [...existing, trimmed];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
}
