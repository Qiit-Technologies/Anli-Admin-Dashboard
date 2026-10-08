import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, ChevronDown, Clock, MapPin } from 'lucide-react';
import NewsLetter from '../NewsLetter';
import CenterContainer from '../Product/CenterContainer';
import EventWithImageCarousel from './EventWIthImageCarousel';
import { AnliEvents } from './types';
import { getVenueDisplay } from './utils';

const events: AnliEvents = [
    {
        id: 1,
        title: 'How Hotel Tech Works Better when it works Together',
        description:
            'A live webinar on how hotel technologies work better when integrated across revenue, operations, and guest experience.',
        images: ['/webinar.jpeg'],
        date: '2025-12-17',
        time: '04:00 PM (WAT) • 03:00 PM (UK) • 10:00 AM (ET)',
        timeDisplay: '04:00 PM (WAT)',
        venue: {
            name: 'Online (Live Webinar)',
            address: {
                street: '',
                city: 'Virtual',
                state: '',
                country: '',
                postalCode: '',
                coordinates: {
                    latitude: 0,
                    longitude: 0,
                },
            },
            contact: {
                phone: '',
                email: '',
                website: 'https://www.weareanli.com/events',
            },
        },
        type: 'Webinar',
        status: 'upcoming',
        capacity: 0,
        registrationRequired: true,
        registrationUrl: 'https://www.weareanli.com/events',
        price: undefined,
        organizer: {
            name: 'Anli × Turbosuite',
            contact: 'info@weareanli.com',
            phone: '',
        },
        tags: [
            'Webinar',
            'Hospitality',
            'Technology',
            'Revenue Management',
            'Integration',
        ],
        speakers: [],
        agenda: [],
        requirements: [
            'Register to receive the webinar link',
            'Stable internet connection recommended',
        ],
        amenities: ['Live Q&A', 'Recording available'],
    },
    {
        id: 2,
        title: 'Explore how AI automation tools are redefining revenue management in hospitality',
        description:
            'Join us for an insightful session on how AI automation tools are transforming revenue management in the hospitality industry.',
        images: ['/Conference.jpg', '/sp1.jpeg', '/sp2.jpeg', '/sp3.jpeg'],
        date: '2025-06-20',
        time: '17:00',
        timeDisplay: '5:00 PM (CAT)',
        venue: {
            name: 'The Corniche Hotel',
            address: {
                street: '2 Olaitan Senbanjo Street',
                city: 'Lagos',
                state: 'Lagos State',
                country: 'Nigeria',
                postalCode: '101233',
                coordinates: {
                    latitude: 6.4531,
                    longitude: 3.3958,
                },
            },
            contact: {
                phone: '+234-1-234-5678',
                email: 'info@cornichehotel.com',
                website: 'https://cornichehotel.com',
            },
        },
        type: 'Conference',
        status: 'past',
        capacity: 200,
        registrationRequired: true,
        registrationUrl: 'https://example.com/register',
        price: {
            amount: 15000,
            currency: 'NGN',
            early_bird: {
                amount: 12000,
                deadline: '2025-06-01',
            },
        },
        organizer: {
            name: 'TechEvents Nigeria',
            contact: 'events@techevents.ng',
            phone: '+234-800-123-4567',
        },
        tags: [
            'AI',
            'Hospitality',
            'Revenue Management',
            'Technology',
            'Automation',
        ],
        speakers: [
            {
                id: 1,
                name: 'Dr. Sarah Johnson',
                title: 'AI Research Director',
                company: 'HospitalityTech Solutions',
                bio: 'Leading expert in AI applications for hospitality industry',
                image: '/speakers/sarah-johnson.jpg',
            },
            {
                id: 2,
                name: 'Michael Chen',
                title: 'Revenue Management Specialist',
                company: 'Global Hotels Group',
                bio: 'Over 15 years of experience in hotel revenue optimization',
                image: '/speakers/michael-chen.jpg',
            },
        ],
        agenda: [
            {
                time: '17:00',
                title: 'Registration & Welcome',
                duration: 30,
            },
            {
                time: '17:30',
                title: 'Opening Keynote: The Future of AI in Hospitality',
                speaker: 'Dr. Sarah Johnson',
                duration: 45,
            },
            {
                time: '18:15',
                title: 'Panel Discussion: Revenue Management Transformation',
                speakers: ['Dr. Sarah Johnson', 'Michael Chen'],
                duration: 60,
            },
            {
                time: '19:15',
                title: 'Networking & Closing',
                duration: 45,
            },
        ],
        requirements: [
            'Valid ID required for entry',
            'Business attire recommended',
            'Networking cards encouraged',
        ],
        amenities: [
            'Free WiFi',
            'Refreshments provided',
            'Parking available',
            'Live streaming available',
        ],
    },
    {
        id: 2,
        title: 'Reimagining Guest Experience with Technology and Designs',
        description:
            "Anli's multi-city event focused on transforming the guest experience through design and innovation. Expect expert talks, hands-on demos, networking, and exclusive tech offers.",
        images: ['/latestevent.jpeg'],
        date: '',
        time: '',
        timeDisplay: '',
        venue: {
            name: '',
            address: {
                street: '',
                city: 'Owerri',
                state: 'Imo',
                country: 'Nigeria',
                postalCode: '',
                coordinates: {
                    latitude: 0,
                    longitude: 0,
                },
            },
            contact: {
                phone: '',
                email: '',
                website: 'https://www.weareanli.com/events',
            },
        },
        type: 'Conference',
        status: 'upcoming',
        capacity: 0,
        registrationRequired: true,
        registrationUrl: 'https://www.weareanli.com/events',
        price: undefined,
        organizer: {
            name: 'Anli',
            contact: 'info@weareanli.com',
            phone: '',
        },
        tags: [
            'Interior Design',
            'AI',
            'Hospitality',
            'Guest Experience',
            'Technology',
            'Hotel Management',
        ],
        speakers: [],
        agenda: [],
        requirements: ['Early registration recommended due to limited spaces.'],
        amenities: [
            'Expert Talks',
            'Product Demos',
            'Networking',
            'Exclusive Offers',
        ],
    },
];

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getEventTypeStyles = (type: string) => {
    const styles = {
        Conference: 'bg-blue-100 text-blue-800',
        Workshop: 'bg-green-100 text-green-800',
        Masterclass: 'bg-purple-100 text-purple-800',
        Forum: 'bg-orange-100 text-orange-800',
        Panel: 'bg-red-100 text-red-800',
        Networking: 'bg-gray-100 text-gray-800',
        Webinar: 'bg-indigo-100 text-indigo-800',
    };

    return styles[type as keyof typeof styles] || 'bg-slate-100 text-slate-800';
};

