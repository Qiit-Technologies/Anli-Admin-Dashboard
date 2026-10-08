'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

interface ShareReservationLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotelName: string;
    hotelId: string | number;
}

export default function ShareReservationLinkModal({
    isOpen,
    onClose,
    hotelName,
    hotelId,
}: ShareReservationLinkModalProps) {
    const [copied, setCopied] = useState(false);

    // Slugify the hotel name for the URL
    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w-]+/g, '') // Remove all non-word chars
            .replace(/--+/g, '-'); // Replace multiple - with single -
    };

    const hotelSlug = slugify(hotelName);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const reservationLink = `${baseUrl}/${hotelSlug}/${hotelId}/reservation`;
    const bookingLink = `${baseUrl}/${hotelSlug}/${hotelId}/booking`;

    const handleCopy = async (link: string) => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            toast.custom(() => (
                <Toast
                    title="Success"
                    description="Link copied to clipboard!"
                    type="success"
                />
            ));
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Failed to copy link"
                    type="error"
                />
            ));
        }
    };

    const handleShare = async (link: string, title: string) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Make a ${title.toLowerCase()} at ${hotelName}`,
                    url: link,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy(link);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-6 rounded-xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-semibold text-[#101828]">
                        Share Public Links
                    </DialogTitle>
                    <p className="text-sm text-[#667085] mt-1">
                        Share these links with your customers to allow them to
                        make reservations or bookings online.
                    </p>
                </DialogHeader>

                <div className="space-y-8">
                    {/* Reservation Link */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-[#344054]">Table Reservation Link</label>
                        <div className="relative">
                            <div className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-lg text-sm text-[#344054] pr-12 break-all">
                                {reservationLink}
                            </div>
                            <button
                                onClick={() => handleCopy(reservationLink)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-[#F2F4F7] rounded-md transition-colors"
                                title="Copy link"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-[#667085]" />
                                )}
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-10 border-[#D0D5DD] text-[#344054] text-xs font-medium rounded-lg"
                                onClick={() => handleCopy(reservationLink)}
                            >
                                <Copy className="w-3.5 h-3.5 mr-2" />
                                Copy Reservation Link
                            </Button>
                            <Button
                                className="flex-1 h-10 bg-orion-blue hover:bg-orion-blue text-white text-xs font-medium rounded-lg"
                                onClick={() => handleShare(reservationLink, 'Table Reservation')}
                            >
                                <Share2 className="w-3.5 h-3.5 mr-2" />
                                Share Link
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-[#EAECF0]" />

                    {/* Booking Link */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-[#344054]">Room Booking Link</label>
                        <div className="relative">
                            <div className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-lg text-sm text-[#344054] pr-12 break-all">
                                {bookingLink}
                            </div>
                            <button
                                onClick={() => handleCopy(bookingLink)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-[#F2F4F7] rounded-md transition-colors"
                                title="Copy link"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-[#667085]" />
                                )}
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-10 border-[#D0D5DD] text-[#344054] text-xs font-medium rounded-lg"
                                onClick={() => handleCopy(bookingLink)}
                            >
                                <Copy className="w-3.5 h-3.5 mr-2" />
                                Copy Booking Link
                            </Button>
                            <Button
                                className="flex-1 h-10 bg-[#066812] hover:bg-[#066812]/90 text-white text-xs font-medium rounded-lg"
                                onClick={() => handleShare(bookingLink, 'Room Booking')}
                            >
                                <Share2 className="w-3.5 h-3.5 mr-2" />
                                Share Link
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

    );
}
