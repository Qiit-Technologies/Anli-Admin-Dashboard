import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, ArrowDown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Table {
    id: string | number;
    spaceId: string | number;
    tableType: string;
    tableNumber: string;
    dateCreated?: string;
    createdAt?: string;
    status: 'Available' | 'Booked' | 'Occupied';
    capacity: number;
    availableSeats?: number;
    isOccupied?: boolean;
}

export interface Space {
    id: string | number;
    name: string;
    description: string;
    tables?: Table[];
}

interface SpaceListProps {
    spaces: Space[];
    onAddTable?: (spaceId: string) => void;
    onDeleteSpace?: (spaceId: string) => void;
    onDeleteTable?: (tableId: string) => void;
    onEditTable?: (table: Table) => void;
    onViewReservation?: (tableId: string) => void;
}

export default function SpaceList({
    spaces,
    onAddTable,
    onDeleteSpace,
    onDeleteTable,
    onEditTable,
    onViewReservation,
}: SpaceListProps) {
    const [expandedSpaces, setExpandedSpaces] = useState<
        Record<string, boolean>
    >(Object.fromEntries(spaces.map((s) => [s.id.toString(), true])));

    const toggleSpace = (spaceId: string) => {
        setExpandedSpaces((prev) => ({
            ...prev,
            [spaceId]: !prev[spaceId],
        }));
    };

    return (
        <div className="space-y-6">
            {spaces.map((space) => {
                const isExpanded = expandedSpaces[space.id.toString()] ?? true;
                return (
                    <motion.div
                        layout
                        key={space.id}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                    >
                        {/* Space Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white z-10 relative">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() =>
                                        toggleSpace(space.id.toString())
                                    }
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors group"
                                >
                                    <motion.div
                                        animate={{
                                            rotate: isExpanded ? 0 : -90,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                                    </motion.div>
                                </button>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {space.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {space.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() =>
                                        onAddTable?.(space.id.toString())
                                    }
                                    className="bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white rounded-lg px-6"
                                >
                                    Add New Table
                                </Button>
                                <Button
                                    onClick={() =>
                                        onDeleteSpace?.(space.id.toString())
                                    }
                                    variant="outline"
                                    className="text-gray-600 border-gray-300 rounded-lg px-6"
                                >
                                    Delete Space
                                </Button>
                            </div>
                        </div>

                        {/* Tables List */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                    }}
                                    className="overflow-hidden"
                                >
                                    {space.tables && space.tables.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            {/* Table Header */}
                                            <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 text-sm text-gray-500 font-medium">
                                                <div className="flex items-center gap-1">
                                                    Table Type
                                                    <HelpCircle className="w-4 h-4" />
                                                </div>
                                                <div>Table Number</div>
                                                <div className="flex items-center gap-1">
                                                    Date Created
                                                    <HelpCircle className="w-4 h-4" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    Status
                                                    <ArrowDown className="w-4 h-4" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    Actions
                                                    <HelpCircle className="w-4 h-4" />
                                                </div>
                                            </div>

                                            {/* Table Rows */}
                                            {space.tables.map((table) => (
                                                <div
                                                    key={table.id}
                                                    className="grid grid-cols-5 gap-4 px-6 py-4 border-t border-gray-100 items-center hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <div className="text-gray-700">
                                                        {table.tableType}
                                                    </div>
                                                    <div className="text-gray-700">
                                                        {table.tableNumber}
                                                    </div>
                                                    <div className="text-gray-700">
                                                        {table.createdAt
                                                            ? new Date(
                                                                  table.createdAt,
                                                              ).toLocaleDateString(
                                                                  'en-GB',
                                                                  {
                                                                      day: '2-digit',
                                                                      month: 'long',
                                                                      year: 'numeric',
                                                                  },
                                                              )
                                                            : table.dateCreated}
                                                    </div>
                                                    <div>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                                                                table.status ===
                                                                'Available'
                                                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                                                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                            }`}
                                                        >
                                                            {table.status ===
                                                            'Available'
                                                                ? `Available (${table.availableSeats ?? table.capacity} left)`
                                                                : 'Occupied'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {table.status ===
                                                        'Occupied' ? (
                                                            <button
                                                                onClick={() => {
                                                                    onViewReservation?.(
                                                                        table.id.toString(),
                                                                    );
                                                                }}
                                                                className="text-[#0A84FF] hover:underline text-sm font-medium flex items-center gap-2"
                                                            >
                                                                Check Details
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        onDeleteTable?.(
                                                                            table.id.toString(),
                                                                        )
                                                                    }
                                                                    className="text-gray-500 hover:text-red-600 text-sm transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        onEditTable?.(
                                                                            {
                                                                                ...table,
                                                                                spaceId:
                                                                                    space.id,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="text-gray-500 hover:text-[#0A84FF] text-sm transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center text-gray-500 border-t border-gray-100 italic">
                                            No tables in this space.
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
