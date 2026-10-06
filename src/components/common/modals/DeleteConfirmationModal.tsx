'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    itemName: string;
    itemNumber: string;
}

export function DeleteConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    itemName,
    itemNumber,
}: DeleteConfirmationModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[20px] border-none shadow-2xl">
                <div className="p-10 flex flex-col items-center text-center space-y-6 bg-white">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center relative">
                        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                            <X className="h-8 w-8 text-white stroke-[3px]" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <DialogTitle className="text-2xl font-bold text-[#4B2C20]">
                            Delete Inventory Item?
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-medium px-4 leading-relaxed">
                            Are you sure you want to delete &ldquo;{itemName}&rdquo; (
                            {itemNumber})? This action cannot be undone and will
                            remove all associated data.
                        </DialogDescription>
                    </div>

                    <div className="flex items-center gap-4 w-full pt-4">
                        <Button
                            onClick={onConfirm}
                            className="flex-1 bg-orion-blue hover:bg-orion-blue/90 h-14 rounded-xl text-white font-bold text-lg shadow-lg shadow-orion-blue/20"
                        >
                            Delete
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 h-14 rounded-xl text-gray-700 font-bold text-lg"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
