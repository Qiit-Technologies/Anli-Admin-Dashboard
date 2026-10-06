import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const variants: any = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.5 },
    },
    slide: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
        transition: { duration: 0.5 },
    },
};

export const SwiperText = ({
    words = ['Smart', 'Brilliant', 'Powerful'],
    interval = 3000,
    animationType = 'fade',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, interval);

        return () => clearInterval(timer);
    }, [words, interval]);

    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={currentIndex}
                initial={variants[animationType].initial}
                animate={variants[animationType].animate}
                exit={variants[animationType].exit}
                transition={variants[animationType].transition}
            >
                {words[currentIndex]}
            </motion.span>
        </AnimatePresence>
    );
};
