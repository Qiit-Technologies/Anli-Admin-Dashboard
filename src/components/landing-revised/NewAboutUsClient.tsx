import NewSection from '@/components/landing-revised/layout/NewSection';
import LandingLayout from '@/components/landing-revised/new-layout/Layout';
import SmoothScroll from '@/components/landing-revised/SmoothScroll';
import { Flag, Heart, Smile, User, Zap } from 'lucide-react';
// import { motion } from 'framer-motion';
import NewNewsLetter from '@/components/landing-revised/NewNewsLetter';
import Image from 'next/image';
import CountUpValue from '@/components/landing-revised/CountUp';

const hotelSolutions = [
    {
        title: 'Property Management System (PMS)',
        description:
            'Automate reservations and improve hotel and restaurant operations.',
        icon: User,
    },
    {
        title: 'Revenue and Rate Management',
        description:
            'AI-powered pricing to boost occupancy and maximise earnings.',
        icon: Smile,
    },
    {
        title: 'Housekeeping and Maintenance',
        description: 'Assign and track tasks to improve staff efficiency.',
        icon: Heart,
    },
    {
        title: 'Guest Experience CRM',
        description:
            'Personalize services and build stronger guest relationships.',
        icon: Flag,
    },
    {
        title: 'Finance and Accounting',
        description:
            'AI-powered pricing to boost occupancy and maximise earnings.',
        icon: Zap,
    },
    {
        title: 'Channel Manage',
        description:
            'Connect to leading OTAs like Wakana to increase bookings.',
        icon: Heart,
    },
    // {
    //     title: 'Analytics & Business Intelligence',
    //     description: 'Leverage data for smarter decisions.',
    //     icon: HeartPulse,
    // },
    // {
    //     title: 'Booking Engine',
    //     description: 'Drive direct reservations through your website',
    //     icon: TrendingUp,
    // },
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

const gallery1 = [
    '/landing/gallery2.jpg',
    '/landing/gallery1.jpg',
    '/landing/gallery1.jpg',
    '/landing/gallery2.jpg',
    '/landing/gallery1.jpg',
    '/landing/gallery1.jpg',
];
const gallery2 = [
    '/landing/gallery1.jpg',
    '/landing/gallery1.jpg',
    '/landing/gallery2.jpg',
    '/landing/gallery1.jpg',
    '/landing/gallery1.jpg',
    '/landing/gallery2.jpg',
];

export default function NewAboutUsClient() {
    return (
        <LandingLayout>
            <NewSection
                bgClassName="relative pt-[17vh] lg:pt-[202px] bg-[#02172E]"
                bgChildren={
                    <>
                        <img
                            src="/landing/layer-icons/layer12.svg"
                            className="absolute bottom-0 left-0 z-10"
                        />
                        <img
                            src="/landing/layer-icons/layer11.svg"
                            className="absolute bottom-0 right-0 z-10"
                        />
                    </>
                }
                className="h-fit pb-24 lg:pb-16"
            >
                <div>
                    <p className="text-[#E8ECF5] text-center text-[36px] lg:text-[50px] font-bold leading-[64px] tracking-[-0.72px] lg:tracking-[-0.5px]">
                        About Us
                    </p>
                    <p className="text-center lg:text-center mx-auto max-w-[1047px] text-[#E8ECF5] text-[16px] lg:text-[18px] font-normal leading-[32px] lg:leading-[38px] tracking-[-0.5px] mt-4">
                        Empowering Hospitality Businesses with Smarter
                        Technology
                    </p>
                </div>
            </NewSection>

            <NewSection
                bgClassName="lg:px-0 relative"
                bgChildren={
                    <img
                        src="/landing/layer-icons/layer14.svg"
                        className="absolute -top-32 right-0 z-10 h-auto w-[300px]"
                    />
                }
                className="pt-0 pb-0 mt-8 lg:mt-20 mb-12 lg:mb-24"
            >
                <div className="flex flex-col items-stretch lg:flex-row lg:items-start gap-4">
                    <div className="max-w-[590px]">
                        <p className="text-[#002955] text-center lg:text-left text-[32px] lg:text-[48px] font-bold leading-[63px]">
                            Who We Are
                        </p>
                        <p className="text-[#002955] text-left text-[16px] lg:text-[18px] font-semibold leading-[32px] mt-[28px]">
                            At Anli Solutions, we believe managing hotels,
                            restaurants, and resorts should be simple. Our
                            hospitality management software helps you run daily
                            operations, increase revenue, and improve guest
                            experiences, all from one connected platform.
                        </p>
                    </div>

                    <img
                        src="/landing/aboutus/about-us2.png"
                        className="mt-8 rounded-[20px] h-[398px] w-11/12 lg:w-[520px] lg:mt-20 mx-auto object-cover"
                    />
                </div>

                <div className="flex flex-row items-center lg:-mt-52 lg:mr-64">
                    <img
                        src="/landing/aboutus/about-us1.png"
                        className="rounded-[20px] h-[398px] w-11/12 lg:w-[572px] lg:h-[293px] mt-7 mx-auto object-cover"
                    />
                </div>
            </NewSection>

            <NewSection
                bgClassName="px-0 lg:px-0 relative py-2 lg:py-12 bg-[#F7FBFF]"
                bgChildren={
                    <>
                        <img
                            src="/landing/layer-icons/layer13.svg"
                            className="absolute top-0 left-0 z-10"
                        />
                        <img
                            src="/landing/layer-icons/layer15.svg"
                            className="absolute bottom-0 right-0 z-10"
                        />
                    </>
                }
                className="px-0 lg:px-0 pt-0 pb-12 w-full mx-0"
            >
                <div className="px-4 lg:px-24">
                    <p className="text-[#002955] text-left text-[32px] lg:text-[48px] font-bold leading-[44px] mt-[32px]">
                        Our Vision
                    </p>
                    <p className="text-[#002955] text-left text-[14px] lg:text-[18px] font-semibold leading-[30px] mt-4 max-w-[1000px]">
                        To become the most trusted technology partner for
                        hotels, restaurants, resorts, and hospitality businesses
                        worldwide by providing a fully integrated AI-powered
                        platform that transforms operations.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch lg:items-center mt-11">
                    <img
                        className="w-full h-[368px] lg:w-1/2 lg:rounded-r-3xl object-cover object-right"
                        src="/landing/our-mission.png"
                    />
                    <NewSection
                        bgClassName="lg:px-0"
                        className="pt-0 pb-0 lg:px-0"
                    >
                        <div className="lg:pl-10 lg:pr-24">
                            <p className="text-[#002955] text-left text-[32px] lg:text-[48px] font-bold leading-[44px] mt-[32px] lg:mt-0">
                                Our Mission
                            </p>
                            <p className="text-[#002955] text-left text-[14px] lg:text-[18px] font-semibold leading-[30px] mt-[8px]">
                                To help hotels, restaurants, and hospitality
                                businesses simplify operations, increase
                                revenue, and deliver outstanding guest
                                experiences through smart, automated, and
                                future-focused technology.
                            </p>
                        </div>
                    </NewSection>
                </div>
            </NewSection>

            <SmoothScroll>
                <NewSection className="relative lg:h-screen flex flex-col gap-6 lg:py-24">
                    <div className="flex flex-col items-center text-center gap-2">
                        <p className="text-[#101828] text-left text-[32px] lg:text-[36px] font-semibold leading-[44px] mt-[12px]">
                            What We Do
                        </p>
                        <p className="text-[#667085] text-left lg:text-center text-[18px] lg:text-[20px] font-normal leading-[30px] mt-[8px] max-w-[920px]">
                            We provide an integrated hospitality management
                            platform designed for hotels, restaurants, resorts,
                            and other hospitality businesses. Our solutions
                            include
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hotelSolutions.map(
                            ({ title, description, icon: Icon }) => (
                                <div
                                    className="mt-8 flex group flex-col items-center text-center gap-3 bg-[#F9FAFB] rounded-2xl pb-6"
                                    key={title}
                                    // initial={{ opacity: 0, y: 20 }}
                                    // whileInView={{ opacity: 1, y: 0 }}
                                    // transition={{
                                    //     duration: 0.4,
                                    //     delay: index * 0.2,
                                    //     repeat: 0,
                                    // }}
                                >
                                    <div className="-mt-7 bg-[#F9FAFB] group-hover:-translate-y-2 transition-all w-fit h-fit flex items-center justify-center p-3 rounded-full">
                                        <div className="bg-[#EBF2FF] flex items-center justify-center p-3 rounded-full">
                                            <Icon className="w-6 h-6 text-[#007AFF] -2" />
                                        </div>
                                    </div>
                                    <h3 className="mt-3">{title}</h3>
                                    <p className="text-sm max-w-xs text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </NewSection>
            </SmoothScroll>

            <NewSection className="px-0 lg:px-0 py-0 lg:py-0">
                <div className="flex items-center gap-4 overflow-x-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {gallery1.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            className="h-[280px] w-[335.66px] lg:w-[592.3px] rounded-2xl"
                        />
                    ))}
                </div>

                <div className="mt-6 flex items-center gap-4 overflow-x-scroll [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {gallery2.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            className="h-[280px] w-[335.66px] lg:w-[592.3px] rounded-2xl"
                        />
                    ))}
                </div>
            </NewSection>

            <SmoothScroll>
                <NewSection className="relative flex flex-col gap-6 lg:py-24">
                    <div className="flex flex-col items-center text-center gap-2">
                        <p className="text-[#101828] text-center text-[32px] lg:text-[36px] font-semibold leading-[44px] mt-[32px] max-w-[312px] lg:max-w-[768px]">
                            Why Choose ANLI Solutions
                        </p>
                        <p className="text-[#667085] text-center text-[20px] lg:text-[20px] font-normal leading-[30px] mt-[12px] max-w-[312px] lg:max-w-[768px]">
                            Everything you need to build modern UI and great
                            products.
                        </p>
                        <p className="mt-8 text-[#667085] text-left text-[18px] lg:text-[50px] font-normal leading-[30px] lg:hidden">
                            Hotels, restaurants, and bars in Africa are losing
                            revenue because they do not have affordable,
                            all-in-one systems. Using different tools for
                            different tasks slows down workflow, creates errors,
                            and reduces guest satisfaction.
                        </p>
                        <p className="mt-8 text-[#667085] text-left text-[18px] lg:text-[50px] font-normal leading-[30px] lg:hidden">
                            Anli Solutions changes that by giving you one
                            complete platform to manage your entire business.
                        </p>
                    </div>

                    <div className="h-[800px] lg:h-[350px] w-full relative rounded-none lg:rounded-2xl overflow-hidden hidden lg:block">
                        <Image
                            src="/landing/aboutus/metrics.jpg"
                            fill
                            className="w-full h-full object-cover"
                            style={{ objectFit: 'cover' }}
                            alt="group of people laughing"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/50 z-30 hidden lg:block">
                            <div className="flex items-center flex-col lg:flex-row justify-center p-4 gap-4 lg:gap-4 w-full h-full">
                                {hotelStats.map(
                                    ({ value, suffix, title, description }) => (
                                        <div
                                            key={title}
                                            className="rounded-2xl flex flex-col max-w-[350px] items-center justify-center p-6 border border-gray-300 text-center bg-white/40 backdrop-blur"
                                            // initial={{ opacity: 0, y: 20 }}
                                            // whileInView={{ opacity: 1, y: 0 }}
                                            // transition={{
                                            //     duration: 0.5,
                                            //     delay: index * 0.2,
                                            //     repeat: 0,
                                            // }}
                                            // viewport={{ once: true }}
                                            // whileHover={{
                                            //     y: -10,
                                            //     transition: {
                                            //         duration: 0.2,
                                            //         ease: 'easeOut',
                                            //     },
                                            // }}
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
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </NewSection>
            </SmoothScroll>

            <SmoothScroll>
                <NewNewsLetter />
            </SmoothScroll>

            <div className="mt-11" />
        </LandingLayout>
    );
}
