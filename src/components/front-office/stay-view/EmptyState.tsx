'use client';

import { CustomSheet } from '@/components/common/CustomSheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { BedDouble, Hotel, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateRoomTypeForm } from '../common/Form/CreateRoom';

export function EmptyRoomState() {
    const [roomTypeOpen, setRoomTypeOpen] = useState(false);
    return (
        <div className="flex flex-col items-center justify-center h-full w-full py-16 px-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-xl shadow-none border border-gray-100 p-8"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur-lg opacity-75"></div>
                        <div className="relative bg-white p-4 rounded-full border border-gray-100 shadow-sm">
                            <Hotel className="h-10 w-10 text-blue-600" />
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No Rooms Available
                    </h3>

                    <p className="text-gray-500 mb-8 max-w-sm">
                        There are currently no rooms or room types configured
                        for this hotel. Add your first room type to get started.
                    </p>

                    <div className="flex items-center gap-3">
                        <BedDouble className="h-5 w-5 text-blue-600" />
                        <div className="h-px w-12 bg-gray-200"></div>
                        <Plus className="h-4 w-4 text-gray-400" />
                        <div className="h-px w-12 bg-gray-200"></div>
                        <Hotel className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="mt-6">
                        <CustomSheet
                            noTitle
                            title="Create Room Type"
                            open={roomTypeOpen}
                            setOpen={setRoomTypeOpen}
                            trigger={
                                <Button
                                    variant={'outline'}
                                    className="px-4 py-2 border-orion-blue text-orion-blue rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add Room Type
                                </Button>
                            }
                        >
                            <div className="border rounded-lg p-4">
                                <Tabs defaultValue="single" className="w-full">
                                    <TabsList className="w-full border-b px-0 justify-start gap-4 rounded-none bg-transparent">
                                        {['single'].map((tab) => (
                                            <TabsTrigger
                                                className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                                                key={tab}
                                                value={tab}
                                            >
                                                {tab}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <TabsContent value="single">
                                        <div className="mt-4">
                                            <CreateRoomTypeForm
                                                onClose={() =>
                                                    setRoomTypeOpen(false)
                                                }
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </CustomSheet>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
