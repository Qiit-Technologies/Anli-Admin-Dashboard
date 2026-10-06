'use client';
import { getOrderById, updateOrder } from '@/app/actions/order';
import { InputField } from '@/components/common/Form';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomItemTable from '@/components/common/table/CustomItemTable';
import { OrderFormData } from '@/components/front-of-house/OrderForm';
import {
    guestOrderHistoryColumns,
    sampleGuestHistoryData,
} from '@/components/front-of-house/tables/columns/GuestOrderHistory';
import { TimePicker } from '@/components/TimePicker';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/context/useUser';
import { cn } from '@/lib/utils';
import useOrderStore from '@/store/useOrder';
import useStaffAuth from '@/store/useStaffAuth';
import { Check, ChevronLeft, ChevronsUpDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LuBell } from 'react-icons/lu';

interface Guest {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
}

const sampleGuests: Guest[] = [
    {
        id: 1,
        name: 'John Doe',
        phone: '1234567890',
        email: '@example.com',
        address: '123 Main St',
    },
    {
        id: 2,
        name: 'Jane Smith',
        phone: '9876543210',
        email: '@example.com',
        address: '456 Elm St',
    },
    {
        id: 3,
        name: 'Bob Johnson',
        phone: '1112223333',
        email: '@example.com',
        address: '789 Oak St',
    },
];
const Selector = ({
    open,
    setOpen,
    placeholder,
    value,
    disabled = false,
    className = '',
    children,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    placeholder: string;
    value?: string;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}) => (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className={`w-full border-none shadow-none items-center justify-start h-10 ${className}`}
            >
                {value || placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full p-0">
            {children}
        </PopoverContent>
    </Popover>
);

const HomeDeliveryForm = () => {
    const params = useParams();
    const router = useRouter();
    const { id: orderId } = params;
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
    const [search, setSearch] = useState('');
    const [guestSelectorOpen, setGuestSelectorOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest>();
    const { user } = useUser();
    const { authorizedStaff, fetchAuthorizedStaff } = useStaffAuth();
    const [referrer, setReferrer] = useState<string | null>(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const filteredGuests = sampleGuests.filter(
        (guest) =>
            guest.name.toLowerCase().includes(search.toLowerCase()) ||
            guest.phone.toLowerCase().includes(search.toLowerCase()) ||
            guest.email.toLowerCase().includes(search.toLowerCase()),
    );

    useEffect(() => {
        clearOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectGuest = (guest: Guest) => {
        setSelectedGuest(guest);
        setGuestSelectorOpen(false);
        setFormData({
            ...formData,
            guestName: guest.name,
            guestEmail: guest.email,
            phoneNumber: guest.phone,
            address: guest.address,
        });
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

    async function fetchOrder() {
        try {
            const response = await getOrderById(Number(orderId));
            if (response.data) {
                setFormData({
                    waiter: {
                        id: response.data.waiter?.id || 1,
                        fullName:
                            response.data.waiter?.fullName || 'John Smith',
                        email: response.data.waiter?.email || 'test@email.com',
                        roleId: response.data.waiter?.roleId || 0,
                    },
                    guestName: response.data.guestName || '',
                    guestEmail: response.data.guestEmail || '',
                    phoneNumber: response.data.guestPhoneNumber || '',
                    address: response.data.address || '',
                    remark: response.data.remark || '',
                    timeExpected: response.data.scheduledFor || '',
                });

                if (response.data.guestName) {
                    const matchedGuest = filteredGuests.find(
                        (g) => g.name === response.data.guestName,
                    );
                    if (matchedGuest) {
                        setSelectedGuest(matchedGuest);
                    }
                }

                setOrder({
                    ...response.data,
                    requestId: response.data.id,
                    orderType: 'DELIVERY',
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch order:', error);
        }
    }

    const handleGoBack = () => {
        if (referrer) {
            router.push(referrer);
        } else {
            router.back();
        }
    };

    const updateDeliveryOrder = async () => {
        setLoadingUpdate(true);
        try {
            const updatedOrder = {
                guestName: formData.guestName,
                guestEmail: formData.guestEmail,
                guestPhoneNumber: formData.phoneNumber,
                address: formData.address,
                waiterId: formData.waiter.id,
                remark: formData.remark,
                scheduledFor: formData.timeExpected,
            };

            const response = await updateOrder(order.requestId, updatedOrder);
            if (response.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Order ${order.requestId} updated successfully!`}
                        type="success"
                    />
                ));
                clearOrder();
                handleGoBack();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Failed to update order. Please try again.`}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={`Failed to update order. Please try again.`}
                    type="error"
                />
            ));
        } finally {
            setLoadingUpdate(false);
        }
    };

    useEffect(() => {
        const storedReferrer = sessionStorage.getItem('orderReferrer');
        setReferrer(storedReferrer || '/front-of-house/incoming-orders');
    }, []);

    useEffect(() => {
        if (orderId) {
            clearOrder();
            fetchOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateDeliveryOrder();
    };

    const goBack = () => {
        handleGoBack();
    };

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
                <PageHeadertitle
                    title={`Delivery Order update for #${orderId}`}
                />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div className="flex flex-col gap-4 bg-white p-4 rounded-md">
                <h1 className="sr-only">Home Delivery Form</h1>
                <div className="border rounded-lg">
                    <Selector
                        open={guestSelectorOpen}
                        setOpen={setGuestSelectorOpen}
                        placeholder="Search for a customer, phone, email"
                        value={selectedGuest?.name}
                        className="bg-white h-10"
                    >
                        <Command>
                            <CommandInput
                                placeholder="Search guest..."
                                value={search}
                                onValueChange={setSearch}
                                className="h-10"
                            />
                            <CommandList>
                                <CommandEmpty>No guest found.</CommandEmpty>
                                <CommandGroup>
                                    {filteredGuests.map((guest) => (
                                        <CommandItem
                                            key={guest.id}
                                            value={guest.name}
                                            onSelect={() => selectGuest(guest)}
                                        >
                                            <div className="flex flex-col">
                                                <span>{guest.name}</span>
                                                <span className="text-sm text-gray-500">
                                                    {guest.phone}
                                                </span>
                                            </div>
                                            <Check
                                                className={cn(
                                                    'ml-auto h-4 w-4',
                                                    selectedGuest?.id ===
                                                        guest.id
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </Selector>
                </div>
                <div className="w-full grid grid-cols-2 gap-4">
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
                                formData.guestName ?? filteredGuests[0]?.name
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
                                    filteredGuests[0]?.phone
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
                                    formData.guestEmail ??
                                    filteredGuests[0]?.email
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
                            value={
                                formData.address ?? filteredGuests[0]?.address
                            }
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
                                disabled={loadingUpdate}
                            >
                                {loadingUpdate ? 'Updating...' : 'Update Order'}
                            </Button>
                        </div>
                    </form>
                    <div className="border-l flex flex-col gap-4 p-4">
                        <h1>Guest Past Orders</h1>
                        <div>
                            <CustomItemTable
                                columns={guestOrderHistoryColumns}
                                data={sampleGuestHistoryData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default HomeDeliveryForm;
