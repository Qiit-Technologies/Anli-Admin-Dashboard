import type { MenuSearchModule } from './types';

const MODULE_PREFIXES: Array<{ prefix: string; module: MenuSearchModule }> = [
    { prefix: '/front-of-house', module: 'restaurant' },
    { prefix: '/bar', module: 'bar' },
    { prefix: '/kitchen', module: 'kitchen' },
];

export function getMenuSearchModule(pathname: string): MenuSearchModule | null {
    const match = MODULE_PREFIXES.find(({ prefix }) =>
        pathname.startsWith(prefix),
    );
    return match?.module ?? null;
}

export function isMenuSearchModulePath(pathname: string): boolean {
    return getMenuSearchModule(pathname) !== null;
}
