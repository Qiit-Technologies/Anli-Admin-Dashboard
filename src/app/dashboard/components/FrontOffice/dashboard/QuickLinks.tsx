'use client';

import ActionCard from '@/components/ActionCard';
import Link from 'next/link';
import { useState } from 'react';
import CheckOutModal from './CheckOutCard';
import ExtendStayModal from './ExtendStayCard';
import NewReservationModal from './ReservationModal';
import { useRouter } from 'nextjs-toploader/app';

export default function QuickLinks() {
    const [isCheckOutOpen, setIsCheckOutOpen] = useState<boolean>(false);
    const [isExtendStayOpen, setIsExtendStayOpen] = useState<boolean>(false);
    const [isReservationOpen, setIsReservationOpen] = useState(false);
    const router = useRouter();
    const handleFormSubmit = () => {};

    const handleRoomRoutes = () => {
        router.push('/room');
    };

    return (
        <>
            <div className="w-full px-2 py-3">
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="w-full">
                        <Link
                            shallow
                            href="?frontoffice=reservationlist"
                            className="block w-full h-full"
                        >
                            <ActionCard
                                icon="material-symbols:bedroom-child-outline-rounded"
                                title="New check-ins"
                                className="w-full h-full"
                            />
                        </Link>
                    </div>

                    <div className="w-full">
                        <ActionCard
                            icon="solar:document-add-linear"
                            title="New reservation"
                            onPress={() => {
                                setIsReservationOpen(true);
                            }}
                            className="w-full h-full"
                        />
                    </div>

                    <div className="w-full">
                        <ActionCard
                            icon="material-symbols:add-ad-outline-rounded"
                            title="Extend stay"
                            onPress={() => {
                                setIsExtendStayOpen(true);
                            }}
                            className="w-full h-full"
                        />
                    </div>

                    <div className="w-full">
                        <ActionCard
                            icon="fluent:door-16-regular"
                            title="Check-out guest"
                            onPress={() => {
                                setIsCheckOutOpen(true);
                            }}
                            className="w-full h-full"
                        />
                    </div>
                    <div className="w-full">
                        <ActionCard
                            icon="fluent:conference-room-16-regular"
                            title="Create Room"
                            onPress={handleRoomRoutes}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>

            <ExtendStayModal
                isOpen={isExtendStayOpen}
                onClose={() => setIsExtendStayOpen(false)}
            />
            <CheckOutModal
                isOpen={isCheckOutOpen}
                onClose={() => setIsCheckOutOpen(false)}
            />
            <NewReservationModal
                open={isReservationOpen}
                onClose={() => setIsReservationOpen(false)}
                onSubmit={handleFormSubmit}
            />
        </>
    );
}
