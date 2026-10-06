'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareBookingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotelName: string;
    hotelId: string | number;
}

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

export default function ShareBookingModal({
    open,
    onOpenChange,
    hotelName,
    hotelId,
}: ShareBookingModalProps) {
    const [copied, setCopied] = useState(false);
    
    const slug = slugify(hotelName || 'hotel');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const bookingUrl = `${baseUrl}/${slug}/${hotelId}/booking`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(bookingUrl);
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-orion-blue" />
                        Share Booking Link
                    </DialogTitle>
                    <DialogDescription>
                        Copy this link to share the public booking page with your guests.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Globe className="w-5 h-5 text-orion-blue shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-orion-blue uppercase tracking-wider">Public Reservation URL</span>
                            <span className="text-xs text-blue-900 truncate font-medium">{bookingUrl}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Input
                                id="link"
                                defaultValue={bookingUrl}
                                readOnly
                                className="h-10 text-sm bg-gray-50 border-gray-200"
                            />
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            className="px-3 bg-orion-blue hover:bg-blue-700 h-10"
                            onClick={handleCopy}
                        >
                            <span className="sr-only">Copy</span>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 px-6 rounded-lg text-sm font-medium"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
