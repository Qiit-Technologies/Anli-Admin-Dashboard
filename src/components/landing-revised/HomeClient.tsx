'use client';
import Logo from '@/components/common/Logo';
import Banner from '@/components/landing-revised/Banner';
import LandingLayout from '@/components/landing-revised/layout/Layout';
import Newsletter from '@/components/landing-revised/NewsLetter';
import ProductAndServices from '@/components/landing-revised/ProductAndServices';
import SmoothScroll from '@/components/landing-revised/SmoothScroll';
import Solutions from '@/components/landing-revised/Solutions';
import Testimonials from '@/components/landing-revised/Testimonial';
import WhatsNewSection from '@/components/landing-revised/WhatsNew';
import WhyChooseUs from '@/components/landing-revised/WhyChooseUs';
import { useEffect, useState } from 'react';
import Section from './layout/Section';
import HeroImage from './Careers/HeroImage';

export default function HomeClient() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex bg-[#FFF8F2] items-center justify-center w-full h-screen ">
                <div className="flex flex-col items-center">
                    <div className="animate-pulse">
                        <Logo width={60} height={60} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LandingLayout>
            <Section
                bgClassName="bg-black"
                className="h-screen flex z-[1] flex-col gap-5 py-24"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '20px 20px',
                }}
            >
                <div className="text-white text-center mt-8 z-[2]">
                    <h1 className="text-3xl font-bold">Our Resources</h1>
                    <p>
                        Stay ahead of the curve with insights, trends, and
                        strategies for modern hoteliers.
                    </p>
                </div>
                <div className="w-full flex items-center justify-center mt-8">
                    <div className="max-w-4xl">
                        <HeroImage />
                    </div>
                </div>
            </Section>
            {/* <h1 className="sr-only">Anli Solutions</h1> */}
            {/* <Hero /> */}
            <SmoothScroll>
                <Banner />
            </SmoothScroll>
            <SmoothScroll>
                <WhatsNewSection />
            </SmoothScroll>
            <SmoothScroll>
                <WhyChooseUs />
            </SmoothScroll>
            <SmoothScroll>
                <ProductAndServices />
            </SmoothScroll>
            <SmoothScroll>
                <Solutions />
            </SmoothScroll>
            <SmoothScroll>
                <Testimonials />
            </SmoothScroll>
            <SmoothScroll>
                <Newsletter />
            </SmoothScroll>
            {/* <header className="w-full h-[700px] md:h-[1100px] xl:h-header bg-gradient">
                <Navbar />
                <Banner />
            </header>
            <article>
                <Company />
                <Benefit />
                <Transaction />
                <Pricing />
                <Review /> 
                <Newsletter />
            </article>
            <footer>
                <Footer />
            </footer> */}
        </LandingLayout>
    );
}
