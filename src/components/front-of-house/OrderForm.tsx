'use client';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { findPastGuests } from '@/app/actions/order';
import { getActiveGuestsForRoomPosting } from '@/app/actions/room';
import { getStaff } from '@/app/actions/staff';
import { InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/context/useUser';
import useOrderStore from '@/store/useOrder';
import useStaffAuth from '@/store/useStaffAuth';
import { Staff } from '@/types/staff.types';
import React, { useMemo, useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { SearchSelectAlternative } from '../common/SearchSelectAlternative';
import { ScopedOrder } from './types';

export interface OrderFormData {
    waiter: {
        id: number;
        fullName: string;
        email: string;
        roleId: number;
    };
    room?: {
        id: number;
        roomNumber: string;
    };
    guestName: string;
    guestEmail: string;
    phoneNumber: string;
    address?: string;
    remark?: string;
    timeExpected?: string;
    dineInArea?: {
        id: number;
        name: string;
    } | null;
}

interface OrderFormProps {
    variant?: 'room' | 'away' | 'delivery' | 'in-house';
    onSubmit: (data: OrderFormData) => void;
    mode?: 'add' | 'edit';
    order?: ScopedOrder;
    initialData?: Partial<OrderFormData>;
}

interface Guest {
    id: number;
    name: string;
    email: string;
    buisnessName: string;
    phonenumber: string;
}

const OrderForm = ({
    onSubmit,
    variant = 'in-house',
    mode = 'add',
    order,
    initialData,
}: OrderFormProps) => {
    const { user } = useUser();
    const { authorizedStaff, fetchAuthorizedStaff } = useStaffAuth();
    const createInitialFormData = () => ({
        waiter: {
            id: 1,
            fullName: 'John Smith',
            email: 'test@email.com',
            roleId: 0,
        },
        room: {
            id: variant === 'room' ? 0 : 1,
            roomNumber: variant === 'room' ? '' : '101',
        },
        guestName: initialData?.guestName || '',
        guestEmail: initialData?.guestEmail || '',
        phoneNumber: initialData?.phoneNumber || '',
        ...(variant === 'away' || variant === 'delivery'
            ? { address: initialData?.address || '' }
            : {}),
        dineInArea: initialData?.dineInArea || null,
    });

    const createInitialOrder = (): OrderFormData => {
        if (mode === 'add') {
            return createInitialFormData();
        } else {
            return {
                waiter: {
                    id: order?.waiter?.id as number,
                    fullName: order?.waiter?.fullName as string,
                    email: order?.waiter?.email as string,
                    roleId: order?.waiter?.roleId as number,
                },
                room: {
                    id: order?.room?.id as number,
                    roomNumber: String(order?.room?.roomNumber) ?? '0',
                },
                guestName: order?.guestName as string,
                guestEmail: order?.guestEmail as string,
                phoneNumber: order?.guestPhoneNumber as string,
                address: order?.address as string,
                dineInArea: order?.dineInArea,
            };
        }
    };

    const [formData, setFormData] = useState(createInitialOrder());
    const { clearOrder } = useOrderStore();
    const [staffs, setStaff] = useState<Staff[]>([]);
    const [guest, setGuest] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isStaffLoading, setIsStaffLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [selectedWaiter, setSelectedWaiter] = useState<number | null>(
        mode === 'edit' ? (order?.waiter?.id ?? null) : null,
    );
    const [selectedGuest, setSelectedGuest] = useState<Guest>();
    const [selectedDineArea, setSelectedDineArea] = useState<string>(
        initialData?.dineInArea?.id ? String(initialData.dineInArea.id) : '',
    );

    const { data: dineAreasResponse, isLoading: isDineAreasLoading } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );
    const dineAreasData = dineAreasResponse?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            if (variant !== 'in-house' && !selectedDineArea) {
                alert('Please select a Dine Area before proceeding.');
                setIsSubmitting(false);
                return;
            }

            // Auto-generate guest name if not provided
            const finalFormData = { ...formData };
            if (!finalFormData.guestName?.trim()) {
                const dateStr = new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                });
                finalFormData.guestName = `Guest-${dateStr}`;
            }

            const selectedAreaObj = dineAreasData.find(
                (area: any) => String(area.id) === selectedDineArea,
            );
            finalFormData.dineInArea = selectedAreaObj
                ? { id: parseInt(selectedDineArea), name: selectedAreaObj.name }
                : null;

            onSubmit(finalFormData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (
        field: keyof OrderFormData,
        value: string | number,
    ) => {
        if (field === 'waiter') {
            updateWaiterField(value as number);
        } else if (field === 'room') {
            updateRoomField(value as string);
        } else {
            updateStandardField(field, value);
        }
    };

    const updateWaiterField = (waiterId: number) => {
        const selectedStaff = staffs?.find((staff) => staff.id === waiterId);
        if (selectedStaff) {
            setFormData({
                ...formData,
                waiter: {
                    id: selectedStaff.id,
                    fullName: selectedStaff.fullName,
                    email: selectedStaff.email,
                    roleId: selectedStaff.roles.id,
                },
            });
        }
    };

    const updateRoomField = (roomIdOrNumber: string) => {
        const selected = inHouseRoomOptions.find(
            (opt) =>
                String(opt.room.id) === String(roomIdOrNumber) ||
                String(opt.room.roomNumber) === String(roomIdOrNumber),
        );
        if (selected) {
            const g = selected.primaryGuest;
            setFormData({
                ...formData,
                room: {
                    id: selected.room.id,
                    roomNumber: String(selected.room.roomNumber),
                },
                guestName: g.fullName || formData.guestName,
                guestEmail: g.email || formData.guestEmail,
                phoneNumber: g.phoneNumber || formData.phoneNumber,
            });
        } else {
            setFormData({
                ...formData,
                room: {
                    id: 0,
                    roomNumber: roomIdOrNumber.toString(),
                },
            });
        }
    };

    const updateStandardField = (
        field: keyof OrderFormData,
        value: string | number,
    ) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const selectGuest = (guest: Guest) => {
        setSelectedGuest(guest);
        setFormData({
            ...formData,
            guestName: guest.name,
            guestEmail: guest.email,
        });
    };

    const getButtonText = () => {
        if (isSubmitting) {
            return mode === 'add' ? 'Creating...' : 'Updating...';
        }
        return mode === 'add' ? 'Create Order' : 'Update Order';
    };

    useEffect(() => {
        if (mode === 'edit' && order?.waiter?.id) {
            setSelectedWaiter(order.waiter.id);
        }
    }, [mode, order]);

    useEffect(() => {
        fetchAuthorizedStaff(user);
        fetchStaffData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (authorizedStaff && mode === 'add' && !selectedWaiter) {
            setSelectedWaiter(authorizedStaff.id);
            setFormData((prev) => ({
                ...prev,
                waiter: {
                    id: authorizedStaff.id,
                    fullName: authorizedStaff.fullName,
                    email: authorizedStaff.email,
                    roleId: authorizedStaff.roles.id,
                },
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authorizedStaff, mode]);

    const { data: inHouseRoomOpts = [], isLoading: loadingInHouseRooms } =
        useSWR(
            variant === 'room' ? 'rooms-in-house-for-charges' : null,
            getActiveGuestsForRoomPosting,
        );

    const inHouseRoomOptions = useMemo(
        () => inHouseRoomOpts,
        [inHouseRoomOpts],
    );

    const fetchStaffData = async () => {
        setIsStaffLoading(true);
        try {
            const response = (await getStaff(1)) as any;
            setStaff(response.data ?? []);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setError(err as Error);
            setStaff([]);
        } finally {
            setIsStaffLoading(false);
        }
    };

    const fetchGuestData = async () => {
        setIsLoading(true);
        try {
            const response = await findPastGuests();
            setGuest(response.data);
        } catch (err) {
            console.error('Error fetching guests:', err);
            setError(err as Error);
            setGuest([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        mutate('rooms-in-house-for-charges');
        fetchGuestData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variant]);

    useEffect(() => {
        const handleFocus = () => {
            if (variant === 'room') {
                mutate('rooms-in-house-for-charges');
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [variant]);

    if (error) {
        return (
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Error</h2>
                <p className="text-gray-500">
                    An error occurred while loading the form. Please try again
                    later.
                </p>
            </div>
        );
    }
    const renderVariantFields = () => {
        switch (variant) {
            case 'room':
                return (
                    <>
                        {inHouseRoomOptions?.length > 0 ? (
                            <SearchSelectAlternative
                                id="room"
                                label="Room (in-house guest)"
                                name="room"
                                placeholder="Select room – guest"
                                items={inHouseRoomOptions}
                                isLoading={loadingInHouseRooms}
                                value={
                                    inHouseRoomOptions.find(
                                        (opt) =>
                                            String(opt.room.id) ===
                                            (formData.room?.id
                                                ? String(formData.room.id)
                                                : ''),
                                    ) || null
                                }
                                className="w-full min-w-0 bg-gray-50"
                                onChange={(opt) =>
                                    handleInputChange(
                                        'room',
                                        String(opt.room.id),
                                    )
                                }
                                displayValue={(opt) => opt.displayLabel}
                            />
                        ) : (
                            <div className="text-amber-700 text-sm">
                                No checked-in guests with rooms to charge.
                                Check in a guest at Front Office first.
                            </div>
                        )}
                    </>
                );
            case 'away':
            case 'delivery':
                return (
                    <>
                        <SearchSelectAlternative
                            id="guest"
                            label="Guest"
                            name="guest"
                            placeholder="Select a Guest"
                            items={guest}
                            isLoading={isLoading}
                            value={selectedGuest || null}
                            className="w-full min-w-0 bg-gray-50"
                            onChange={(guest) => selectGuest(guest as Guest)}
                            displayValue={(g: {
                                name: string;
                                email: string;
                            }) => g?.name}
                        />

                        <InputField
                            id="address"
                            name="address"
                            label="Address"
                            type="text"
                            placeholder="Enter address"
                            value={formData.address}
                            onChange={(e) =>
                                handleInputChange('address', e.target.value)
                            }
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
                <SearchSelectAlternative
                    id="waiter"
                    label="Waiter"
                    name="waiter"
                    placeholder="Select staff..."
                    items={staffs}
                    isLoading={isStaffLoading}
                    value={
                        (selectedWaiter
                            ? staffs?.find(
                                  (staff) => staff.id === selectedWaiter,
                              )
                            : null) as Staff
                    }
                    className="w-full min-w-0 bg-gray-50"
                    onChange={(staff) => {
                        if (staff) {
                            setSelectedWaiter(staff.id);
                            handleInputChange('waiter', staff.id);
                        }
                    }}
                    displayValue={(s: Staff) => s?.fullName}
                />

                {variant !== 'in-house' && (
                    <div className="flex flex-col gap-2 w-full mt-2">
                        <label className="text-sm font-medium">
                            Select Dine Area{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={selectedDineArea}
                            onValueChange={setSelectedDineArea}
                            required
                        >
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select a Dine Area" />
                            </SelectTrigger>
                            <SelectContent>
                                {isDineAreasLoading ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        Loading...
                                    </div>
                                ) : (
                                    dineAreasData.map((area: any) => (
                                        <SelectItem
                                            key={area.id}
                                            value={String(area.id)}
                                        >
                                            {area.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {renderVariantFields()}

                <InputField
                    id="guestName"
                    name="guestName"
                    label="Guest Name"
                    type="text"
                    placeholder="Enter guest name"
                    value={formData.guestName ?? selectedGuest?.name}
                    onChange={(e) =>
                        handleInputChange('guestName', e.target.value)
                    }
                // required - Guest name is now optional
                />

                <InputField
                    id="guestEmail"
                    name="guestEmail"
                    label="Guest Email"
                    type="email"
                    placeholder="Enter guest email"
                    value={formData.guestEmail ?? selectedGuest?.email}
                    onChange={(e) =>
                        handleInputChange('guestEmail', e.target.value)
                    }
                />

                <InputField
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber ?? selectedGuest?.phonenumber}
                    onChange={(e) =>
                        handleInputChange('phoneNumber', e.target.value)
                    }
                    required={variant === 'delivery' || variant === 'away'}
                />
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        !selectedWaiter ||
                        (variant === 'room' && !selectedDineArea) ||
                        (variant === 'room' &&
                            (!formData.room?.id || !inHouseRoomOptions.length))
                    }
                    className="flex-1 h-12 bg-orion-blue text-white hover:bg-orion-blue/90"
                >
                    {getButtonText()}
                </Button>
            </div>
        </form>
    );
};

export default OrderForm;
