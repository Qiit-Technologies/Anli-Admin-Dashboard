import React, { useState } from 'react';
import { BookingDrawerProps } from './types';
import { XCircle } from 'lucide-react';
import DeleteBookingModal from './DeleteBookingModal';
import VoidChargesModal from './voidChargesModal';

const SummaryBox = ({
    heading,
    subHeading,
    subHeadingIsABadge = false,
}: {
    heading: string;
    subHeading: string;
    subHeadingIsABadge?: boolean;
}) => {
    return (
        <div>
            <p className="text-xs font-normal text-[#5F738C]">{heading}:</p>
            {!subHeadingIsABadge ? (
                <p className="text-md font-medium text-[#354052]">
                    {subHeading}
                </p>
            ) : (
                <span className="text-[#02542D] rounded-full px-2 py-0.5 text-xs bg-[#EBFFEE]">
                    {subHeading}
                </span>
            )}
        </div>
    );
};

const BookingDrawer: React.FC<BookingDrawerProps> = ({
    isOpen,
    onClose,
    booking,
}) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showVoidModal, setShowVoidModal] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-white shadow-lg p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-md font-normal text-[#2C2A2A]">
                        Booking Summary Display
                    </h2>
                    <button onClick={onClose} className="cursor-pointer">
                        <XCircle className="w-5 h-5 text-[#007BFF]" />
                    </button>
                </div>

                {/* Booking details */}
                <div className="space-y-3 grid grid-cols-2 text-sm text-gray-700 py-4">
                    <SummaryBox
                        heading="Guest Name"
                        subHeading={booking.guestName}
                    />
                    <SummaryBox
                        heading="Membership Tier"
                        subHeading={booking.membership}
                    />
                    <SummaryBox heading="Date" subHeading={booking.date} />
                    <SummaryBox heading="Time" subHeading={booking.time} />
                    <SummaryBox
                        heading="Access Status"
                        subHeading={booking.access}
                        subHeadingIsABadge
                    />
                    <SummaryBox
                        heading="Booking Status"
                        subHeading={booking.status}
                    />
                    <SummaryBox
                        heading="Duration"
                        subHeading={booking.duration}
                    />
                    <SummaryBox
                        heading="Facility"
                        subHeading={booking.facility}
                    />
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3 text-md font-semibold">
                    <button className="w-full bg-[#007BFF] text-white py-2 rounded-md cursor-pointer">
                        Edit Booking
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(!showDeleteModal)}
                        className="w-full border border-[#007BFF] text-[#007BFF] py-2 rounded-md cursor-pointer"
                    >
                        Delete Booking
                    </button>
                    <button
                        onClick={() => setShowVoidModal(!showVoidModal)}
                        className="w-full text-blue-500 mt-2 cursor-pointer"
                    >
                        Void Charges
                    </button>
                </div>

                {showDeleteModal ? (
                    <DeleteBookingModal
                        onClose={() => setShowDeleteModal(!showDeleteModal)}
                    />
                ) : null}

                {showVoidModal ? (
                    <VoidChargesModal
                        onClose={() => setShowVoidModal(!showVoidModal)}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default BookingDrawer;
