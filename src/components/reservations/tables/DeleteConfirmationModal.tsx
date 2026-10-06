'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface DeleteConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
}

export default function DeleteConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    isLoading = false,
}: DeleteConfirmationModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="flex flex-col items-center gap-4">
                    <div className="bg-red-50 rounded-full p-4">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="text-center">
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-2">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="flex gap-3 sm:justify-center mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 py-6 rounded-lg border-gray-200"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 rounded-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
