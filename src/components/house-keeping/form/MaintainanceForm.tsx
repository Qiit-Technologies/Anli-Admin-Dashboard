'use client';
import { getHouseKeepersByHotelId } from '@/app/actions/houseKeeping';
import { getRoomByHotelId } from '@/app/actions/room';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ROOM } from '@/types';
import { Staff } from '@/types/staff.types';
import React, { FormEvent, useEffect, useState } from 'react';

interface MaintenanceFormProps {
    defaultValues?: {
        urgency?: string;
        issueType?: string;
        description?: string;
        roomId?: string;
        reportedBy?: string;
        maintenanceDurationValue?: string;
        maintenanceDurationUnit?: 'MINUTES' | 'HOURS' | 'DAYS' | '';
    };
    onSubmit?: (data: {
        urgency: string;
        issueType: string;
        description: string;
        roomId: string;
        reportedBy?: string;
        maintenanceDurationValue?: string;
        maintenanceDurationUnit?: 'MINUTES' | 'HOURS' | 'DAYS' | '';
    }) => void;
}

const urgencyLevels = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
];

const issueTypes = [
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'HVAC', label: 'HVAC' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'HOUSEKEEPING', label: 'Housekeeping' },
    { value: 'APPLIANCE', label: 'Appliance' },
    { value: 'STRUCTURAL', label: 'Structural' },
    { value: 'OTHER', label: 'Other' },
];

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
    defaultValues = {},
    onSubmit,
}) => {
    const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
    const [formData, setFormData] = useState({
        urgency: defaultValues.urgency || '',
        issueType: defaultValues.issueType || '',
        description: defaultValues.description || '',
        roomId: defaultValues.roomId || '',
        reportedBy: defaultValues.reportedBy || '',
        maintenanceDurationValue: defaultValues.maintenanceDurationValue || '',
        maintenanceDurationUnit: defaultValues.maintenanceDurationUnit || '',
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
            const u = formData.maintenanceDurationUnit;
            const maintenanceDurationUnit =
                u === 'MINUTES' || u === 'HOURS' || u === 'DAYS' ? u : '';
            onSubmit({
                urgency: formData.urgency,
                issueType: formData.issueType,
                description: formData.description,
                roomId: formData.roomId,
                reportedBy: formData.reportedBy,
                maintenanceDurationValue: formData.maintenanceDurationValue,
                maintenanceDurationUnit,
            });
        }
    };

    useEffect(() => {
        const fetchStaffMembers = async () => {
            const result = await getHouseKeepersByHotelId();
            console.log(result);
            if (result) {
                setStaffMembers(result);
            }
        };
        fetchStaffMembers();
    }, []);

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
                <div className="flex flex-col">
                    <label
                        htmlFor="reportedBy"
                        className="mb-1 text-sm font-medium"
                    >
                        Reported By
                    </label>
                    <Select
                        defaultValue={formData.reportedBy}
                        onValueChange={(value) =>
                            updateFormData('reportedBy', value)
                        }
                    >
                        <SelectTrigger
                            id="reportedBy"
                            className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                        >
                            <SelectValue placeholder="Select Staff (defaults to current user)" />
                        </SelectTrigger>
                        <SelectContent>
                            {staffMembers?.map((staff) => (
                                <SelectItem
                                    key={staff.id}
                                    value={String(staff.id)}
                                >
                                    {staff.fullName}
                                </SelectItem>
                            )) ?? []}
                        </SelectContent>
                    </Select>
                    <span className="text-xs mt-2 text-muted-foreground">
                        * Leaving this blank sets you as the reporter.
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label
                            htmlFor="maintenanceDurationValue"
                            className="mb-1 text-sm font-medium"
                        >
                            Resolution Time Value
                        </label>
                        <input
                            id="maintenanceDurationValue"
                            type="number"
                            min="1"
                            placeholder="e.g. 2"
                            value={formData.maintenanceDurationValue}
                            onChange={(e) =>
                                updateFormData(
                                    'maintenanceDurationValue',
                                    e.target.value,
                                )
                            }
                            className="h-10 rounded-md px-3 bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label
                            htmlFor="maintenanceDurationUnit"
                            className="mb-1 text-sm font-medium"
                        >
                            Resolution Time Unit
                        </label>
                        <Select
                            value={formData.maintenanceDurationUnit}
                            onValueChange={(value) =>
                                updateFormData(
                                    'maintenanceDurationUnit',
                                    value,
                                )
                            }
                        >
                            <SelectTrigger
                                id="maintenanceDurationUnit"
                                className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                            >
                                <SelectValue placeholder="Select Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MINUTES">Minutes</SelectItem>
                                <SelectItem value="HOURS">Hours</SelectItem>
                                <SelectItem value="DAYS">Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="urgency"
                        className="mb-1 text-sm font-medium"
                    >
                        Urgency Level
                    </label>
                    <Select
                        value={formData.urgency}
                        onValueChange={(value) =>
                            updateFormData('urgency', value)
                        }
                    >
                        <SelectTrigger
                            id="urgency"
                            className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                        >
                            <SelectValue placeholder="Select Urgency Level" />
                        </SelectTrigger>
                        <SelectContent>
                            {urgencyLevels.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="issueType"
                        className="mb-1 text-sm font-medium"
                    >
                        Issue Type
                    </label>
                    <Select
                        value={formData.issueType}
                        onValueChange={(value) =>
                            updateFormData('issueType', value)
                        }
                    >
                        <SelectTrigger
                            id="issueType"
                            className="w-full bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                        >
                            <SelectValue placeholder="Select Issue Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {issueTypes.map(({ value, label }) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col">
                    <label
                        htmlFor="description"
                        className="mb-1 text-sm font-medium"
                    >
                        Description
                    </label>
                    <Textarea
                        id="description"
                        placeholder="Describe the maintenance issue"
                        value={formData.description}
                        onChange={(e) =>
                            updateFormData('description', e.target.value)
                        }
                        className="bg-gray-100 border-none focus:ring-brand focus-within:ring-brand focus-visible:ring-brand"
                    />
                </div>

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
                                        {room?.roomNumber ?? 'N/A'} ({room?.roomtype?.name ?? 'Unknown Type'})
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

                <div className="mt-4">
                    <Button
                        type="submit"
                        className="px-4 w-full h-14 py-2 bg-orion-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Submit Maintenance Request
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default MaintenanceForm;
