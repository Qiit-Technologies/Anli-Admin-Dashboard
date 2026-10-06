import { AppProvider } from '@/context/menu-context';
import type React from 'react';

export default async function RestaurantMenuLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ restaurantId: string }>;
}>) {
    const { restaurantId } = await params;
    return <AppProvider restaurantId={restaurantId}>{children}</AppProvider>;
}
