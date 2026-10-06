'use client';
import { getRoomByHotelId } from '@/app/actions/room';
import { FormField, InputField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ROOM } from '@/types';
import React, { FormEvent, useEffect, useState } from 'react';

interface LostItemFormProps {
    defaultValues?: {
        name?: string;
        roomId?: string;
        guestContacted?: boolean;
        status?: string;
    };
    onSubmit?: (data: {
        name: string;
        roomId: string;
        guestContacted: boolean;
        status: string;
    }) => void;
}

const LostItemForm: React.FC<LostItemFormProps> = ({
    defaultValues = {},
    onSubmit,
}) => {
    const [formData, setFormData] = useState({
        name: defaultValues.name ?? '',
        roomId: defaultValues.roomId ?? '',
        status: defaultValues.status ?? '',
        guestContacted: defaultValues.guestContacted || false,
    });
    const [rooms, setRooms] = useState([]);

    const updateFormData = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (onSubmit) {
            onSubmit(formData);
        }
    };

    useEffect(() => {
        const fetchRooms = async () => {
            const result = await getRoomByHotelId();
            if (result.data.statusCode > 400) {
                return;
            }
            setRooms(result.data);
            return;
        };
        fetchRooms();
    }, []);

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
                <InputField
                    id="itemName"
                    name="itemName"
                    label="Item Name"
                    placeholder="Enter Item Name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                />

                <div className="flex flex-col">
                    <label
                        htmlFor="roomNumber"
                        className="mb-1 text-sm font-medium"
                    >
                        Room Number
                    </label>
                    <Select
                        value={formData.roomId}
                        onValueChange={(value) =>
                            updateFormData('roomId', value)
                        }
                    >
                        <SelectTrigger
                            id="roomNumber"
                            className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                        >
                            <SelectValue placeholder="Select Room Number" />
                        </SelectTrigger>
                        <SelectContent>
                            {rooms.length > 0 ? (
                                rooms.map((room: ROOM) => (
                                    <SelectItem
                                        key={room.id}
                                        value={String(room.id)}
                                    >
                                        {room.roomNumber} ({room.roomtype.name})
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>
                                    No rooms available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="status"
                        className="mb-1 text-sm font-medium"
                    >
                        Status
                    </label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) =>
                            updateFormData('status', value)
                        }
                    >
                        <SelectTrigger
                            id="status"
                            className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                        >
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UNCLAIMED">Unclaimed</SelectItem>
                            <SelectItem value="CLAIMED">Claimed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <FormField label="Guest Contacted" htmlFor="guestContacted">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="guestContacted"
                            name="guestContacted"
                            checked={formData.guestContacted}
                            onCheckedChange={(checked) =>
                                updateFormData('guestContacted', checked)
                            }
                        />
                        <label
                            htmlFor="guestContacted"
                            className="text-sm text-muted-foreground"
                        >
                            {formData.guestContacted ? 'Yes' : 'No'}
                        </label>
                    </div>
                </FormField>

                <div className="mt-4">
                    <Button
                        type="submit"
                        className="px-4 w-full h-14 py-2 bg-orion-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Log In Lost Item
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default LostItemForm;
