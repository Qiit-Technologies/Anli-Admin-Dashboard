import RestaurantDetail from '@/components/restaurants/RestaurantDetail';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ hotelName: string; hotelId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { hotelName } = await params;
    const displayName = hotelName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    
    return {
        title: `${displayName} | Anli Restaurant`,
        description: `Book a table at ${displayName} and explore their delicious menu.`,
    };
}

export default async function RestaurantPage({ params }: Props) {
    const { hotelName, hotelId } = await params;
    
    return <RestaurantDetail id={hotelId} hotelName={hotelName} />;
}
