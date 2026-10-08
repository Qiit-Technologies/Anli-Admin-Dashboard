import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (roomId: string) => void;
    roomType: string;
    roomNumber: string;
    roomId: string;
}

export function DeleteRoomModal({
    isOpen,
    onClose,
    onConfirm,
    roomType,
    roomNumber,
    roomId,
}: DeleteRoomModalProps) {
    const handleConfirmClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (onConfirm) {
            onConfirm(roomId);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 text-red-600">
                        <FaExclamationTriangle className="w-5 h-5" />
                        <DialogTitle className="text-xl font-semibold">
                            Delete Room
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete room{' '}
                        <span className="font-medium">{roomNumber}</span> from{' '}
                        <span className="font-medium">{roomType}</span>?
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="text-sm text-amber-800">
                            This action cannot be undone. All booking history
                            and room data will be permanently deleted.
                        </p>
                    </div>
                </div>

                <DialogFooter className="mt-6 pt-4 border-t flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirmClick}>
                        Delete Room
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
