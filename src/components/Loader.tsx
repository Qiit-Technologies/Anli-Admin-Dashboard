'use client';

import { motion } from 'framer-motion';

const CustomLoader = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <motion.div
                className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    ease: 'linear',
                    repeat: Number.POSITIVE_INFINITY,
                }}
            />
        </div>
    );
};

export default CustomLoader;
