'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/menu-context';
import type { MenuItem } from '@/components/menu/data/types';

interface MenuItemCardProps {
    item: MenuItem;
    view: 'grid' | 'list';
}

export function MenuItemCard({ item, view }: MenuItemCardProps) {
    const { toggleFavourite, isFavourite, settings } = useAppContext();
    const rid = settings.restaurantId;
    const fav = isFavourite(item.id);

    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [item.image]);

    // Fallback image URL matching FoodMenu
    const fallbackImage = 'https://placehold.co/600x400?text=No+Image';

    if (view === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <Link
                    href={`/custom-menu/${rid}/item/${item.id}`}
                    className="flex gap-4 rounded-xl bg-card p-3"
                >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                        {(item.image && item.image !== '' && !imageError) ? (
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <Image
                                src={fallbackImage}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        )}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleFavourite(item.id);
                            }}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
                        >
                            <Heart
                                className="h-3.5 w-3.5 transition-colors"
                                style={
                                    fav
                                        ? {
                                              fill: 'var(--menu-brand)',
                                              color: 'var(--menu-brand)',
                                          }
                                        : { color: '#9ca3af' }
                                }
                            />
                        </button>
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-1">
                        <h3 className="text-base font-bold text-foreground leading-tight capitalize">
                            {item.name}
                        </h3>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: 'var(--menu-brand)' }}
                        >
                            {item.currency} {item.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <Link
                href={`/custom-menu/${rid}/item/${item.id}`}
                className="group flex flex-col overflow-hidden rounded-xl bg-card"
            >
                <div className="relative aspect-square overflow-hidden rounded-xl">
                    {(item.image && item.image !== '' && !imageError) ? (
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <Image
                            src={fallbackImage}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleFavourite(item.id);
                        }}
                        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors"
                    >
                        <Heart
                            className="h-4 w-4 transition-colors"
                            style={
                                fav
                                    ? {
                                          fill: 'var(--menu-brand)',
                                          color: 'var(--menu-brand)',
                                      }
                                    : { color: '#9ca3af' }
                            }
                        />
                    </button>
                </div>
                <div className="flex flex-col gap-0.5 px-1 py-2">
                    <h3 className="text-sm font-bold text-foreground leading-tight">
                        {item.name}
                    </h3>
                    <p
                        className="text-xs font-semibold"
                        style={{ color: 'var(--menu-brand)' }}
                    >
                        {item.currency} {item.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.description}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}
