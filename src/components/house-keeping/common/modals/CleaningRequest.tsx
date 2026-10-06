'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { getRoomByHotelId } from '@/app/actions/room';
import { Room } from '@/app/dashboard/components/Main/stay-view/types';

interface CleaningRequestFormData {
    roomId: string;
    urgency: string;
    roomCondition: string;
}

interface CleaningRequestDialogProps {
    buttonComponent?: React.ReactNode;
    onSubmit: (data: CleaningRequestFormData) => void;
}

export function CleaningRequestDialog({
    buttonComponent,
    onSubmit,
}: CleaningRequestDialogProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<CleaningRequestFormData>({
        roomId: '',
        urgency: '',
        roomCondition: '',
    });
    const [rooms, setRooms] = useState<Room[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ roomId: '', urgency: '', roomCondition: '' });
        setOpen(false);
    };

    const updateFormData = (
        field: keyof CleaningRequestFormData,
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    useEffect(() => {
        const fetchRooms = async () => {
            const result = (await getRoomByHotelId()) as any;
            if (result.data.statusCode > 400) {
                return;
            }
            setRooms(result.data);
            return;
        };
        fetchRooms();
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{buttonComponent}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Cleaning Request</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your cleaning request.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
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
                                    className="w-full focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                                >
                                    <SelectValue placeholder="Select Room Number" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.length > 0 ? (
                                        rooms.map((room: Room) => (
                                            <SelectItem
                                                key={room.id}
                                                value={room.id}
                                            >
                                                {room.roomNumber}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="" disabled>
                                            No rooms available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col">
                            <label
                                htmlFor="urgency"
                                className="mb-1 text-sm font-medium"
                            >
                                Urgency
                            </label>
                            <Select
                                value={formData.urgency}
                                onValueChange={(value) =>
                                    updateFormData('urgency', value)
                                }
                            >
                                <SelectTrigger
                                    id="urgency"
                                    className="w-full focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                                >
                                    <SelectValue placeholder="Select Urgency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="urgent">
                                        Urgent
                                    </SelectItem>
                                    <SelectItem value="normal">
                                        Normal
                                    </SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col">
                            <label
                                htmlFor="roomCondition"
                                className="mb-1 text-sm font-medium"
                            >
                                Room Condition
                            </label>
                            <Textarea
                                id="roomCondition"
                                className="focus:ring-brand focus-visible:ring-brand"
                                placeholder="Describe the room condition"
                                aria-label="Enter room condition"
                                value={formData.roomCondition}
                                onChange={(e) =>
                                    updateFormData(
                                        'roomCondition',
                                        e.target.value,
                                    )
                                }
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="bg-orion-blue hover:bg-orion-blue"
                            type="submit"
                        >
                            Submit Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
