'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UtensilsCrossed, Wine, Heart } from 'lucide-react';
import { useAppContext } from '@/context/menu-context';

export function DesktopSidebar() {
    const { settings } = useAppContext();
    const rid = settings.restaurantId;
    const pathname = usePathname();

    const navItems = [
        { href: `/custom-menu/${rid}`, label: 'Home', icon: Home },
        {
            href: `/custom-menu/${rid}/restaurant-menu/foods`,
            label: 'Food Menu',
            icon: UtensilsCrossed,
        },
        {
            href: `/custom-menu/${rid}/restaurant-menu/drinks`,
            label: 'Drinks Menu',
            icon: Wine,
        },
        {
            href: `/custom-menu/${rid}/favourites`,
            label: 'Favourites',
            icon: Heart,
        },
    ];

    return (
        <aside
            className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto"
            style={{
                borderColor: 'var(--menu-border)',
                backgroundColor: 'var(--menu-background)',
            }}
        >
            <div
                className="flex h-14 items-center border-b border-border px-5"
                style={{ borderColor: 'var(--menu-border)' }}
            >
                <h1
                    className="text-lg font-bold"
                    style={{ color: 'var(--menu-brand)' }}
                >
                    {settings.restaurantName || 'Restaurant'}
                </h1>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === `/custom-menu/${rid}`
                            ? pathname === `/custom-menu/${rid}`
                            : pathname === item.href ||
                              pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                            style={
                                isActive
                                    ? {
                                          backgroundColor: 'var(--menu-brand)',
                                          color: 'var(--menu-primary-foreground)',
                                      }
                                    : {
                                          color: 'var(--menu-muted-foreground)',
                                      }
                            }
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor =
                                        'var(--menu-secondary)';
                                    e.currentTarget.style.color =
                                        'var(--menu-foreground)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor =
                                        'transparent';
                                    e.currentTarget.style.color =
                                        'var(--menu-muted-foreground)';
                                }
                            }}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
