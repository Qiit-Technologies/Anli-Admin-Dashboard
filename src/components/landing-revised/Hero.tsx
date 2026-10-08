'use client';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TextSplash } from '../common/TextSplash';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { AnimatedStar } from './AnimatedStar';
import { TypingEffect } from './animations';
import { TextFade } from './animations/Fade';
import { ShimmerEffectButton } from './ButtonShimmer';
import ImageCarousel from './Carousel';
import Section from './layout/Section';
import { SwapEffectButton } from './SwapEffectButton';
import { SwiperText } from './SwiperText';

const Hero = () => {
    const [mount, setMount] = useState(false);

    useEffect(() => {
        setMount(true);
    }, []);
    return (
        <Section className="h-screen" bgClassName="bg-[#FFF8F2]">
            <AnimatedStar
                className="fill-hexbrand text-hexbrand"
                position={{ top: '9rem', left: '25%' }}
            />

            <AnimatedStar
                className="fill-black text-black"
                position={{ bottom: '2.5rem' }}
            />

            <AnimatedStar
                className="fill-black text-black"
                position={{ bottom: '2.5rem', right: '2.5rem' }}
            />
            {mount && (
                <div className="grid transition-all grid-cols-1 lg:grid-cols-2 w-full h-full">
                    <div className="flex transition-all text-center lg:text-start flex-col items-center justify-center mt-14 gap-5">
                        <TextFade
                            delay={0.5}
                            direction="up"
                            staggerChildren={5}
                        >
                            <h1 className="text-4xl lg:text-5xl transition-all font-bold">
                                Revolutionising Hotel Management{' '}
                                <TextSplash>
                                    <SwiperText
                                        words={[
                                            'With Smart',
                                            'With Cloud',
                                            'AI-Powered',
                                        ]}
                                        interval={2000}
                                        animationType="slide"
                                    />
                                </TextSplash>{' '}
                                <br />
                                Technology
                            </h1>
                        </TextFade>
                        <TypingEffect
                            className="text-base text-muted-foreground"
                            text="Smart, seamless hotel management—optimize
                                operations, enhance guest experiences, and
                                maximize revenue with ANLI Solutions."
                        />
                        <div className="flex items-center w-full mt-3 justify-center lg:justify-start gap-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <ShimmerEffectButton
                                        variant={'outline'}
                                        className="bg-hexbrand hover:bg-orion-blue hover:text-white animate-bg-shine text-white shadow-none p-3 h-12 text-base"
                                    >
                                        See how it works
                                    </ShimmerEffectButton>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            How Anli Solutions Works
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="aspect-video w-full">
                                        <video
                                            className="w-full h-full rounded-lg"
                                            controls
                                            autoPlay
                                        >
                                            <source
                                                src="/landing/videos/demo.mp4"
                                                type="video/mp4"
                                            />
                                            Your browser does not support the
                                            video tag.
                                        </video>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Link href="/get-a-demo">
                                <SwapEffectButton
                                    variant={'outline'}
                                    className="h-14 w-40 p-3 px-6 flex items-center bg-white shadow-none text-base"
                                    Icon={<PlayCircle className="w-10 h-10" />}
                                >
                                    <PlayCircle className="mr-2 w-6 h-6" /> Get
                                    a demo
                                </SwapEffectButton>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-24 hidden lg:flex">
                        <ImageCarousel mount={mount} />
                    </div>
                </div>
            )}
        </Section>
    );
};

export default Hero;
