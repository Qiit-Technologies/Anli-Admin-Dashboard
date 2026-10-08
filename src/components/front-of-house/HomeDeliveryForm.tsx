import { getDineInAreas } from '@/app/actions/back-of-house';
import { findPastGuests } from '@/app/actions/order';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { useUser } from '@/context/useUser';
import useOrderStore from '@/store/useOrder';
import useStaffAuth from '@/store/useStaffAuth';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';
import { InputField } from '../common/Form';
import PageWrapper from '../common/PageWrapper';
import { SearchSelectAlternative } from '../common/SearchSelectAlternative';
import CustomItemTable from '../common/table/CustomItemTable';
import { TimePicker } from '../TimePicker';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { OrderFormData } from './OrderForm';
import { guestOrderHistoryColumns } from './tables/columns/GuestOrderHistory';

interface Guest {
    id: number;
    name: string;
    phonenumber: string;
    email: string;
    address: string;
    pastOrders: any[];
}

const HomeDeliveryForm = ({
    onSubmit,
    goBack,
}: {
    onSubmit: () => void;
    goBack: () => void;
}) => {
    const [formData, setFormData] = useState<OrderFormData>({
        waiter: {
            id: 1,
            fullName: 'John Smith',
            email: 'test@email.com',
            roleId: 0,
        },
        guestName: '',
        address: '',
        guestEmail: '',
        phoneNumber: '',
        remark: '',
        timeExpected: '',
    });
    const { order, setOrder, clearOrder } = useOrderStore();
    const [selectedGuest, setSelectedGuest] = useState<Guest>();
    const [guest, setGuest] = useState<any[]>([]);
    const [selectedDineArea, setSelectedDineArea] = useState<string>(
        order?.dineInArea?.id ? String(order.dineInArea.id) : '',
    );
    const { user } = useUser();
    const { authorizedStaff, fetchAuthorizedStaff } = useStaffAuth();

    const { data: dineInAreas, isLoading: isDineAreasLoading } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );
    const dineAreasData = dineInAreas?.data || [];

    const fetchGuestData = async () => {
        try {
            const response = await findPastGuests();
            setGuest(response.data);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setGuest([]);
        }
    };

    useEffect(() => {
        fetchGuestData();
        // Removed clearOrder() to preserve the dineInArea selected in the previous step
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectGuest = (guest: Guest) => {
        setSelectedGuest(guest);
        setFormData({
            ...formData,
            guestName: guest.name,
            guestEmail: guest.email,
            phoneNumber: guest.phonenumber,
            address: guest.address,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDineArea) {
            alert('Please select a Dine Area before proceeding.');
            return;
        }

        const date = new Date();
        const time = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const timeExpectedValue =
            formData.timeExpected &&
            !isNaN(new Date(formData.timeExpected).getTime())
                ? formData.timeExpected
                : null;

        // Find the full dine area object
        const selectedAreaObj = dineAreasData.find(
            (area: any) => String(area.id) === selectedDineArea,
        );

        setOrder({
            ...order,
            orderType: 'DELIVERY',
            dineInArea: selectedAreaObj
                ? { id: parseInt(selectedDineArea), name: selectedAreaObj.name }
                : null,
            waiter: formData.waiter,
            guestName: formData.guestName,
            address: formData.address,
            guestEmail: formData.guestEmail,
            phoneNumber: formData.phoneNumber,
            bookingDate: formattedDate,
            bookingTime: time,
            remark: formData.remark,
            timeExpected: timeExpectedValue,
        });
        onSubmit();
    };

    useEffect(() => {
        fetchAuthorizedStaff(user);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (authorizedStaff) {
            setFormData({
                ...formData,
                waiter: {
                    id: authorizedStaff.id,
                    fullName: authorizedStaff.fullName,
                    email: authorizedStaff.email,
                    roleId: authorizedStaff.roles.id,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authorizedStaff]);
    return (
        <PageWrapper>
            <PageHeader>
                <Button
                    onClick={goBack}
                    className="mr-2"
                    variant={'ghost'}
                    size={'icon'}
                >
                    <ChevronLeft />
                </Button>
                <PageHeadertitle title="Home Delivery Form" />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div className="flex flex-col gap-4 bg-white p-4 rounded-md">
                <h1 className="sr-only">Home Delivery Form</h1>
                <SearchSelectAlternative
                    id="customer"
                    label="Customer"
                    placeholder="Search for a customer, phone, email"
                    items={guest}
                    value={selectedGuest || null}
                    className="bg-white h-10"
                    onChange={(g) => selectGuest(g as Guest)}
                    displayValue={(g: {
                        name: string;
                        email: string;
                        phonenumber?: string;
                    }) => {
                        const name = g?.name || 'Unknown Guest';
                        return g?.phonenumber
                            ? `${name} • ${g.phonenumber}`
                            : name;
                    }}
                />

                <div className="w-full grid grid-cols-2 gap-4 mt-2">
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <InputField
                            id="guestName"
                            label="Guest Name"
                            placeholder="Enter guest name"
                            type="text"
                            name="guestName"
                            defaultValue={
                                formData.guestName ?? selectedGuest?.name
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    guestName: e.target.value,
                                })
                            }
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="guestPhone"
                                label="Guest Phone"
                                placeholder="Enter guest phone"
                                type="text"
                                name="guestPhone"
                                value={
                                    formData.phoneNumber ??
                                    selectedGuest?.phonenumber
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phoneNumber: e.target.value,
                                    })
                                }
                            />
                            <InputField
                                id="guestEmail"
                                label="Guest Email"
                                placeholder="Enter guest email"
                                type="text"
                                name="guestEmail"
                                value={
                                    formData.guestEmail ?? selectedGuest?.email
                                }
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        guestEmail: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <InputField
                            id="guestAddress"
                            label="Guest Address"
                            placeholder="Enter guest address"
                            type="text"
                            name="guestAddress"
                            value={formData.address ?? selectedGuest?.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                        />
                        <InputField
                            id="remark"
                            label="Remark"
                            placeholder="Enter remark"
                            type="text"
                            name="remark"
                            value={formData.remark}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    remark: e.target.value,
                                })
                            }
                        />
                        <TimePicker
                            format="ISO"
                            value={formData.timeExpected}
                            onChange={(time) => {
                                setFormData({
                                    ...formData,
                                    timeExpected: time as string,
                                });
                            }}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Select Dine Area
                            </label>
                            <Select
                                value={selectedDineArea}
                                onValueChange={setSelectedDineArea}
                            >
                                <SelectTrigger>
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
                        <div className="flex justify-between w-full">
                            <Button
                                className="border-orion-blue text-orion-blue"
                                variant={'outline'}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-orion-blue"
                                type="submit"
                                disabled={!selectedDineArea}
                            >
                                Place Order
                            </Button>
                        </div>
                    </form>
                    <div className="border-l flex flex-col gap-4 p-4">
                        <h1>Guest Past Orders</h1>
                        <div>
                            <CustomItemTable
                                columns={guestOrderHistoryColumns}
                                data={selectedGuest?.pastOrders ?? []}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default HomeDeliveryForm;
