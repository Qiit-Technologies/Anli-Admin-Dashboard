import { checkOutGuest } from '@/app/actions/checkOut';
import { getAllReservations } from '@/app/actions/reservation';
import SearchInput from '@/components/common/SearchInput';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import useHotel from '@/hooks/useHotel';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CheckoutGuestFlowProps {
    onClose: () => void;
}
const CancelGuestReservationFlow = ({ onClose }: CheckoutGuestFlowProps) => {
    const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
    const [guestList, setGuestList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;
    const [formData, setFormData] = useState<{
        status: 'GOOD' | 'BAD' | '';
        checkOutNote: string;
    }>({
        status: '',
        checkOutNote: '',
    });

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                const result = await getAllReservations();
                if (result && result.data) {
                    setGuestList(result.data);
                    console.log(result.data);
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGuestData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const filteredGuestList = !searchQuery
        ? []
        : guestList.filter((guest) => {
              const query = searchQuery;
              return (
                  guest.fullName.toLowerCase().includes(query) ||
                  guest.phoneNumber.toLowerCase().includes(query) ||
                  guest.email.toLowerCase().includes(query) ||
                  guest?.room?.roomNumber
                      .toString()
                      .toLowerCase()
                      .includes(query)
              );
          });

    const fields = [
        { label: 'Guest Name', value: selectedGuest?.fullName },
        { label: 'Guest email', value: selectedGuest?.email },
        { label: 'Guest phone number', value: selectedGuest?.phoneNumber },
        { label: 'Check-in Date', value: formatDate(selectedGuest?.startDate) },
        { label: 'Check-in Time', value: formatTime(selectedGuest?.startDate) },
        {
            label: 'Room Number',
            value: `${selectedGuest?.room?.roomNumber}${showRoman && selectedGuest?.room?.roomNumberRoman ? ` (${selectedGuest?.room?.roomNumberRoman})` : ''}`,
        },
        {
            label: 'Amount Paid',
            value: formatCurrency(selectedGuest?.amountPaid),
        },
        {
            label: 'Outstanding',
            value: formatCurrency(selectedGuest?.outstanding),
        },
    ];

    const handleSubmit = async (id: number) => {
        setError(null);
        setIsLoading(true);

        try {
            const response = await checkOutGuest(
                id,
                formData.status,
                formData.checkOutNote,
            );
            console.log(response);
            if (response) {
                if (response.message === 'Check Out successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));

                    onClose();
                } else if (
                    response.message ===
                    'No housekeepers available for this hotel'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Heads up!"
                            description="Guest was checked out successfully, but no housekeeper was assigned."
                            type="info"
                        />
                    ));
                    onClose();
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
            onClose();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <h1 className="font-semibold text-lg">Cancel Reservation</h1>
                <span className="text-sm text-muted-foreground">
                    Cancel a guest reservation
                </span>
            </div>
            <div className="mt-4">
                <SearchInput
                    aria-label="Search"
                    placeholder="Search by guest name, email, phone number, or booking ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <motion.div layout className="mt-2">
                <div className="mt-3">
                    {filteredGuestList.length > 0 &&
                        filteredGuestList.map((guest) => (
                            <div
                                key={guest.id}
                                className="flex items-center hover:bg-gray-100 justify-between gap-2 p-2 border-b hover:border-b-transparent border-gray-200 cursor-pointer"
                                onClick={() => {
                                    setSelectedGuest(guest);
                                    setSearchQuery('');
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">
                                        {guest.fullName} - {guest.roomNumber}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {guest.email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        {guest.phoneNumber}
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </motion.div>
            {selectedGuest && (
                <motion.div
                    animate={{
                        opacity: selectedGuest ? 1 : 0,
                        height: selectedGuest ? 'auto' : 0,
                    }}
                    className="bg-gray-100 border mt-4 p-4 rounded-lg flex flex-col gap-4 "
                >
                    {fields.map((field, index) => (
                        <div className="grid grid-cols-2 text-sm" key={index}>
                            <span className="text-gray-500 capitalize">
                                {field?.label}
                            </span>
                            <span className="text-gray-600">
                                {field?.value}
                            </span>
                        </div>
                    ))}
                </motion.div>
            )}
            {selectedGuest && (
                <motion.div className="p-4 border mt-4 rounded-lg" layout>
                    <div className="w-full space-y-2">
                        <span className="text-base text-muted-foreground">
                            Status
                        </span>
                        <RadioGroup
                            className="flex w-full items-center"
                            defaultValue="option-one"
                            onValueChange={(value) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    status: value === 'good' ? 'GOOD' : 'BAD',
                                }));
                            }}
                        >
                            <div className="flex border w-full px-4 p-2 rounded-lg items-center space-x-2">
                                <RadioGroupItem value="good" id="good" />
                                <Label className="m-0" htmlFor="good">
                                    Good
                                </Label>
                            </div>
                            <div className="flex border w-full px-4 p-2 rounded-lg items-center space-x-2">
                                <RadioGroupItem value="bad" id="bad" />
                                <Label className="m-0" htmlFor="bad">
                                    Bad
                                </Label>
                            </div>
                        </RadioGroup>
                        {formData.status === 'BAD' && (
                            <div className="w-full mt-4">
                                <Label
                                    htmlFor="checkOutNote"
                                    className="sr-only text-base text-muted-foreground"
                                >
                                    Checkout Note
                                </Label>
                                <textarea
                                    id="checkOutNote"
                                    className="w-full border rounded-lg p-2 mt-2"
                                    placeholder="Enter checkout note"
                                    value={formData.checkOutNote}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            checkOutNote: e.target.value,
                                        }));
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="w-full mt-4 flex items-center  gap-2">
                        <Button
                            onClick={onClose}
                            variant={'outline'}
                            className="border-orion-blue w-full text-orion-blue"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                isLoading ||
                                !formData.status ||
                                (formData.status === 'BAD' &&
                                    !formData.checkOutNote)
                            }
                            onClick={() => handleSubmit(selectedGuest.id)}
                            className="bg-orion-blue w-full hover:bg-orion-blue"
                        >
                            {isLoading ? (
                                <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                            ) : null}
                            {isLoading ? 'Loading...' : 'Checkout'}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CancelGuestReservationFlow;
