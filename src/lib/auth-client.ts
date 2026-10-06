export function getClientAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(
        '(^|;)\\s*access_token\\s*=\\s*([^;]+)',
    );
    return match ? match[2] : null;
}
