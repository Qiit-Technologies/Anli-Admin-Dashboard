import { checkRoomAvailability } from '@/app/actions/guest';
import {
    extendStay,
    getCheckedInGuests,
    getExtendStayQuote,
} from '@/app/actions/reservation';
import { getRoomByHotelId } from '@/app/actions/room';
import { InputField, SelectField } from '@/components/common/Form';
import SearchInput from '@/components/common/SearchInput';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { UnifiedAPActivation } from '../UnifiedAPActivation';
import useHotel from '@/hooks/useHotel';
import { formatCurrency } from '@/lib/utils';
import { getNights } from '@/lib/helpers';
import { motion } from 'framer-motion';
import { useRouter } from 'nextjs-toploader/app';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

const getPureDateString = (dateInput?: string | Date | null) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
        return dateInput.trim();
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getNextCheckoutDateString = (endDateStr?: string | Date | null) => {
    const pure = getPureDateString(endDateStr);
    if (!pure) return undefined;
    const [y, m, d] = pure.split('-').map(Number);
    const dateUtc = new Date(Date.UTC(y, m - 1, d + 1));
    const year = dateUtc.getUTCFullYear();
    const month = String(dateUtc.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateUtc.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface ExtendStayProps {
    onClose?: () => void;
    guest?: any;
}
function ExtendStayFlow({ onClose, guest }: ExtendStayProps) {
    const [selectedGuest, setSelectedGuest] = useState<any | null>(
        guest || null,
    );
    const [guestList, setGuestList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [rooms, setRooms] = useState<any[]>([]);
    const router = useRouter();
    const { organization } = useHotel();
    const showRoman = organization?.id === 10;

    const formatDateTime = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return date.toLocaleString();
    };

    const [formData, setFormData] = useState({
        checkoutDate: '',
        alternativeRoom: '',
    });
    const [quote, setQuote] = useState<any | null>(null);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);

    const [isUpdatedBillOpen, setIsUpdatedBillOpen] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);

    // Account Payable state
    const [selectedAPGuest, setSelectedAPGuest] = useState<any | null>(null);
    const [creditToApply, setCreditToApply] = useState<number>(0);

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                const result = await getCheckedInGuests();
                if (result && result.data) {
                    setGuestList(result.data);
                    setIsAvailable(true);

                    if (guest && !selectedGuest) {
                        const matchedGuest = result.data.find(
                            (g: any) => g.id === guest.id,
                        );
                        if (matchedGuest) {
                            setSelectedGuest(matchedGuest);
                        }
                    }
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        const fetchRooms = async () => {
            try {
                const result = await getRoomByHotelId();
                if (result && result.data) {
                    setRooms(Array.isArray(result.data) ? result.data : []);
                }
            } catch (err: any) {
                console.error('Error fetching rooms:', err);
            }
        };

        fetchGuestData();
        fetchRooms();
    }, [guest, selectedGuest]);

    const fetchQuote = async () => {
        if (!selectedGuest?.id || !formData.checkoutDate) return;

        // Prevent extending to the current checkout date or earlier.
        if (
            selectedGuest.endDate &&
            formData.checkoutDate <= getPureDateString(selectedGuest.endDate)
        ) {
            toast.custom(() => (
                <Toast
                    title="Invalid Date"
                    description="New checkout date must be later than the current checkout date."
                    type="error"
                />
            ));
            setFormData((prev) => ({ ...prev, checkoutDate: '' }));
            setQuote(null);
            setIsFetchingQuote(false);
            return;
        }

        setIsFetchingQuote(true);

        const fd = new FormData();
        fd.append('guestId', selectedGuest.id);
        fd.append('newCheckoutDate', formData.checkoutDate);
        fd.append('newCheckoutTime', '12:00'); // Default to noon
        if (formData.alternativeRoom)
            fd.append('alternativeRoom', formData.alternativeRoom);
        if (creditToApply > 0) {
            fd.append('creditToApply', creditToApply.toString());
            fd.append('guestProfileId', selectedAPGuest?.guestProfileId);
        }

        const result = await getExtendStayQuote(fd);
        if (result?.data) setQuote(result.data);
        setIsFetchingQuote(false);
    };

    useEffect(() => {
        const t = setTimeout(() => {
            fetchQuote();
        }, 300);
        return () => clearTimeout(t);
    }, [
        selectedGuest?.id,
        formData.checkoutDate,
        formData.alternativeRoom,
        creditToApply,
        selectedAPGuest?.guestProfileId,
    ]);

    // Auto-set credit to apply when quote or selectedAPGuest changes
    useEffect(() => {
        if (quote && selectedAPGuest) {
            const additionalCharge = quote.calculatedAdditionalCharge || 0;
            const availableCredit = selectedAPGuest.creditBalance || 0;
            const toApply = Math.min(additionalCharge, availableCredit);
            setCreditToApply(toApply);
        }
    }, [quote, selectedAPGuest]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const filteredGuestList = !searchQuery
        ? []
        : guestList.filter((guest) => {
              const query = searchQuery.toLowerCase();
              return (
                  guest.fullName?.toLowerCase().includes(query) ||
                  guest.phoneNumber?.toLowerCase().includes(query) ||
                  guest.email?.toLowerCase().includes(query)
              );
          });

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'paymentMadeForExtension' ? Number(value) : value,
        }));
    };

    const handleSelectChange = (value: string, field: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAPGuestSelect = (apGuest: any) => {
        setSelectedAPGuest(apGuest);
        const additionalCharge = quote?.calculatedAdditionalCharge || 0;
        const availableCredit = apGuest.creditBalance || 0;
        // Auto-apply maximum possible credit up to additional charge
        const toApply = Math.min(additionalCharge, availableCredit);
        setCreditToApply(toApply);
    };

    const handleCheckAvailability = async () => {
        setLoading(true);
        setError(null);

        if (!formData.checkoutDate) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please select a new checkout date."
                    type="error"
                />
            ));
            setLoading(false);
            return;
        }

        if (
            selectedGuest?.endDate &&
            formData.checkoutDate <= getPureDateString(selectedGuest.endDate)
        ) {
            toast.custom(() => (
                <Toast
                    title="Invalid Date"
                    description="New checkout date must be later than the current checkout date."
                    type="error"
                />
            ));
            setLoading(false);
            return;
        }

        try {
            const newEndDate = `${formData.checkoutDate}T12:00`;
            const result = await checkRoomAvailability({
                roomNumber: selectedGuest?.room?.roomNumber,
                roomType: selectedGuest.roomType.id,
                guestId: selectedGuest.id,
                currentEndDate: selectedGuest.endDate,
                newEndDate,
            });

            if (result.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={result.error}
                        type="error"
                    />
                ));
            } else if (result.data.available) {
                setIsAvailable(true);
                toast.custom(() => (
                    <Toast
                        title="Available!"
                        description="Room is available for extension."
                        type="success"
                    />
                ));
            } else {
                setIsAvailable(false);
                toast.custom(() => (
                    <Toast
                        title="Not Available"
                        description="Room is not available for the selected extended time."
                        type="error"
                    />
                ));
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            setIsAvailable(false);
        } finally {
            setLoading(false);
        }
    };

    const handleExtendStay = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!selectedGuest?.id || !formData.checkoutDate) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please select a guest and provide a checkout date."
                    type="error"
                />
            ));
            setLoading(false);
            return;
        }

        const submitData = new FormData();
        submitData.append('guestId', selectedGuest.id);
        submitData.append('newCheckoutDate', formData.checkoutDate);
        submitData.append('newCheckoutTime', '12:00');
        submitData.append('alternativeRoom', formData.alternativeRoom || '');
        if (creditToApply > 0) {
            submitData.append('creditToApply', creditToApply.toString());
            submitData.append(
                'guestProfileId',
                selectedAPGuest?.guestProfileId,
            );
        }

        try {
            const response = await extendStay(submitData);
            if (response) {
                if (response.message === 'Stay extended successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    mutate('/activity-log');
                    mutate('/rooms');
                    mutate('/hotelRooms');
                    mutate('/hotelGuests');
                    mutate('/accounts/receivables');
                    mutate('/accounts/payables');
                    if (selectedGuest?.id) {
                        mutate(`/guests/info/${selectedGuest.id}`);
                        mutate(
                            `/guests/bill-audit-for-guest?guestId=${selectedGuest.id}`,
                        );
                        mutate(
                            `/front-office/guest-management/profile/${selectedGuest.id}`,
                        );
                    }
                    mutate('list-data');
                    onClose?.();
                    router.refresh();
                    setSelectedGuest(null);
                    setFormData({
                        checkoutDate: '',
                        alternativeRoom: '',
                    });
                    setSelectedAPGuest(null);
                    setCreditToApply(0);
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const guestFields = selectedGuest
        ? [
              { label: 'Guest Name', value: selectedGuest?.fullName },
              {
                  label: 'Room No',
                  value: `${selectedGuest?.roomType?.name || 'Standard'}-${selectedGuest?.room?.roomNumber}${showRoman && selectedGuest?.room?.roomNumberRoman ? ` (${selectedGuest?.room?.roomNumberRoman})` : ''}`,
              },
              { label: 'Reservation No', value: selectedGuest?.id },
              {
                  label: 'Check-in Date',
                  value: selectedGuest?.startDate
                      ? new Date(selectedGuest.startDate).toLocaleDateString(
                            'en-US',
                            {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            },
                        )
                      : 'Not available',
              },
              {
                  label: 'Current Check-out Date',
                  value: selectedGuest?.endDate
                      ? new Date(selectedGuest.endDate).toLocaleDateString(
                            'en-US',
                            {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            },
                        )
                      : 'Not available',
              },
              {
                  label: 'Nights Stayed',
                  value:
                      selectedGuest?.startDate && selectedGuest?.endDate
                          ? getNights(
                                selectedGuest.startDate,
                                selectedGuest.endDate,
                            )
                          : 0,
              },
          ]
        : [];

    return (
        <div>
            <div>
                <h1 className="font-semibold text-lg">Extend Guest Stay</h1>
                <span className="text-sm text-muted-foreground">
                    Extend guest stay by adding a new booking for the same
                    guest.
                </span>
            </div>
            {!guest && (
                <div className="mt-4">
                    <SearchInput
                        aria-label="Search"
                        placeholder="Search by guest name, email, phone number, or booking ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}
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
                                    // Check if this guest has an account payable balance
                                    if (
                                        guest.guestProfile?.creditAccounts
                                            ?.length > 0
                                    ) {
                                        const guestBalance =
                                            guest.guestProfile.creditAccounts[0]
                                                .balance || 0;
                                        if (guestBalance > 0) {
                                            setSelectedAPGuest({
                                                fullName: guest.fullName,
                                                email: guest.email,
                                                phoneNumber: guest.phoneNumber,
                                                creditBalance: guestBalance,
                                                guestProfileId:
                                                    guest.guestProfile.id,
                                            });
                                        }
                                    } else {
                                        setSelectedAPGuest(null);
                                        setCreditToApply(0);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">
                                        {guest.fullName}
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
                <form onSubmit={handleExtendStay}>
                    <div className="bg-emerald-100 mt-4 p-4 rounded-lg flex flex-col gap-2">
                        <h3 className="font-semibold mb-2">
                            Guest Information:
                        </h3>
                        {guestFields.map((field, index) => (
                            <div
                                className="grid grid-cols-2 text-sm"
                                key={index}
                            >
                                <span className="text-gray-500 capitalize">
                                    {field?.label}
                                </span>
                                <span className="text-gray-600">
                                    {field?.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Extend Stay:</h3>
                        <div className="flex flex-col gap-4">
                            <InputField
                                name="checkoutDate"
                                id="checkoutDate"
                                aria-label="New Check-out Date"
                                label="New Check-out Date"
                                type="date"
                                value={formData.checkoutDate}
                                onChange={handleInputChange}
                                min={
                                    selectedGuest?.endDate
                                        ? getNextCheckoutDateString(
                                              selectedGuest.endDate,
                                          )
                                        : undefined
                                }
                            />
                            <InputField
                                id="additionalNights"
                                name="additionalNights"
                                aria-label="Additional Nights"
                                label="Additional Nights"
                                type="number"
                                className="border ring-1"
                                value={
                                    quote
                                        ? String(quote.additionalNights ?? 0)
                                        : 0
                                }
                                readOnly
                            />

                            {quote?.calculatedAdditionalCharge > 0 && (
                                <div className="border border-gray-200 rounded-lg p-4 space-y-4 mt-4">
                                    <h3 className="font-semibold text-gray-900">
                                        Apply Account Payable (Optional)
                                    </h3>

                                    {!selectedAPGuest ? (
                                        <UnifiedAPActivation
                                            onSelect={handleAPGuestSelect}
                                        />
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-green-50 p-3 rounded-md border border-green-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-green-900">
                                                            Selected Guest for
                                                            Payment
                                                        </p>
                                                        <p className="text-sm text-green-800">
                                                            {
                                                                selectedAPGuest.fullName
                                                            }
                                                        </p>
                                                        <p className="text-xs text-green-600 mt-1">
                                                            Available Balance: ₦
                                                            {selectedAPGuest.creditBalance?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedAPGuest(
                                                                null,
                                                            );
                                                            setCreditToApply(0);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Amount to Apply
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                        ₦
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={creditToApply}
                                                        onChange={(e) => {
                                                            const val = Number(
                                                                e.target.value,
                                                            );
                                                            // Ensure we don't exceed available balance or additional charge
                                                            const maxApply =
                                                                Math.min(
                                                                    selectedAPGuest.creditBalance ||
                                                                        0,
                                                                    quote.calculatedAdditionalCharge,
                                                                );
                                                            if (
                                                                val <= maxApply
                                                            ) {
                                                                setCreditToApply(
                                                                    val,
                                                                );
                                                            }
                                                        }}
                                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orion-blue focus:border-transparent"
                                                        max={Math.min(
                                                            selectedAPGuest.creditBalance ||
                                                                0,
                                                            quote.calculatedAdditionalCharge,
                                                        )}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Max applicable: ₦
                                                    {Math.min(
                                                        selectedAPGuest.creditBalance ||
                                                            0,
                                                        quote.calculatedAdditionalCharge,
                                                    )?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {formData.checkoutDate && (
                                <Button
                                    type="button"
                                    onClick={handleCheckAvailability}
                                    className="mt-2 px-4 py-2 bg-orion-blue h-12 text-white rounded-lg hover:bg-orion-blue"
                                >
                                    Check Availability
                                </Button>
                            )}

                            {!isAvailable && (
                                <SelectField
                                    id="alternativeRoom"
                                    name="alternativeRoom"
                                    aria-label="Alternative Room"
                                    label="Alternative Room"
                                    placeholder="Select a room"
                                    value={formData.alternativeRoom}
                                    onValueChange={(value) =>
                                        handleSelectChange(
                                            value,
                                            'alternativeRoom',
                                        )
                                    }
                                    options={(Array.isArray(rooms) ? rooms : [])
                                        .filter(
                                            (room) =>
                                                !room.isBooked &&
                                                !room.isOccupied,
                                        )
                                        .map((room) => ({
                                            value: String(room.roomNumber),
                                            label: String(room.roomNumber),
                                        }))}
                                />
                            )}
                        </div>
                    </div>

                    {formData.checkoutDate && (
                        <>
                            <div className="p-4 border mt-4 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsUpdatedBillOpen(!isUpdatedBillOpen)
                                    }
                                    className="w-full text-left font-semibold"
                                >
                                    Updated Bill Summary:
                                </button>
                                {isUpdatedBillOpen && (
                                    <div className="mt-2 space-y-2">
                                        {isFetchingQuote ? (
                                            <div className="text-sm text-muted-foreground">
                                                Calculating quote…
                                            </div>
                                        ) : quote ? (
                                            <>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Current Total Bill
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatCurrency(
                                                            quote.currentCharges,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Additional Nights
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {quote.additionalNights}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Nightly Rate
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatCurrency(
                                                            quote.nightlyRate,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Additional Charges
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatCurrency(
                                                            quote.calculatedAdditionalCharge,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Amount Paid (Extension)
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatCurrency(
                                                            quote.paymentMadeForExtension,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Projected Amount Paid
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatCurrency(
                                                            quote.projectedAmountPaid,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Projected Outstanding
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatCurrency(
                                                            quote.projectedOutstanding,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        New Checkout
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {formatDateTime(
                                                            quote.newCheckoutDateTime,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Room
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {
                                                            quote.roomNumberPreview
                                                        }
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 text-sm">
                                                    <span className="text-gray-500">
                                                        Payment Option
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {quote.paymentOption}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                Enter date/time to see the
                                                quote.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex items-center mt-4 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSelectedGuest(null);
                                setFormData({
                                    checkoutDate: '',
                                    alternativeRoom: '',
                                });
                            }}
                            className="border-orion-blue h-10 text-orion-blue w-full px-4 py-2 rounded-md hover:bg-gray-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orion-blue w-full h-10 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Confirm Extension
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ExtendStayFlow;
