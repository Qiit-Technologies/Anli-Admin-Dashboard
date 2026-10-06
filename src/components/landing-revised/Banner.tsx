import { motion, useAnimationControls } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Section from './layout/Section';

const Brands = [
    '/landing/brands/corniche.png',
    '/landing/brands/yourrentals.svg',
    '/landing/airbnb.png',
    '/landing/bk.png',
];

const Banner = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const controls = useAnimationControls();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const tripleBrands = [...Brands, ...Brands, ...Brands];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoaded || !containerRef.current) return;

        const singleSetWidth = containerRef.current.scrollWidth / 3;
        setContainerWidth(singleSetWidth);
    }, [isLoaded]);

    useEffect(() => {
        if (containerWidth === 0) return;

        let isMounted = true;

        const id = requestAnimationFrame(() => {
            if (!isMounted) return;

            controls.set({ x: -containerWidth });

            const animate = async () => {
                if (!isMounted) return;

                await controls.start({
                    x: -containerWidth * 2,
                    transition: {
                        duration: 20,
                        ease: 'linear',
                        repeat: 0,
                    },
                });

                if (!isMounted) return;

                controls.set({ x: -containerWidth });

                animate();
            };

            animate();
        });

        return () => {
            isMounted = false;
            cancelAnimationFrame(id);
        };
    }, [containerWidth, controls]);

    return (
        <Section bgClassName="bg-[#001933]" className="py-0 lg:py-2">
            <div className="w-full p-6 py-4 overflow-hidden">
                <motion.div
                    ref={containerRef}
                    className="grid grid-flow-col auto-cols-max gap-10"
                    animate={controls}
                >
                    {tripleBrands.map((brand, index) => (
                        <div
                            key={index}
                            className="flex items-center w-[120px] h-[60px] justify-center"
                        >
                            <Image
                                priority={index < Brands.length * 2}
                                src={brand || '/placeholder.svg'}
                                width={120}
                                height={100}
                                alt="Brand"
                                className={`object-contain ${index < 1 ? 'invert' : ''}`}
                                style={{
                                    filter: index < 1 ? 'invert(1)' : 'none',
                                }}
                                onLoad={() =>
                                    index === tripleBrands.length - 1 &&
                                    setIsLoaded(true)
                                }
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </Section>
    );
};

export default Banner;
