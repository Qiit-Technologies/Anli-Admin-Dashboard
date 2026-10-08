'use client';

import { transferRoom } from '@/app/actions/reservation';
import { getRoomByHotelId } from '@/app/actions/room';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface RoomTransferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guest: {
        id: number;
        fullName: string;
        roomNumber: string;
        roomType?: {
            id: number;
            name: string;
        };
    } | null;
    onTransferComplete?: () => void;
}

export default function RoomTransferModal({
    open,
    onOpenChange,
    guest,
    onTransferComplete,
}: RoomTransferModalProps) {
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [isTransferring, setIsTransferring] = useState(false);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open && guest) {
            setSelectedRoomId(null);
            fetchAvailableRooms();
        }
    }, [open, guest]);

    const fetchAvailableRooms = async () => {
        if (!guest) return;

        setIsLoadingRooms(true);
        try {
            const result = await getRoomByHotelId({ isOccupied: false });
            if (result.error) {
                throw new Error(result.error);
            }

            const rooms = Array.isArray(result.data) ? result.data : [];
            // Only show rooms of the same type
            const sameTypeRooms = rooms.filter(
                (room: any) =>
                    room.roomtype?.id === guest.roomType?.id &&
                    room.roomNumber !== guest.roomNumber,
            );
            setAvailableRooms(sameTypeRooms);
        } catch (error: any) {
            console.error('Error fetching available rooms:', error);
            toast.error('Failed to fetch available rooms');
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const handleTransferRoom = async () => {
        if (!guest || !selectedRoomId) return;

        setIsTransferring(true);
        try {
            const result = await transferRoom(guest.id, selectedRoomId);

            if (result.error) {
                throw new Error(result.error);
            }

            const selectedRoom = availableRooms.find(
                (r) => r.id === selectedRoomId,
            );
            toast.success(
                `Guest ${guest.fullName} has been transferred to room ${selectedRoom?.roomNumber}`,
            );

            onOpenChange(false);
            onTransferComplete?.();
            router.refresh();
        } catch (error: any) {
            toast.error(
                error.message ||
                    'An error occurred while transferring the room',
            );
        } finally {
            setIsTransferring(false);
        }
    };

    if (!guest) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[500px] w-full rounded-2xl p-0 [&>button]:hidden max-h-[90vh] overflow-y-auto"
                style={{ borderRadius: '16px' }}
            >
                <div className="pt-6 pr-6 pb-6 pl-6">
                    <DialogHeader className="relative pb-4 border-b border-[#EAECF0]">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute right-0 top-0 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </button>
                        <DialogTitle className="text-lg font-semibold text-[#101828] flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-[#007BFF]" />
                            Transfer Guest to Different Room
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#667085]">
                            Transfer guest to a different room of the same type.
                            No billing changes will be made.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Current Room Info */}
                    <div className="mt-6 p-4 bg-[#F6FEF9] border border-[#A7F0C7] rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#A7F0C7] flex items-center justify-center">
                                <span className="text-sm font-semibold text-[#067647]">
                                    {guest.fullName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#101828]">
                                    {guest.fullName}
                                </p>
                                <p className="text-xs text-[#667085]">
                                    Current Room:{' '}
                                    <span className="font-semibold">
                                        {guest.roomNumber}
                                    </span>
                                    {guest.roomType &&
                                        ` (${guest.roomType.name})`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Available Rooms List */}
                    <div className="mt-6">
                        <p className="text-sm font-medium text-[#101828] mb-3">
                            Select New Room ({guest.roomType?.name})
                        </p>
                        {isLoadingRooms ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="h-6 w-6 animate-spin text-[#007BFF]" />
                                <span className="ml-2 text-sm text-[#667085]">
                                    Loading available rooms...
                                </span>
                            </div>
                        ) : availableRooms.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-[#667085] mb-2">
                                    No available rooms of the same type
                                </p>
                                <p className="text-xs text-[#667085]">
                                    To transfer to a different room type, please
                                    checkout and create a new reservation.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {availableRooms.map((room) => (
                                    <button
                                        key={room.id}
                                        onClick={() =>
                                            setSelectedRoomId(room.id)
                                        }
                                        className={`w-full p-4 border rounded-lg text-left transition-all ${
                                            selectedRoomId === room.id
                                                ? 'border-[#007BFF] bg-[#F0F6FF]'
                                                : 'border-[#EAECF0] hover:border-[#007BFF] hover:bg-[#F8FAFC]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-[#101828]">
                                                    Room {room.roomNumber}
                                                    {room.roomNumberRoman &&
                                                        ` (${room.roomNumberRoman})`}
                                                </p>
                                                <p className="text-xs text-[#667085]">
                                                    {room.roomtype?.name}
                                                </p>
                                            </div>
                                            {selectedRoomId === room.id && (
                                                <div className="h-5 w-5 rounded-full bg-[#007BFF] flex items-center justify-center">
                                                    <ArrowRight className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 border-[#D0D5DD] text-[#344054]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleTransferRoom}
                            disabled={
                                !selectedRoomId ||
                                isTransferring ||
                                isLoadingRooms
                            }
                            className="flex-1 h-12 bg-[#007BFF] hover:bg-[#0056B3] text-white"
                        >
                            {isTransferring ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Transferring...
                                </>
                            ) : (
                                <>
                                    Transfer Guest
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Info Note */}
                    <p className="mt-4 text-xs text-[#667085] text-center">
                        Only rooms of the same type are available for transfer.
                        No billing changes will be made.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
