'use client';

import { formatCurrency } from '@/lib/utils';
import useHotel from '@/hooks/useHotel';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Star, Users, Hash, CreditCard, Info } from 'lucide-react';
import React, { useEffect } from 'react';

interface Room {
    id: string;
    name: string;
    description: string;
    price: number;
    roomCapacity: number;
    roomNumber: number;
    rating?: number;
    image?: string;
    roomtype: {
        name: string;
    };
    coverImage?: string;
    roomNumberRoman: string;
    amenities?: string[];
}

interface RoomDetailModalProps {
    isOpen: boolean;
    closeModal: () => void;
    selectedRoom: Room | null;
}

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalVariants = {
    hidden: { scale: 0.9, y: 50, opacity: 0 },
    visible: {
        scale: 1,
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 20,
            stiffness: 300,
            mass: 0.5,
        },
    },
    exit: {
        scale: 0.95,
        y: 20,
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 0.2,
            duration: 0.3,
        },
    },
};

export default function RoomDetailModal({
    isOpen,
    closeModal,
    selectedRoom,
}: RoomDetailModalProps) {
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [closeModal]);

    if (!selectedRoom) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={closeModal}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative max-h-[90vh] overflow-y-auto"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cover Image with Floating Close Button */}
                        <div className="relative">
                            {selectedRoom.coverImage ? (
                                <motion.img
                                    src={selectedRoom.coverImage}
                                    alt={selectedRoom.name}
                                    className="w-full h-64 object-cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                />
                            ) : (
                                <motion.div
                                    className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <span className="text-white text-2xl font-bold">
                                        Room {selectedRoom.roomNumber}
                                    </span>
                                </motion.div>
                            )}

                            <motion.button
                                onClick={closeModal}
                                className="absolute top-4 right-4 bg-white/30 hover:bg-white/40 backdrop-blur-md text-gray-800 hover:text-black rounded-full p-2 transition-all duration-200 shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.button>
                        </div>

                        {/* Room Content */}
                        <motion.div
                            className="p-6"
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedRoom?.roomtype?.name ||
                                            'Unassigned'}{' '}
                                        Suite
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Room #{selectedRoom.roomNumber}
                                        {showRoman &&
                                        selectedRoom.roomNumberRoman
                                            ? ` (${selectedRoom.roomNumberRoman})`
                                            : ''}
                                    </p>
                                </div>

                                {selectedRoom.rating && (
                                    <motion.div
                                        className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: 'spring',
                                            delay: 0.4,
                                        }}
                                    >
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="ml-1 text-sm font-medium">
                                            {selectedRoom.rating.toFixed(1)}
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            <motion.p
                                className="mt-4 text-gray-700 dark:text-gray-300"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {selectedRoom.description ||
                                    'A comfortable and well-equipped room for your stay.'}
                            </motion.p>

                            {/* Room Details */}
                            <motion.div
                                className="mt-6 grid grid-cols-2 gap-4"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.1,
                                            delayChildren: 0.4,
                                        },
                                    },
                                }}
                                initial="hidden"
                                animate="visible"
                            >
                                {[
                                    {
                                        icon: Users,
                                        label: 'Capacity',
                                        value: `${selectedRoom.roomCapacity} ${selectedRoom.roomCapacity > 1 ? 'People' : 'Person'}`,
                                    },
                                    {
                                        icon: Hash,
                                        label: 'Room Number',
                                        value: `${selectedRoom.roomNumber}${showRoman && selectedRoom.roomNumberRoman ? ` (${selectedRoom.roomNumberRoman})` : ''}`,
                                    },
                                    {
                                        icon: CreditCard,
                                        label: 'Price',
                                        value: `${formatCurrency(selectedRoom.price)} per night`,
                                    },
                                    {
                                        icon: Info,
                                        label: 'Type',
                                        value:
                                            selectedRoom?.roomtype?.name ||
                                            'Unassigned',
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center"
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                    >
                                        <item.icon className="h-5 w-5 text-blue-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {item.label}
                                            </p>
                                            <p className="font-medium capitalize">
                                                {item.value}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
