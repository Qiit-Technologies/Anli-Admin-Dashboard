/** Normalize NestJS / axios error bodies into a single user-facing string. */
export function getApiErrorMessage(
    error: unknown,
    fallback = 'Something went wrong. Please try again.',
): string {
    const data = (error as { response?: { data?: unknown } })?.response?.data;
    const fallbackMessage =
        error instanceof Error && error.message.trim()
            ? error.message
            : fallback;
    if (typeof data === 'string' && data.trim()) {
        return data;
    }
    if (!data || typeof data !== 'object') {
        return fallbackMessage;
    }
    const message = (data as { message?: unknown }).message;
    if (Array.isArray(message)) {
        return message.map(String).filter(Boolean).join(' ') || fallbackMessage;
    }
    if (typeof message === 'string' && message.trim()) {
        return message;
    }
    return fallbackMessage;
}
