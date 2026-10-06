'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TbCurrencyNaira } from 'react-icons/tb';

interface Room {
    id: string;
    name: string;
    description: string;
    price: number;
    roomCapacity: number;
    roomNumber: number;
    rating?: number;
    image?: string;
    rooms?: Room[];
}

interface RoomModalProps {
    isOpen: boolean;
    closeModal: () => void;
    selectedRoom: Room | null;
}

export default function RoomTypeDetailModal({
    isOpen,
    closeModal,
    selectedRoom,
}: RoomModalProps) {
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
                    className="fixed inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeModal}
                >
                    <motion.div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden relative"
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with accent */}
                        <div className="h-2 w-full"></div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {selectedRoom.name}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-orange-600 transition-colors duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                {selectedRoom.description}
                            </p>

                            <div className="space-y-4">
                                {selectedRoom.rooms &&
                                selectedRoom.rooms.length > 0 ? (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                                            Room Options
                                        </h3>

                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <th className="px-4 py-3">
                                                            Price
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Capacity
                                                        </th>
                                                        <th className="px-4 py-3">
                                                            Room #
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedRoom.rooms.map(
                                                        (room) => (
                                                            <tr
                                                                key={room.id}
                                                                className="hover:bg-gray-50"
                                                            >
                                                                <td className="px-4 py-3 text-sm font-medium text-blue">
                                                                    <div className="flex items-center gap-1">
                                                                        <TbCurrencyNaira className="h-3.5 w-3.5" />
                                                                        {room.price.toLocaleString()}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {
                                                                        room.roomCapacity
                                                                    }{' '}
                                                                    Guest
                                                                    {room.roomCapacity >
                                                                    1
                                                                        ? 's'
                                                                        : ''}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                                                    {
                                                                        room.roomNumber
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4 px-5 border border-gray-200 rounded-lg bg-gray-50 text-center">
                                        <p className="text-sm text-gray-600">
                                            No rooms currently available
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-blue hover:bg-blue text-white text-sm font-medium rounded-md transition-colors duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
