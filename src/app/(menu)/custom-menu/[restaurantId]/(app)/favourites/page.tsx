'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Heart, LayoutGrid, List } from 'lucide-react';
import { useAppContext } from '@/context/menu-context';
import { useMenuItems } from '@/components/menu/hooks/useMenuData';
import { MenuItemCard } from '@/components/menu/components/menu-item-card';

export default function FavouritesPage() {
    const { favourites, settings } = useAppContext();
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const { items: foodItems } = useMenuItems(settings.restaurantId, 'food');
    const { items: drinkItems } = useMenuItems(settings.restaurantId, 'drinks');
    const allItems = [...foodItems, ...drinkItems];

    const favouriteItems = allItems.filter((item) =>
        favourites.includes(item.id),
    );

    return (
        <div className="px-4 py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Favourites
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {favouriteItems.length} saved item
                        {favouriteItems.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex rounded-lg border border-border">
                    <button
                        onClick={() => setView('grid')}
                        className={`flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors ${
                            view === 'grid' ? 'bg-secondary' : ''
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors ${
                            view === 'list' ? 'bg-secondary' : ''
                        }`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {favouriteItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <Heart className="mb-4 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-lg font-medium text-muted-foreground">
                        No favourites yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tap the heart icon on any item to save it here
                    </p>
                </div>
            ) : (
                <div className="mt-4">
                    <AnimatePresence mode="popLayout">
                        <div
                            className={
                                view === 'grid'
                                    ? 'grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                                    : 'flex flex-col gap-3'
                            }
                        >
                            {favouriteItems.map((item) => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    view={view}
                                />
                            ))}
                        </div>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
