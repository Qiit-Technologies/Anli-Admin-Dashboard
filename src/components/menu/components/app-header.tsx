'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, UtensilsCrossed, Wine, Heart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAppContext } from '@/context/menu-context';

export function AppHeader() {
    const { settings } = useAppContext();
    const rid = settings.restaurantId;
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const navItems = [
        { href: `/custom-menu/${rid}`, label: 'Home', icon: Home },
        {
            href: `/custom-menu/${rid}/restaurant-menu/foods`,
            label: 'FOOD MENU',
            icon: UtensilsCrossed,
        },
        {
            href: `/custom-menu/${rid}/restaurant-menu/drinks`,
            label: 'DRINKS MENU',
            icon: Wine,
        },
        {
            href: `/custom-menu/${rid}/favourites`,
            label: 'My Favourites',
            icon: Heart,
        },
    ];

    return (
        <header
            className="sticky top-0 z-50 border-b border-border lg:hidden"
            style={{
                backgroundColor: 'var(--menu-brand)',
                borderColor: 'var(--menu-border)',
            }}
        >
            <div className="flex h-14 items-center gap-3 px-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/20">
                            <Menu className="h-6 w-6 text-white" />
                        </button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-72 p-0"
                        style={{
                            borderColor: 'var(--menu-border)',
                            backgroundColor: 'var(--menu-background)',
                        }}
                    >
                        <div
                            className="flex h-14 items-center justify-between border-b px-4"
                            style={{ borderColor: 'var(--menu-border)' }}
                        >
                            <span
                                className="text-lg font-bold"
                                style={{ color: 'var(--menu-brand)' }}
                            >
                                {settings.restaurantName || 'Restaurant'}
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                                style={{ color: 'var(--menu-foreground)' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        'var(--menu-secondary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        'transparent';
                                }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-1 p-3">
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
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                                        style={
                                            isActive
                                                ? {
                                                      backgroundColor:
                                                          'var(--menu-brand)',
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
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </SheetContent>
                </Sheet>

                <Link href={`/custom-menu/${rid}`} className="flex-1">
                    <h1 className="text-xl font-bold text-white">
                        {settings.restaurantName || 'Restaurant'}
                    </h1>
                </Link>
            </div>
        </header>
    );
}
