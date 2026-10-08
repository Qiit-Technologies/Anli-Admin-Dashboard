'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomerHeader from '@/components/restaurants/CustomerHeader';
import RestaurantSearchView from '@/components/restaurants/RestaurantSearchView';
import { restaurantService, Restaurant } from '@/services/restaurant.service';
import { customerAuthService } from '@/services/customerAuth.service';
import toast from 'react-hot-toast';

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
    const [locationName, setLocationName] = useState('Lekki Phase 1');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const featured = await restaurantService.getFeatured();
                setAllRestaurants(featured);

                const nearby = await restaurantService.getNearby(6.45, 3.47);
                setNearbyRestaurants(nearby);

                const user = customerAuthService.getUser();
                if (user) {
                    const favs = await customerAuthService.getFavorites();
                    setFavorites(favs.map((f: any) => f.id));
                }
            } catch (err) {
                console.error('Error loading search page data:', err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setRestaurants(allRestaurants);
            return;
        }

        let cancelled = false;
        const doSearch = async () => {
            setLoading(true);
            try {
                const res = await restaurantService.search(searchQuery.trim(), undefined, 1, 20);
                if (!cancelled) {
                    setRestaurants(res.restaurants);
                }
            } catch {
                if (!cancelled) {
                    // Fallback to local filter
                    const query = searchQuery.toLowerCase();
                    const filtered = allRestaurants.filter(
                        (r) =>
                            r.name.toLowerCase().includes(query) ||
                            r.tags?.toLowerCase().includes(query) ||
                            r.address?.toLowerCase().includes(query)
                    );
                    setRestaurants(filtered);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        const timer = setTimeout(doSearch, 250);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [searchQuery, allRestaurants]);

    return (
        <div className="min-h-screen bg-[#F6F6F8]">
            <CustomerHeader
                onSearchClick={() => {}}
            />

            <main className="pt-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <RestaurantSearchView
                        searchQuery={searchQuery}
                        onSearchChange={(q) => {
                            setSearchQuery(q);
                        }}
                        onCloseSearch={() => {
                            router.push('/restaurants');
                        }}
                        restaurants={restaurants}
                        allRestaurants={allRestaurants}
                        nearbyRestaurants={nearbyRestaurants}
                        locationName={locationName}
                        loading={loading}
                        favorites={favorites}
                        onToggleFavorite={async (id) => {
                            try {
                                await customerAuthService.toggleFavorite(id);
                                setFavorites((prev) =>
                                    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
                                );
                            } catch {
                                toast.error('Failed to update favorites');
                            }
                        }}
                    />
                </div>
            </main>
        </div>
    );
}

export default function RestaurantSearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F6F6F8] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
