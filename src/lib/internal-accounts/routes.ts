export function getInternalAccountsBasePath(pathname: string): string {
    if (pathname.startsWith('/front-office')) {
        return '/front-office/internal-accounts';
    }
    if (pathname.startsWith('/front-of-house')) {
        return '/front-of-house/internal-accounts';
    }
    return '/admin/internal-accounts';
}

export function getInternalAccountsPath(
    pathname: string,
    suffix = '',
): string {
    const base = getInternalAccountsBasePath(pathname);
    const normalizedSuffix = suffix ? `/${suffix.replace(/^\/+/, '')}` : '';
    return `${base}${normalizedSuffix}`;
}
