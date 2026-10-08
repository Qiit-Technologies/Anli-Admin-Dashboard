'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
const SmoothScroll = ({ children }: { children: ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                    type: 'spring',
                    duration: 1,
                    bounce: 0.1,
                    stiffness: 90,
                    damping: 20,
                },
            }}
            viewport={{
                once: true,
                margin: '-100px',
            }}
        >
            {children}
        </motion.div>
    );
};
export default SmoothScroll;
