'use client';
import { motion, useInView } from 'framer-motion';
import * as React from 'react';

export function TextFade({
    direction,
    children,
    className = '',
    staggerChildren = 0.1,
    delay = 0,
}: {
    direction: 'up' | 'down';
    children: React.ReactNode;
    className?: string;
    staggerChildren?: number;
    delay?: number;
}) {
    const FADE_DOWN = {
        show: { opacity: 1, y: 0, transition: { type: 'spring' } },
        hidden: { opacity: 0, y: direction === 'down' ? -18 : 18 },
    };
    const ref = React.useRef(null);
    const isInView = useInView(ref);
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'show' : ''}
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: staggerChildren,
                    },
                },
            }}
            className={className}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child) ? (
                    <motion.div
                        variants={FADE_DOWN}
                        transition={{
                            duration: 0.5,
                            delay: delay,
                        }}
                    >
                        {child}
                    </motion.div>
                ) : (
                    child
                ),
            )}
        </motion.div>
    );
}
