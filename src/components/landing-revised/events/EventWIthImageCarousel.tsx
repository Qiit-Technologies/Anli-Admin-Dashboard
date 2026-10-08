import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import { CalendarIcon, Download, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import RegisterForm from './RegisterForm';
import { AnliEvent } from './types';
import { getFullAddress } from './utils';

const getEventTypeColor = (type: string) => {
    const colors = {
        Conference: 'bg-orion-blue text-white',
        Workshop: 'bg-green-100 text-green-800',
        Masterclass: 'bg-purple-100 text-purple-800',
        Forum: 'bg-orange-100 text-orange-800',
        Panel: 'bg-pink-100 text-pink-800',
        Networking: 'bg-gray-100 text-gray-800',
        Webinar: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export default function EventWithImageCarousel({
    event,
}: {
    event: AnliEvent;
}) {
    const plugin = useRef(Autoplay({ delay: 3000 }));

    return (
        <div className="flex flex-col md:flex-row  bg-white rounded-2xl shadow-none border overflow-hidden">
            <div className="md:w-1/2 h-64 md:h-auto relative">
                <Carousel
                    plugins={[plugin.current]}
                    className="w-full h-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent className="h-full w-full">
                        {event.images.map((image, index) => (
                            <CarouselItem
                                key={index}
                                className="w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px]"
                            >
                                <div className="relative h-full w-full">
                                    <Image
                                        src={image}
                                        alt={`${event.title} - Image ${index + 1}`}
                                        fill
                                        className="object-cover md:object-contain"
                                        style={{
                                            backgroundColor: '#f3f4f6',
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent md:bg-gradient-to-l" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>

            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                    <Badge
                        variant="secondary"
                        className={cn(
                            getEventTypeColor(event.type),
                            'rounded-full px-2 py-1 text-xs font-medium',
                        )}
                    >
                        {event.type}
                    </Badge>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {event.status}
                    </span>
                </div>

                <h3 className="text-2xl font-bold mb-4">{event.title}</h3>

                <p className="text-gray-600 mb-6">{event.description}</p>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">
                            {event.date} • {event.time}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">
                            {getFullAddress(event.venue)}
                        </span>
                    </div>
                </div>

                {event.images?.[0] && (
                    <div className="mt-4">
                        <a href={event.images[0]} download>
                            <Button variant="outline" className="gap-2">
                                <Download className="w-4 h-4" />
                                Download Banner
                            </Button>
                        </a>
                    </div>
                )}

                <RegisterForm
                    eventTitle={event.title}
                    eventDate={`${event.date} ${event.time}`}
                />
            </div>
        </div>
    );
}
