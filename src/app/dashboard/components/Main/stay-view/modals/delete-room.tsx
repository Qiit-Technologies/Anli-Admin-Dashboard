import React from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

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
    if (!isOpen) return null;
    const handleConfirmClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (onConfirm) {
            onConfirm(roomId);
        }
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3 text-red-600">
                        <FaExclamationTriangle className="w-5 h-5" />
                        <h2 className="text-xl font-semibold">Delete Room</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
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
                <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmClick}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Delete Room
                    </button>
                </div>
            </div>
        </div>
    );
}
