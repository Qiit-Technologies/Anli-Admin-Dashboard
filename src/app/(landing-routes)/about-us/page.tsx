'use client';
import CountUpValue from '@/components/landing-revised/CountUp';
import Heading from '@/components/landing-revised/layout/Heading';
import Paragraph from '@/components/landing-revised/layout/Paragraph';
import Section from '@/components/landing-revised/layout/Section';
import SmoothScroll from '@/components/landing-revised/SmoothScroll';
import { Button } from '@/components/ui/button';
import { Avatar } from '@heroui/react';
import { motion } from 'framer-motion';
import {
    Flag,
    Heart,
    HeartPulse,
    Smile,
    TrendingUp,
    User,
    Zap,
} from 'lucide-react';
import Image from 'next/image';

const hotelSolutions = [
    {
        title: 'Property Management System (PMS)',
        description: 'Automate and optimise hotel operations.',
        icon: User,
    },
    {
        title: 'Revenue Management System (RMS)',
        description: 'AI-driven pricing to maximize earnings.',
        icon: Smile,
    },
    {
        title: 'Housekeeping & Maintenance',
        description: 'Enhance operational efficiency.',
        icon: Heart,
    },
    {
        title: 'Guest Experience & CRM',
        description: 'Engage guests with personalized services.',
        icon: Flag,
    },
    {
        title: 'Finance & Accounting',
        description: 'Streamline hotel financials with automation.',
        icon: Zap,
    },
    {
        title: 'Channel Manager',
        description:
            'Connect to major OTAs like Booking.com, Airbnb, and Expedia.',
        icon: Heart,
    },
    {
        title: 'Analytics & Business Intelligence',
        description: 'Leverage data for smarter decisions.',
        icon: HeartPulse,
    },
    {
        title: 'Booking Engine',
        description: 'Drive direct reservations through your website',
        icon: TrendingUp,
    },
];

const mission = [
    {
        title: 'Our Vision',
        description:
            'To become the leading technology partner for hoteliers worldwide, providing a fully integrated, AI-powered ecosystem that transforms hotel management.',
    },
    {
        title: 'Our Mission',
        description:
            'To help hotels simplify operations, increase revenue, and deliver outstanding guest experiences through.',
    },
];

const hotelStats = [
    {
        value: 400,
        suffix: '+',
        title: 'Global Reach & Innovation',
        description:
            'Our system adapts to your business—whether you are running a 10-room boutique hotel or a 1,000-room resort.',
    },
    {
        value: 100,
        suffix: '%',
        title: 'Customer-Centric Approach',
        description:
            'We partner with hotels to provide personalized support and continuous innovation that drives long-term success.',
    },
    {
        value: 10,
        suffix: 'k',
        title: 'Built for Growth',
        description:
            "We don't just offer software—we offer a complete transformation of how hotels operate and succeed in the digital age.",
    },
];

