'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { AnimatedStar } from '../AnimatedStar';
import Heading from '../layout/Heading';
import Paragraph from '../layout/Paragraph';
import Section from '../layout/Section';

const benefits = [
    {
        for: 'hoteliers',
        image: '/landing/product/benefit1.jpg',
        list: [
            {
                title: 'Increased Revenue',
                description:
                    'Optimise pricing strategies and reduce third-party commissions.',
            },
            {
                title: 'Improved Guest Experience',
                description:
                    'Enhance guest satisfaction through personalized services and seamless check-in/out processes.',
            },
            {
                title: 'Streamlined Operations',
                description:
                    'Automate routine tasks and free up staff time for more strategic initiatives.',
            },
            {
                title: 'Data-Driven Insights',
                description:
                    'Gain valuable insights into room occupancy, guest preferences, and revenue trends.',
            },
            {
                title: 'Compliance and Regulations',
                description:
                    'Stay compliant with industry regulations and maintain a positive reputation.',
            },
        ],
    },
    {
        for: 'guests',
        image: '/landing/product/benefit2.jpg',
        list: [
            {
                title: 'Personalised Services',
                description:
                    'Receive tailored recommendations and assistance based on individual preferences.',
            },
            {
                title: 'Convenience and Efficiency',
                description:
                    'Book rooms, make reservations, and manage bookings with ease.',
            },
            {
                title: 'Enhanced Security',
                description:
                    'Ensure the safety and security of your stay with our state-of-the-art security measures.',
            },
            {
                title: 'Enhanced Hospitality',
                description:
                    'Experience a more welcoming and inclusive environment through our innovative solutions.',
            },
            {
                title: 'Convenient Access',
                description:
                    'Access information and services conveniently from your mobile device.',
            },
        ],
    },
];
const Benefits = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <Section
            bgClassName="bg-[#001933]"
            className="relative w-full px-0 lg:py-24 lg:px-0"
        >
            <div className="w-full relative flex flex-col gap-5">
                <div className="flex flex-col items-center mb-6 text-center gap-2">
                    <Heading className="text-white">
                        Benefits of ANLI Solutions
                    </Heading>
                    <Paragraph className="text-white line-clamp-2 font-normal no-underline">
                        We solve the biggest challenges in hotel management with
                        cutting-edge technology:
                    </Paragraph>
                </div>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => {
                                setSelectedIndex(0);
                            }}
                            className={cn(
                                'bg-white h-12 text-black hover:bg-hexbrand hover:text-white',
                                selectedIndex === 0 && 'bg-hexbrand text-white',
                            )}
                        >
                            <Building /> For Hoteliers
                        </Button>
                        <Button
                            onClick={() => {
                                setSelectedIndex(1);
                            }}
                            className={cn(
                                'bg-white h-12 text-black hover:bg-hexbrand hover:text-white',
                                selectedIndex === 1 && 'bg-hexbrand text-white',
                            )}
                        >
                            <Users />
                            For Guests
                        </Button>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <div className="w-full lg:max-w-[800px]">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'flex flex-col p-6 gap-4 items-center',
                                        selectedIndex === index
                                            ? 'block'
                                            : 'hidden',
                                    )}
                                >
                                    <div className="w-full lg:w-full relative h-[300px] lg:h-[400px]">
                                        <Image
                                            src={benefit.image}
                                            alt={benefit.for}
                                            fill
                                            priority
                                            className="rounded-3xl object-cover"
                                        />
                                    </div>
                                    <div className="mt-8 px-0 lg:px-10">
                                        <ul className="list-disc space-y-4 pl-4">
                                            {benefit.list.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="text-base leading-6 text-white"
                                                >
                                                    <span className="font-bold">
                                                        {item.title}
                                                    </span>
                                                    :{' '}
                                                    <span>
                                                        {item.description}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <AnimatedStar
                position={{ left: '10%', bottom: '30%' }}
                className="fill-hexbrand text-hexbrand hidden lg:block"
            />
        </Section>
    );
};

export default Benefits;
