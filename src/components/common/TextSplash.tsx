'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

export const TextSplash = ({ children }: { children: ReactNode }) => {
    const textRef = useRef<HTMLSpanElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (textRef.current) {
            const updateDimensions = () => {
                setDimensions({
                    width: textRef.current?.offsetWidth || 0,
                    height: textRef.current?.offsetHeight || 0,
                });
            };

            updateDimensions();
            window.addEventListener('resize', updateDimensions);

            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, [children]);

    return (
        <span className="relative inline-block">
            <span
                className="absolute inset-0 z-0"
                style={{
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
                }}
            >
                <div
                    className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                    style={{
                        backgroundImage: `url('/landing/svg/splash.png')`,
                        backgroundSize: '100% 100%',
                    }}
                />
            </span>
            <span
                ref={textRef}
                className="relative z-10 word-whitespace-nowrap"
            >
                {children}
            </span>
        </span>
    );
};
