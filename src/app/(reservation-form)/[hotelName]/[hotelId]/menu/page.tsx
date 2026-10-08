import RestaurantMenu from '@/components/restaurants/RestaurantMenu';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ hotelName: string; hotelId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { hotelName } = await params;
    const displayName = hotelName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    
    return {
        title: `${displayName} Menu | Anli Restaurant`,
        description: `Explore the full menu at ${displayName}.`,
    };
}

export default async function MenuPage({ params }: Props) {
    const { hotelName, hotelId } = await params;
    
    return <RestaurantMenu id={hotelId} hotelName={hotelName} />;
}
