'use client';

import {
    animate,
    motion,
    useInView,
    useMotionValue,
    useTransform,
} from 'framer-motion';
import { useEffect, useRef } from 'react';

const CountUpValue = ({
    endValue,
    suffix,
    duration = 2,
}: {
    endValue: number;
    suffix: string;
    duration?: number;
}) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => {
        if (Number.isInteger(endValue)) {
            return Math.round(latest);
        }
        return latest.toFixed(1);
    });

    const ref = useRef(null);

    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (isInView) {
            const animation = animate(count, endValue, {
                duration: duration,
                ease: 'easeOut',
            });

            return animation.stop;
        }
    }, [count, endValue, duration, isInView]);

    return (
        <h2 ref={ref} className="text-4xl font-bold text-white">
            <motion.span>{rounded as any}</motion.span>
            <span className="text-2xl align-middle">{suffix}</span>
        </h2>
    );
};

export default CountUpValue;
