'use client';

import Image from 'next/image';
import NewBanner from '@/components/landing-revised/NewBanner';
import LandingLayout from '@/components/landing-revised/new-layout/Layout';
import NewNewsLetter from '@/components/landing-revised/NewNewsLetter';
import SmoothScroll from '@/components/landing-revised/SmoothScroll';
import GetStarted from '@/components/landing-revised/GetStarted';
import NewWhyChooseUs from '@/components/landing-revised/NewWhyChooseUs';
import NewProductAndServices from '@/components/landing-revised/NewProductAndServices';
import FAQ from '@/components/landing-revised/FAQ';
import HeroSection from './HeroSection';
import ConferenceBanner from '@/components/landing-revised/ConferenceBanner';

export default function NewHomeClient() {
    return (
        <LandingLayout>
            <ConferenceBanner />
            <section className="relative h-screen flex flex-col z-[1] gap-5 py-28 lg:py-24">
                <Image
                    src="/new-landing-hero.jpg"
                    alt="ANLI Solutions Homepage"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    priority
                />

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 py-10 lg:px-24">
                    <HeroSection />
                </div>
            </section>

            <NewBanner />
            <SmoothScroll>
                <NewWhyChooseUs />
            </SmoothScroll>
            <SmoothScroll>
                <NewProductAndServices />
            </SmoothScroll>
            <SmoothScroll>
                <GetStarted />
            </SmoothScroll>
            <SmoothScroll>
                <NewNewsLetter />
            </SmoothScroll>
            <SmoothScroll>
                <FAQ />
            </SmoothScroll>
        </LandingLayout>
    );
}
