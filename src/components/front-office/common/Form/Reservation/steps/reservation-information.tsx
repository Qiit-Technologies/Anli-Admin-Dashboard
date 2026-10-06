/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputField, SelectField } from '@/components/common/Form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { FormColumn, FormGroup } from '../components';
import { StepProps } from '../types';

export function ReservationDetailsStep({
    formData,
    handleInputChange,
    errors,
    inputClass,
    hotel,
    roomTypes,
    setSelectedRoomTypeId,
    setSelectedRoomType,
    roomOptions,
    filteredRooms,
    setSelectedRoom,
    mode,
    reservationType,
    // getTodayDate,
    // isAdmin,
}: StepProps & {
    hotel: any;
    roomTypes: any[];
    setSelectedRoomTypeId: (id: number | null) => void;
    setSelectedRoomType: (type: any | null) => void;
    roomOptions: any[];
    filteredRooms: any[];
    setSelectedRoom: (room: any) => void;
    mode: 'add' | 'update';
    getTodayDate: () => string;
    isAdmin?: boolean;
    reservationType?: 'REGULAR' | 'COMPLIMENTARY' | 'DISCOUNT' | 'VOID';
}) {
    const getTodayDateString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getTomorrowDateString = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const autoPopulateDateTime = () => {
        const today = getTodayDateString();
        const tomorrow = getTomorrowDateString();

        handleInputChange('startDate', today);
        handleInputChange('endDate', tomorrow);
        handleInputChange('startTime', '14:00');
        handleInputChange('endTime', '12:00');
    };

    useEffect(() => {
        if (mode === 'add' && !formData.startDate && !formData.endDate) {
            autoPopulateDateTime();
        }
    }, [mode]);

    const handleWalkInToggle = (checked: boolean) => {
        if (reservationType === 'VOID' && checked) {
            return;
        }

        handleInputChange('isWalkIn', checked);

        if (checked) {
            autoPopulateDateTime();
        }
    };

    const getWalkInValidationMessage = () => {
        if (formData.isWalkIn) {
            const today = getTodayDateString();
            if (formData.startDate && formData.startDate !== today) {
                return "Walk-in guests must have today's date as start date. Please turn off walk-in mode or use today's date.";
            }
        }
        return null;
    };

    const walkInValidationMessage = getWalkInValidationMessage();

    const calculateNights = (startDate?: string, endDate?: string) => {
        const parseYMD = (dateStr?: string) => {
            if (!dateStr) return null;
            const ymd = dateStr.split('T')[0];
            const parts = ymd.split('-').map(Number);
            if (parts.length !== 3 || parts.some(isNaN)) return null;
            const [y, m, d] = parts;
            return { y, m, d };
        };

        const s = parseYMD(startDate);
        const e = parseYMD(endDate);
        if (!s || !e) return 0;

        const msPerDay = 24 * 60 * 60 * 1000;
        const sUTC = Date.UTC(s.y, s.m - 1, s.d);
        const eUTC = Date.UTC(e.y, e.m - 1, e.d);
        const diffDays = (eUTC - sUTC) / msPerDay;

        return diffDays > 0 ? Math.floor(diffDays) : 0;
    };

    return (
        <div className="flex flex-col gap-4">
            <FormGroup>
                <InputField
                    id="property"
                    label="Property"
                    type="text"
                    name="property"
                    value={hotel?.organization?.name || ''}
                    readOnly={true}
                    className={inputClass}
                />

                <FormColumn>
                    <SelectField
                        id="roomtype"
                        name="roomtype"
                        label="Room Type"
                        className={inputClass}
                        value={
                            formData.roomtype && Number(formData.roomtype) > 0
                                ? String(formData.roomtype)
                                : ''
                        }
                        onValueChange={(value) => {
                            const roomTypeId = Number.parseInt(value, 10);
                            if (!Number.isFinite(roomTypeId)) return;
                            handleInputChange('roomtype', roomTypeId);

                            const selectedType = (roomTypes ?? []).find(
                                (type) => type.id === roomTypeId,
                            );
                            setSelectedRoomType(selectedType);
                            setSelectedRoomTypeId(roomTypeId);
                        }}
                        options={(roomTypes ?? []).map((type) => ({
                            value: type.id.toString(),
                            label: type.name,
                        }))}
                        placeholder="Select a room type"
                    />
                    {errors.roomtype && (
                        <div className="text-red-500 text-sm">
                            {errors.roomtype}
                        </div>
                    )}
                </FormColumn>
            </FormGroup>

            <FormGroup>
                <FormColumn>
                    <InputField
                        id="startDate"
                        name="startDate"
                        label="Start Date"
                        type="date"
                        className={inputClass}
                        value={formData.startDate || ''}
                        onChange={(e) =>
                            handleInputChange('startDate', e.target.value)
                        }
                        disabled={formData.isCheckedIn}
                        readOnly={formData.isCheckedIn}
                    />
                    {formData.isCheckedIn && (
                        <p className="text-xs text-gray-500 mt-1">
                            Check-in date cannot be modified for active
                            reservations.
                        </p>
                    )}
                    {errors.startDate && (
                        <div className="text-red-500 text-sm">
                            {errors.startDate}
                        </div>
                    )}
                </FormColumn>

                <FormColumn>
                    <InputField
                        id="endDate"
                        name="endDate"
                        label="End Date"
                        type="date"
                        className={inputClass}
                        value={formData.endDate || ''}
                        onChange={(e) =>
                            handleInputChange('endDate', e.target.value)
                        }
                    />
                    {errors.endDate && (
                        <div className="text-red-500 text-sm">
                            {errors.endDate}
                        </div>
                    )}
                </FormColumn>
            </FormGroup>

            <div className="flex items-center justify-between border border-gray-300 rounded-md p-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isWalkIn"
                        name="isWalkIn"
                        checked={Boolean(formData.isWalkIn)}
                        disabled={reservationType === 'VOID'}
                        onCheckedChange={(checked) =>
                            handleWalkInToggle(Boolean(checked))
                        }
                        className="h-5 w-5 rounded-full border border-orion-blue data-[state=checked]:bg-orion-blue data-[state=checked]:border-orion-blue"
                    />
                    <Label
                        htmlFor="isWalkIn"
                        className="text-sm mb-0 font-medium"
                    >
                        Walk-in Guest
                    </Label>
                </div>
                <div className="text-sm text-gray-700">
                    Nights:{' '}
                    {calculateNights(formData.startDate, formData.endDate)}
                </div>
            </div>

            {walkInValidationMessage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                                {walkInValidationMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <FormGroup>
                <FormColumn>
                    <InputField
                        id="startTime"
                        name="startTime"
                        label="Start Time"
                        type="time"
                        className={inputClass}
                        value={formData.startTime || '14:00'}
                        onChange={(e) =>
                            handleInputChange('startTime', e.target.value)
                        }
                        disabled={formData.isCheckedIn}
                        readOnly={formData.isCheckedIn}
                    />
                    {errors.startTime && (
                        <div className="text-red-500 text-sm">
                            {errors.startTime}
                        </div>
                    )}
                </FormColumn>

                <FormColumn>
                    <InputField
                        id="endTime"
                        name="endTime"
                        label="End Time"
                        type="time"
                        className={inputClass}
                        value={formData.endTime || '12:00'}
                        onChange={(e) =>
                            handleInputChange('endTime', e.target.value)
                        }
                    />
                    {errors.endTime && (
                        <div className="text-red-500 text-sm">
                            {errors.endTime}
                        </div>
                    )}
                </FormColumn>
            </FormGroup>

            <FormColumn>
                <SelectField
                    id="roomNumber"
                    name="roomNumber"
                    label="Room Number"
                    className={inputClass}
                    value={
                        formData.roomNumber != null &&
                        String(formData.roomNumber) !== ''
                            ? String(formData.roomNumber)
                            : ''
                    }
                    onValueChange={(value) => {
                        const roomNum = value;
                        handleInputChange('roomNumber', roomNum);

                        const foundRoom = (filteredRooms ?? []).find(
                            (room) =>
                                String(room.roomNumber) === String(roomNum),
                        );
                        setSelectedRoom(foundRoom);
                    }}
                    options={roomOptions ?? []}
                    placeholder={
                        mode === 'add' &&
                        (!formData.roomtype ||
                            !formData.startDate ||
                            !formData.endDate)
                            ? 'Select a Room Type, Start Date and End Date'
                            : 'Select a room number'
                    }
                    disabled={
                        mode === 'add' &&
                        (!formData.roomtype ||
                            !formData.startDate ||
                            !formData.endDate)
                    }
                />

                {errors.roomNumber && (
                    <div className="text-red-500 text-sm">
                        {errors.roomNumber}
                    </div>
                )}
            </FormColumn>
        </div>
    );
}
