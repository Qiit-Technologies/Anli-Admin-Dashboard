'use client';
import { getCheckedInGuests } from '@/app/actions/reservation';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import useHotel from '@/hooks/useHotel';
import { LoaderCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TransferRoomFlow from './TransferRoom';

interface TransferRoomSelectorProps {
    onClose?: () => void;
}

const TransferRoomSelector = ({ onClose }: TransferRoomSelectorProps) => {
    const [guests, setGuests] = useState<any[]>([]);
    const [filteredGuests, setFilteredGuests] = useState<any[]>([]);
    const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingGuests, setLoadingGuests] = useState(true);
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                setLoadingGuests(true);
                const result = await getCheckedInGuests();
                if (result && result.data) {
                    setGuests(result.data);
                    setFilteredGuests(result.data);
                }
            } catch (error: any) {
                console.error('Error fetching guests:', error);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Failed to fetch checked-in guests"
                        type="error"
                    />
                ));
            } finally {
                setLoadingGuests(false);
            }
        };

        fetchGuests();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredGuests(guests);
            return;
        }

        const filtered = guests.filter((guest: any) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                guest.fullName?.toLowerCase().includes(searchLower) ||
                guest.id?.toString().includes(searchLower) ||
                guest.roomNumber?.toString().includes(searchLower)
            );
        });

        setFilteredGuests(filtered);
    }, [searchQuery, guests]);

    const handleGuestSelect = (guest: any) => {
        setSelectedGuest(guest);
    };

    const handleTransferSuccess = () => {
        onClose?.();
    };

    const handleBackToGuestList = () => {
        setSelectedGuest(null);
    };

    if (selectedGuest) {
        return (
            <div>
                <TransferRoomFlow
                    selectedGuest={{
                        id: selectedGuest.id,
                        guestName: selectedGuest.fullName,
                        roomNumber: selectedGuest.roomNumber?.toString(),
                        roomtype: selectedGuest.roomType?.name,
                        roomNumberRoman: showRoman
                            ? selectedGuest.room?.roomNumberRoman
                            : '',
                    }}
                    onSuccess={handleTransferSuccess}
                />
                <div className="mt-4">
                    <Button
                        className="border-orion-blue text-orion-blue w-full h-10"
                        variant="outline"
                        onClick={handleBackToGuestList}
                    >
                        Back to Guest List
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div>
                <h1 className="text-xl font-semibold">Transfer Room</h1>
                <span className="text-sm text-gray-500">
                    Select a guest to transfer to a different room
                </span>
            </div>

            <div className="mt-6">
                <h1 className="mb-4 font-semibold">Select Guest</h1>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by guest name, ID, or room number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orion-blue focus:border-transparent"
                        />
                    </div>

                    {loadingGuests ? (
                        <div className="flex items-center justify-center py-8">
                            <LoaderCircle className="animate-spin w-6 h-6" />
                            <span className="ml-2">Loading guests...</span>
                        </div>
                    ) : filteredGuests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery
                                ? 'No guests found matching your search.'
                                : 'No checked-in guests available for transfer.'}
                        </div>
                    ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {filteredGuests.map((guest: any) => (
                                <div
                                    key={guest.id}
                                    onClick={() => handleGuestSelect(guest)}
                                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-orion-blue hover:bg-orion-blue/5 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {guest.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Guest #{guest.id}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Room {guest.roomNumber} (
                                                {guest.roomType?.name})
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {guest.startDate
                                                    ? new Date(
                                                          guest.startDate,
                                                      ).toLocaleDateString()
                                                    : 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Checked in
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-between space-y-4 mt-6">
                    <Button
                        className="border-orion-blue text-orion-blue w-full h-10"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </>
    );
};

export default TransferRoomSelector;
