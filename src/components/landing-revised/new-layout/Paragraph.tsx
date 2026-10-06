'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface ParagraphProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}
const Paragraph = ({ children, className, ...props }: ParagraphProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
        >
            <p {...props} className={cn('text-muted-foreground', className)}>
                {children}
            </p>
        </motion.div>
    );
};

export default Paragraph;
