'use client';

import { motion } from 'framer-motion';
import { UtensilsCrossed, Wine } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/context/menu-context';
import { useRestaurantInfo } from '@/components/menu/hooks/useMenuData';

export default function LandingPage() {
    const { settings } = useAppContext();
    const { restaurant, isLoading } = useRestaurantInfo(settings.restaurantId);

    const restaurantName =
        restaurant?.name || settings.restaurantName || 'Restaurant';
    const coverImage = restaurant?.coverImage || '/restaurantBg.jpg';

    return (
        <div className="relative flex min-h-dvh items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('${coverImage}')`,
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
            >
                {settings.restaurantLogo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm shadow-xl"
                    >
                        <Image
                            src={settings.restaurantLogo}
                            alt="Restaurant logo"
                            fill
                            className="object-contain p-2"
                        />
                    </motion.div>
                )}

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
                >
                    {isLoading ? (
                        <span className="inline-block h-12 w-64 animate-pulse rounded-lg bg-white/20" />
                    ) : (
                        restaurantName
                    )}
                </motion.h1>
                {/* 
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="h-px w-24"
                    style={{ backgroundColor: 'var(--menu-brand)' }}
                /> */}

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="text-lg font-light tracking-widest uppercase text-white/70"
                >
                    Choose Menu
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex flex-col items-center gap-4 sm:flex-row"
                >
                    <Link
                        href={`/custom-menu/${settings.restaurantId}/restaurant-menu/foods`}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 rounded-[24px] px-8 py-4 text-base font-semibold text-white transition-all duration-200"
                            style={{
                                backgroundColor: 'var(--menu-brand)',
                            }}
                        >
                            <UtensilsCrossed className="h-6 w-6" />
                            Food Menu
                        </motion.button>
                    </Link>

                    <Link
                        href={`/custom-menu/${settings.restaurantId}/restaurant-menu/drinks`}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 rounded-[24px] border-2 px-8 py-4 text-base font-semibold text-white transition-all duration-200"
                            style={{ borderColor: 'var(--menu-brand)' }}
                        >
                            <Wine className="h-6 w-6" />
                            Drinks Menu
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
