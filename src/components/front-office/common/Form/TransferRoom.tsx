'use client';
import { transferRoom } from '@/app/actions/reservation';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import useHotel from '@/hooks/useHotel';
import { useRooms } from '@/hooks/useRooms';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

interface TransferRoomFormData {
    guestName: string;
    currentRoom: string;
    currentRoomType: string;
    newRoom: string;
}

interface Props {
    onSuccess: () => void;
    selectedGuest: {
        id: number;
        guestName: string;
        roomNumber: string;
        roomtype: string;
        roomNumberRoman?: string;
    };
}

const TransferRoomFlow = ({ selectedGuest, onSuccess }: Props) => {
    const { rooms } = useRooms();
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    // Filter rooms to only show same type and available rooms
    const filteredRooms = (Array.isArray(rooms) ? rooms : []).filter((room) => {
        return (
            room.status === 'AVAIL' &&
            !room.isBooked &&
            !room.isOccupied &&
            Number(room.roomNumber) !== Number(selectedGuest.roomNumber) &&
            room.roomtype?.name === selectedGuest.roomtype
        );
    });

    const [formData, setFormData] = useState<TransferRoomFormData>({
        guestName: selectedGuest?.guestName || '',
        currentRoom:
            `${selectedGuest?.roomNumber}${showRoman && selectedGuest.roomNumberRoman ? ` (${selectedGuest.roomNumberRoman})` : ''}` ||
            '',
        currentRoomType: selectedGuest?.roomtype || '',
        newRoom: '',
    });
    const [loadingTransfer, setLoadingTransfer] = useState(false);
    const [, setError] = useState('');

    useEffect(() => {
        if (selectedGuest) {
            setFormData((prev) => ({
                ...prev,
                guestName: selectedGuest.guestName || '',
                currentRoom:
                    `${selectedGuest?.roomNumber}${showRoman && selectedGuest.roomNumberRoman ? ` (${selectedGuest.roomNumberRoman})` : ''}` ||
                    '',
                currentRoomType: selectedGuest.roomtype || '',
            }));
        }
    }, [selectedGuest, showRoman]);

    const handleInputChange = (
        field: keyof TransferRoomFormData,
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!selectedGuest || !formData.newRoom) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please select a room to transfer to"
                    type="error"
                />
            ));
            return;
        }

        try {
            setLoadingTransfer(true);

            const result = await transferRoom(
                selectedGuest.id,
                Number(formData.newRoom),
            );

            if (result.error) {
                setError(result.error);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={result.error}
                        type="error"
                    />
                ));
                return;
            }

            const selectedRoom = filteredRooms.find(
                (room) => room.id === Number(formData.newRoom),
            );

            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={`Successfully transferred guest ${selectedGuest.guestName} to room ${selectedRoom?.roomNumber}${showRoman && selectedRoom?.roomNumberRoman ? ` (${selectedRoom.roomNumberRoman})` : ''}`}
                    type="success"
                />
            ));
            mutate(`/guests/info/${selectedGuest.id}`);
            mutate('/rooms');
            mutate('/activity-log');
            onSuccess();
        } catch (err: any) {
            setError('Failed to transfer room. Please try again.');
            toast.custom(() => (
                <Toast title="Error!" description={err.message} type="error" />
            ));
        } finally {
            setLoadingTransfer(false);
        }
    };

    return (
        <>
            <div>
                <h1 className="text-xl font-semibold">Transfer Room</h1>
                <span className="text-sm text-gray-500">
                    Transfer a guest to a different room of the same type
                </span>
            </div>

            <div className="mt-6">
                <div className="space-y-4">
                    <InputField
                        id="guestName"
                        name="guestName"
                        label="Guest Name"
                        value={formData.guestName}
                        readOnly
                        required
                    />

                    <InputField
                        id="currentRoom"
                        name="currentRoom"
                        label="Current Room"
                        value={formData.currentRoom}
                        readOnly
                        placeholder="Select current room"
                    />

                    <InputField
                        id="currentRoomType"
                        name="currentRoomType"
                        label="Room Type"
                        value={formData.currentRoomType}
                        readOnly
                        placeholder="Room type"
                    />

                    {filteredRooms.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                No available rooms of the same type (
                                {selectedGuest.roomtype}) found.
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                To transfer to a different room type, please
                                checkout and create a new reservation.
                            </p>
                        </div>
                    ) : (
                        <SelectField
                            id="newRoom"
                            name="newRoom"
                            label="New Room"
                            value={formData.newRoom}
                            onValueChange={(value) =>
                                handleInputChange('newRoom', value)
                            }
                            options={filteredRooms.map((room) => {
                                return {
                                    label: `Room ${room.roomNumber}${showRoman && room.roomNumberRoman ? ` (${room.roomNumberRoman})` : ''} - ${room.roomtype?.name ?? 'Unassigned'}`,
                                    value: String(room.id),
                                };
                            })}
                            placeholder="Select new room"
                            required
                        />
                    )}
                </div>

                <div className="flex flex-col justify-between space-y-4 mt-6">
                    <Button
                        disabled={
                            loadingTransfer ||
                            !formData.newRoom ||
                            filteredRooms.length === 0
                        }
                        className="w-full bg-orion-blue hover:bg-orion-blue h-10"
                        onClick={handleSubmit}
                    >
                        {loadingTransfer && (
                            <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                        )}
                        Complete Transfer
                    </Button>
                </div>
            </div>
        </>
    );
};

export default TransferRoomFlow;
