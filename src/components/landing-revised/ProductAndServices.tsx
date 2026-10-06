'use client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Heading from './layout/Heading';
import Paragraph from './layout/Paragraph';
import Section from './layout/Section';

interface CardProps {
    title: string;
    description: string;
    image: string;
    href: string;
}

const products: CardProps[] = [
    {
        title: 'Revenue & Financial Tools',
        description: 'Dynamic pricing, invoicing, and accounting integrations.',
        image: '/landing/image1.png',
        href: '/revenue-financial-tools',
    },
    {
        title: 'Property Management System (PMS)',
        description:
            'Reservations, check-in/out, and guest history management.',
        image: '/landing/image2.png',
        href: '/property-management-system',
    },
    {
        title: 'Inventory Management',
        description:
            'Automated tracking of room availability, housekeeping, and amenities.',
        image: '/landing/image3.png',
        href: '/inventory-management',
    },
    {
        title: 'Guest Experience Enhancement',
        description:
            'Automated communication, feedback collection, and loyalty programs.',
        image: '/landing/image4.png',
        href: '/guest-experience-enhancement',
    },
    {
        title: 'Channel Management',
        description:
            'Integration with OTAs (e.g., Booking.com, Airbnb) for seamless room distribution.',
        image: '/landing/image5.png',
        href: '/channel-management',
    },
    {
        title: 'Mobile & Web Accessibility',
        description:
            'Automated communication, feedback collection, and loyalty programs.',
        image: '/landing/image6.png',
        href: '/mobile-web-accessibility',
    },
    {
        title: 'Resturants and Bars (F&B)',
        description: 'Processing Orders, deliveries and table management',
        image: '/landing/image7.jpg',
        href: '/resturants-and-bars',
    },
];

const Card = ({ title, description, image, href }: CardProps) => {
    return (
        <div className="bg-white hover:ring-1 hover:ring-hexbrand z-0 group relative items-center w-full lg:min-w-[600px] gap-5 justify-center border p-6 rounded-2xl">
            <div className="relative z-20 w-full h-[300px] lg:h-[400px] overflow-hidden">
                <Image
                    className="rounded-[8px] z-10 group-hover:scale-110 transition-all"
                    src={image}
                    alt={'card-image'}
                    fill
                    sizes="(min-width: 808px) 50vw, 100vw"
                    priority
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="flex z-20 mt-4 flex-col">
                <h1 className="text-lg text-midBlue capitalize">{title}</h1>
                <p className="text-base text-blue capitalize">{description}</p>
                <Link
                    className="group flex mt-4 items-center gap-1 text-base text-orange-900"
                    href={href}
                >
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:ml-2 transition-all" />
                </Link>
            </div>
        </div>
    );
};

const ProductAndServices = () => {
    return (
        <Section bgClassName="bg-gray-50" className="w-full px-4 lg:py-24">
            <div className="w-full flex flex-col gap-5">
                <div className="flex flex-col items-center text-center gap-2">
                    <Heading>Products & Services</Heading>
                    <Paragraph className="font-normal no-underline">
                        ANLI Hospitality Management System (ANLI HMS) <br />A
                        cloud-based platform offering
                    </Paragraph>
                </div>
                <div className="grid mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 place-items-center gap-10 w-full">
                    {products.map((product, index) => {
                        const extraDelay = index % 3 === 0 ? 0.3 : 0;

                        return (
                            <motion.div
                                key={index}
                                initial={{ rotateY: 180, opacity: 0 }}
                                whileInView={{ rotateY: 0, opacity: 1 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.8,
                                    delay: (index % 5) * 0.15 + extraDelay,
                                    ease: 'easeOut',
                                }}
                                style={{ perspective: 1000 }}
                            >
                                <Card
                                    title={product.title}
                                    description={product.description}
                                    image={product.image}
                                    href={'#'}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </Section>
    );
};

export default ProductAndServices;