export default function EventsPage() {
    const upcomingEvents = events.filter(
        (event) => event.status === 'upcoming',
    );

    const pastEvents = events.filter((event) => event.status === 'past');

    const handleScroll = () => {
        const eventsList = document.getElementById('events');
        if (eventsList) {
            eventsList.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <CenterContainer
                id="Product-Hero"
                aria-label="event-hero"
                backgroundImage="/events.jpg"
                enableParallax={true}
                parallaxSpeed={0.5}
                className="relative"
            >
                <div className="container  px-4 md:px-6 z-40">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-white tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Events & Workshops
                            </h1>
                            <p className="mx-auto max-w-[700px] text-white md:text-xl">
                                Join us for industry-leading events, workshops,
                                and networking opportunities. Connect with
                                experts and expand your knowledge.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center  justify-center w-full h-full">
                        <Button
                            variant="outline"
                            className="text-white absolute bottom-10 bg-transparent w-10 h-10 rounded-full animate-bounce"
                            onClick={handleScroll}
                        >
                            <ChevronDown className="w-10 h-10" />
                        </Button>
                    </div>
                </div>
            </CenterContainer>

            <div
                id="events"
                className="py-12 md:py-16 flex items-center justify-center flex-col"
            >
                <div className="container px-4 md:px-6">
                    <div className="space-y-2 mb-8">
                        <h2 className="text-2xl text-center font-bold tracking-tight">
                            Upcoming Events
                        </h2>
                        <p className="text-muted-foreground text-center">
                            {`Don't miss out on these exciting upcoming events
                    and opportunities.`}
                        </p>
                    </div>
                    <div className="flex flex-col gap-16">
                        {upcomingEvents.map((event) => (
                            <EventWithImageCarousel
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <section
                id="past-events"
                className="py-12 md:py-16 flex items-center justify-center"
            >
                <div className="container px-4 md:px-6">
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl text-center font-bold tracking-tight">
                                Past Events
                            </h2>
                            <p className="text-muted-foreground text-center">
                                Take a look at our previous successful events
                                and workshops.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {pastEvents.map((event) => (
                                <Card
                                    key={event.id}
                                    className="transition-all shadow-none hover:shadow-md"
                                >
                                    <CardContent className="p-6">
                                        <div className="grid gap-4 md:grid-cols-[200px_1fr_200px_auto] md:items-center">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">
                                                        {formatDate(event.date)}
                                                    </div>
                                                    <div className="text-muted-foreground flex items-center space-x-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {event.timeDisplay}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {event.title}
                                                    </h3>
                                                    <Badge
                                                        variant="secondary"
                                                        className={getEventTypeStyles(
                                                            event.type,
                                                        )}
                                                    >
                                                        {event.type}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    {getVenueDisplay(
                                                        event.venue,
                                                    )}
                                                </span>
                                            </div>

                                            {event.images?.[0] && (
                                                <div className="flex justify-end">
                                                    <a
                                                        href={event.images[0]}
                                                        download
                                                        className="text-sm"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Download Banner
                                                        </Button>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <NewsLetter />
        </div>
    );
}
