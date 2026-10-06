'use client';

import Image from 'next/image';
import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface CenterContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    backgroundImage: string;
    enableParallax?: boolean;
    parallaxSpeed?: number;
}
const CenterContainer = ({
    children,
    backgroundImage,
    className,
    enableParallax = false,
    parallaxSpeed = 0.2,
    ...props
}: CenterContainerProps) => {
    const [mount, setMount] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMount(true);
    }, []);
    useEffect(() => {
        if (!enableParallax) return;

        const handleScroll = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const offsetTop = rect.top;
                const isVisible =
                    offsetTop < window.innerHeight && offsetTop > -rect.height;

                if (isVisible) {
                    setScrollPosition(window.pageYOffset);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [enableParallax]);

    const getParallaxStyle = () => {
        if (!enableParallax) return {};

        const yPos = scrollPosition * parallaxSpeed;

        return {
            transform: `translate3d(0, ${yPos}px, 0)`,
            height: '120%',
            top: '-10%',
        };
    };

    return (
        <div
            ref={containerRef}
            {...props}
            className={`w-full h-screen relative overflow-hidden ${className}`}
        >
            {mount && (
                <>
                    <div
                        className="absolute inset-0 w-full"
                        style={
                            enableParallax
                                ? {
                                      position: 'absolute',
                                      width: '100%',
                                      willChange: 'transform',
                                      ...getParallaxStyle(),
                                  }
                                : {}
                        }
                    >
                        <Image
                            src={backgroundImage}
                            fill
                            style={{ objectFit: 'cover' }}
                            alt={`Background image`}
                            priority
                        />
                    </div>
                    <div className="bg-black/40 z-20 inset-0 absolute flex items-center justify-center">
                        {children}
                    </div>
                </>
            )}
        </div>
    );
};

export default CenterContainer;
