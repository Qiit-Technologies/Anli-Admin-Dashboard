import { motion } from 'framer-motion';
import { useInView } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';
import Heading from './layout/Heading';
import Paragraph from './layout/Paragraph';
import Section from './layout/Section';

interface Solution {
    title: string;
    type: string;
    features: string[];
}

const solutions: Solution[] = [
    {
        title: 'Reservation Management',
        type: 'Resevation',
        features: [
            'Smart Booking System - Manage reservations with an intuitive, at-a-glance timeline (daily, weekly, monthly views).',
            'Room Assignment Optimisation - Automatically assign rooms based on guest preferences and availability.',
            'Group Reservation Blocks - Easily handle group bookings and corporate events.',
            'Flexible Stay Options - Supports hourly, daily, and long-term (monthly) reservations.',
            'One-Click Cancellations - Streamline the cancellation process with instant updates.',
        ],
    },
    {
        title: 'Rate Management',
        type: 'Rate',
        features: [
            'Dynamic Pricing Rules - Adjust rates in real time based on demand and occupancy.',
            'Attribute-Based Pricing - Set customized pricing based on room features and amenities.',
            'Automated Revenue Optimisation - Seamless integration with leading revenue management tools.',
            'Data-Driven Insights - Access in-depth analytics to refine pricing strategies.',
        ],
    },
    {
        title: 'Secure & Automated Payment Processing',
        type: 'Payment Processing',
        features: [
            'Automated Reconciliation - No more night audits—reconcile payments in real-time.',
            'One-Click Incidentals Payments - Guests can easily pay for extra services with a single click.',
            'Pre-Authorisation & Security - Reduce chargebacks and fraud with automated pre-auth and release features.',
            'Seamless Cash Flow - Improve financial efficiency with fully automated payments.',
        ],
    },
];

const SolutionCard = ({
    solution,
    index,
}: {
    solution: Solution;
    index: number;
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    return (
        <motion.div
            ref={ref}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? -100 : 20 }}
            transition={{
                duration: 0.5,
                delay: index * 0.2,
                repeat: 0,
            }}
            key={solution.type}
            className="group overflow-hidden flex relative flex-col rounded-[8px] px-6 py-8 gap-4 bg-white border -translate-y-24 lg:w-full max-w-[400px]"
        >
            <div className="bg-orion-blue/20 w-fit rounded-full group-hover:text-hexbrand group-hover:bg-white text-orion-blue text-sm p-1 px-3">
                {solution.type}
            </div>
            <div className="w-full">
                <h1 className="text-lg mb-4 font-bold group-hover:text-white">
                    {' '}
                    {solution.title}
                </h1>
                <div className="flex flex-col gap-4">
                    {solution.features.map((feature, index) => {
                        return (
                            <div
                                key={index}
                                className="flex text-muted-foreground group-hover:text-white items-start justify-start gap-2"
                            >
                                <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect
                                        width="24"
                                        height="24"
                                        rx="12"
                                        fill="#FFF8F3"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M17.0964 7.39162L9.93641 14.3016L8.03641 12.2716C7.68641 11.9416 7.13641 11.9216 6.73641 12.2016C6.34641 12.4916 6.23641 13.0016 6.47641 13.4116L8.72641 17.0716C8.94641 17.4116 9.32641 17.6216 9.75641 17.6216C10.1664 17.6216 10.5564 17.4116 10.7764 17.0716C11.1364 16.6016 18.0064 8.41162 18.0064 8.41162C18.9064 7.49162 17.8164 6.68162 17.0964 7.38162V7.39162Z"
                                        fill="#FF872A"
                                    />
                                </svg>

                                <span className="text-sm">{feature}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <span className="bg-hexbrand rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] w-5 h-5 bottom-0 left-0 group-hover:w-full group-hover:h-full group-hover:rounded-none -z-10 absolute"></span>
        </motion.div>
    );
};

const Solutions = () => {
    return (
        <Section
            bgClassName="bg-[#001933]"
            className="w-full lg:py-24 px-0 lg:px-0"
        >
            <div className="w-full relative flex flex-col gap-5">
                <div className="flex flex-col items-center mb-6 text-center gap-2">
                    <Heading className="text-white">Solutions</Heading>
                    <Paragraph className="text-white font-normal no-underline">
                        We offer a comprehensive suite of solutions designed to
                        streamline hotel operations, enhance revenue <br />
                        management, and improve guest experiences.
                    </Paragraph>
                </div>
                <div className="w-full relative h-[250px] lg:h-[300px]">
                    <Image
                        src="/landing/solution-bg.png"
                        className="rounded-tr-[8px] rounded-br-[8px]"
                        alt="solutions"
                        quality={100}
                        fill
                        sizes="100vw"
                        style={{
                            objectFit: 'cover',
                        }}
                    />
                    <div className="inset-0 absolute bg-black/40"></div>
                </div>
                <div className="px-4 place-items-center lg:place-items-stretch lg:px-24 grid grid-col-1 lg:grid-cols-3 gap-6 lg:gap-0">
                    {solutions.map((solution, index) => {
                        return (
                            <SolutionCard
                                key={solution.type}
                                solution={solution}
                                index={index}
                            />
                        );
                    })}
                </div>
            </div>
        </Section>
    );
};

export default Solutions;
