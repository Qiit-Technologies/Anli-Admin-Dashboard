'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import * as React from 'react';

interface AnimatedTextProps {
    text: string;
    className?: string;
    delay?: number;
}

export function GradualSpacing({
    text = 'Gradual Spacing',
    className = '',
    charClassName = 'text-base text-muted-foreground',
    delayMultiplier = 0.1,
    duration = 0.1,
}: {
    text: string;
    className?: string;
    charClassName?: string;
    delayMultiplier?: number;
    duration?: number;
}) {
    const ref = React.useRef(null);
    const inView = useInView(ref, { once: true });

    return (
        <AnimatePresence>
            <motion.span
                ref={ref}
                className={cn('inline-flex flex-wrap justify-start', className)}
                aria-label={text}
            >
                {text.split('').map((char, i) => (
                    <motion.span
                        key={`${char}-${i}`}
                        initial={{ opacity: 0, x: -18 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration,
                            delay: i * delayMultiplier,
                            ease: 'easeOut',
                        }}
                        className={cn('inline-block', charClassName)}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                ))}
            </motion.span>
        </AnimatePresence>
    );
}

export function TypingEffect({
    text = 'Typing Effect',
    className = 'text-base text-muted-foreground',
}: {
    text: string;
    className?: string;
}) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });
    return (
        <span ref={ref} className={cn(className)}>
            {text.split('').map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.1, delay: index * 0.01 }}
                >
                    {letter}
                </motion.span>
            ))}
        </span>
    );
}

export const StaggeredText = ({
    text,
    className = '',
    delay = 0.2,
}: AnimatedTextProps) => {
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: delay },
        },
    };

    const child = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className={`inline-block ${className}`}
        >
            {text.split('').map((letter, index) => (
                <motion.span
                    key={index}
                    variants={child}
                    className="inline-block whitespace-pre"
                >
                    {letter}
                </motion.span>
            ))}
        </motion.div>
    );
};
