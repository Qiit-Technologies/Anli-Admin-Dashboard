'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface AnimatedStarProps {
    className?: string;
    position?: {
        top?: string | number;
        bottom?: string | number;
        left?: string | number;
        right?: string | number;
    };
}

export const AnimatedStar = ({ className, position }: AnimatedStarProps) => {
    return (
        <motion.div
            className={`absolute w-4 h-4`}
            style={{
                top: position?.top,
                bottom: position?.bottom,
                left: position?.left,
                right: position?.right,
            }}
            whileHover={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
            <Star className={cn(`animate-spin`, className)} />
        </motion.div>
    );
};