const page = () => {
    return (
        <>
            <Section className="flex flex-col gap-5 items-center text-center justify-center lg:py-24">
                <h1 className="text-hexbrand text-3xl font-bold mt-20">
                    About Us
                </h1>
                <p>Revolutionising Hotel Management with Innovation</p>
                <span className="text-muted-foreground max-w-4xl">
                    At ANLI Solutions, we are on a mission to empower hoteliers
                    with smart, automated, and future-focused technology. Our
                    goal is simple—help hotels streamline operations, maximize
                    revenue, and enhance guest experiences through cutting-edge
                    digital solutions.
                </span>
                <div className="w-full relative h-[300px] lg:h-[400px] rounded-2xl">
                    <Image
                        src="/landing/aboutus/abouthero.jpg"
                        alt="about-us"
                        fill
                        className="rounded-2xl"
                        priority
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            </Section>
            <SmoothScroll>
                <Section
                    className="relative flex flex-col gap-4 lg:py-24"
                    bgClassName="bg-gray-50"
                >
                    <div className=" max-w-4xl">
                        <Heading>Who We Are</Heading>
                        <Paragraph className="text-muted-foreground">
                            With a deep understanding of the hospitality
                            industry, we are building an intelligent ecosystem
                            that enables hotels to manage reservations, automate
                            workflows, and optimize business performance—all
                            from a single, seamless platform.
                        </Paragraph>
                    </div>
                    <div
                        className={
                            'w-full grid mt-5 grid-cols-1 lg:grid-cols-2'
                        }
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-full relative h-[300px] lg:h-[500px] flex items-center justify-center">
                                <Image
                                    src="/landing/aboutus/section2.jpg"
                                    fill
                                    className="w-full h-full object-cover rounded-3xl"
                                    style={{ objectFit: 'cover' }}
                                    alt="group of people laughing"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="w-full text-muted-foreground flex-col px-0 mt-6 lg-mt-0 lg:px-20 gap-3 h-full flex items-center justify-center">
                            <p>
                                ANLI Solutions was founded with a vision to
                                redefine hospitality technology. Our team
                                consists of engineers, designers, hospitality
                                experts, and business strategists who are
                                passionate about innovation. <br />
                            </p>
                            <p>
                                We believe that hoteliers deserve better
                                tools—not just software, but a complete,
                                AI-driven hospitality management experience that
                                simplifies operations and drives profitability.
                            </p>
                        </div>
                    </div>
                </Section>
            </SmoothScroll>
            <SmoothScroll>
                <Section className="relative lg:h-screen flex flex-col gap-6 lg:py-24">
                    <div className="flex flex-col items-center text-center gap-2">
                        <Heading>What We Do</Heading>
                        <Paragraph className="font-normal no-underline">
                            We provide an all-in-one hospitality management
                            platform that covers
                        </Paragraph>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hotelSolutions.map(
                            ({ title, description, icon: Icon }, index) => (
                                <motion.div
                                    className="flex group flex-col items-center text-center gap-3"
                                    key={title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: index * 0.2,
                                        repeat: 0,
                                    }}
                                >
                                    <div className="group-hover:-translate-y-2 transition-all w-fit h-fit bg-hexbrand/20 flex items-center justify-center p-3 rounded-full">
                                        <Icon className="w-6 h-6 text-orange-500 -2" />
                                    </div>
                                    <h3>{title}</h3>
                                    <p className="text-sm max-w-xs text-muted-foreground">
                                        {description}
                                    </p>
                                </motion.div>
                            ),
                        )}
                    </div>
                </Section>
            </SmoothScroll>

            <SmoothScroll>
                <Section className="lg:px-0 px-0 pt-0" bgClassName="bg-gray-50">
                    <div className="w-full relative h-[300px] lg:h-[500px]">
                        <Image
                            src="/landing/aboutus/abouthero.jpg"
                            fill
                            className="w-full h-full object-cover"
                            style={{ objectFit: 'cover' }}
                            alt="group of people laughing"
                            priority
                        />
                    </div>
                    <div className="flex w-full items-center flex-col md:flex-row justify-center gap-4 place-items-center">
                        {mission.map(({ title, description }, index) => (
                            <motion.div
                                key={title}
                                className="flex flex-col max-w-lg gap-3 px-10 py-6 lg:py-24"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.2,
                                    repeat: 0,
                                }}
                            >
                                <h1 className="text-2xl font-bold text-hexbrand">
                                    {title}
                                </h1>
                                <p className="text-muted-foreground">
                                    {description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Section>
            </SmoothScroll>

            <SmoothScroll>
                <Section className="lg:py-24 flex flex-col px-0 pt-24 pb-0 lg:px-24 gap-5">
                    <div className="flex flex-col items-center text-center gap-2">
                        <Heading>Why Choose ANLI Solutions</Heading>
                        <Paragraph className="font-normal no-underline">
                            Everything you need to build modern UI and great
                            products.
                        </Paragraph>
                    </div>
                    <div className=" h-[800px] lg:h-[350px] w-full relative rounded-none lg:rounded-2xl overflow-hidden">
                        <Image
                            src="/landing/aboutus/metrics.jpg"
                            fill
                            className="w-full h-full object-cover"
                            style={{ objectFit: 'cover' }}
                            alt="group of people laughing"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/50 z-30">
                            <div className="flex items-center flex-col lg:flex-row justify-center p-4 gap-4 lg:gap-4 w-full h-full">
                                {hotelStats.map(
                                    (
                                        { value, suffix, title, description },
                                        index,
                                    ) => (
                                        <motion.div
                                            key={title}
                                            className="rounded-2xl flex flex-col max-w-[350px] items-center justify-center p-6 border border-gray-300 text-center bg-white/40 backdrop-blur"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.2,
                                                repeat: 0,
                                            }}
                                            viewport={{ once: true }}
                                            whileHover={{
                                                y: -10,
                                                transition: {
                                                    duration: 0.2,
                                                    ease: 'easeOut',
                                                },
                                            }}
                                        >
                                            <CountUpValue
                                                endValue={value}
                                                suffix={suffix}
                                            />
                                            <h3 className="mt-2 text-lg font-semibold text-white">
                                                {title}
                                            </h3>
                                            <p className="mt-1 text-sm text-white/80">
                                                {description}
                                            </p>
                                        </motion.div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="lg:mt-14 flex items-center p-4 bg-[#002955] rounded-none lg:rounded-xl">
                        <div className="bg-white flex items-center w-full flex-col rounded-xl p-4">
                            <div className="flex items-center gap-0">
                                <Avatar
                                    isBordered
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                                />
                                <Avatar
                                    isBordered
                                    src="https://i.pravatar.cc/150?u=a04258a2462d826712d"
                                    className="mb-4"
                                />
                                <Avatar
                                    isBordered
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                />
                            </div>
                            <div className="flex flex-col text-center mt-5 gap-5 items-center justify-center">
                                <h1>
                                    Join the Future of Hospitality Management
                                </h1>
                                <span className="max-w-2xl text-sm text-muted-foreground">
                                    At ANLI Solutions, we believe that
                                    technology should empower rather than
                                    complicate. Our mission is to provide
                                    hoteliers with the tools they need to thrive
                                    in an ever-evolving industry.
                                </span>
                                <Button className="bg-hexbrand text-white hover:bg-hexbrand">
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>
                </Section>
            </SmoothScroll>
        </>
    );
};

export default page;
