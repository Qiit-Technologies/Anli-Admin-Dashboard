'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}
const Heading = ({ children, className, ...props }: HeadingProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.05 }}
        >
            <h1 {...props} className={cn('text-3xl font-bold', className)}>
                {children}
            </h1>
        </motion.div>
    );
};

export default Heading;
