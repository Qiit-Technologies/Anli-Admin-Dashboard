'use client';

import { getEmployees } from '@/app/actions/employee';
import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import { Button } from '@/components/ui/button';
import { useSteps } from '@/hooks/useSteps';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export interface Shift {
    id?: string;
    type: string;
    startTime: string;
    endTime: string;
    periods: string[];
    employees: string[];
}

interface CreateShiftFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    initialData?: any;
}

const steps = [
    {
        id: 'shift-details',
        title: 'Shift Details',
        description: 'Set up the basic shift information',
    },
    {
        id: 'assign-employees',
        title: 'Assign Employees',
        description: 'Select employees for this shift',
    },
];

const ShiftForm = ({
    onSubmit,
    onCancel,
    initialData,
}: CreateShiftFormProps) => {
    const { data: employees } = useSWR('/employees', getEmployees);
    const { currentStepIndex, next, back } = useSteps();

    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const [formData, setFormData] = useState<Omit<Shift, 'id'>>({
        type: initialData?.type ?? '',
        startTime: initialData?.startTime ?? '',
        endTime: initialData?.endTime ?? '',
        periods: initialData?.periods ?? [],
        employees: initialData?.employees ?? [],
    });
    useEffect(() => {
        if (initialData) {
            setFormData({
                type: initialData.type,
                startTime: initialData.startTime,
                endTime: initialData.endTime,
                periods: initialData.periods || [],
                employees: initialData.employees || [],
            });
        }
    }, [initialData]);

    const handleInputChange = (field: keyof Omit<Shift, 'id'>, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!isLastStep) {
            next();
            return;
        }
        onSubmit(formData);
    };

    const handleAddEmployee = () => {
        setFormData((prev) => ({
            ...prev,
            employees: [...prev.employees, ''],
        }));
    };

    const handleEmployeeChange = (index: number, value: string) => {
        const updatedEmployees = [...formData.employees];
        updatedEmployees[index] = value;
        setFormData((prev) => ({
            ...prev,
            employees: updatedEmployees,
        }));
    };

    const handleRemoveEmployee = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            employees: prev.employees.filter((_, i) => i !== index),
        }));
    };

    const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    const handleDaysClick = (day: string) => {
        if (formData?.periods?.includes(day)) {
            setFormData((prev) => ({
                ...prev,
                periods: prev.periods.filter((dayHere) => dayHere !== day),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                periods: [...prev.periods, day],
            }));
        }
    };

    const isDisabled = () => {
        if (currentStepIndex === 0) {
            if (
                !formData.startTime ||
                !formData.endTime ||
                !formData.periods?.length ||
                !formData.type
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            if (!formData.employees?.length) {
                return true;
            } else if (
                !formData.employees?.every((item) => typeof item === 'number')
            ) {
                return true;
            } else {
                return false;
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Stepper */}
            <div className="flex w-full flex-start gap-2">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`flex items-center gap-2 ${
                            index <= currentStepIndex
                                ? 'text-primary'
                                : 'text-gray-400'
                        }`}
                    >
                        <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                index <= currentStepIndex
                                    ? 'bg-orion-blue text-white'
                                    : 'bg-gray-100'
                            }`}
                        >
                            {index + 1}
                        </div>
                        <span className="text-sm font-medium">
                            {step.title}
                        </span>
                        {index < steps.length - 1 && (
                            <div className="h-px w-12 bg-gray-200 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            <div className="border flex flex-col gap-4 rounded-lg p-4">
                {currentStepIndex === 0 ? (
                    <>
                        <SelectField
                            id="type"
                            label="Shift Type"
                            name="type"
                            value={formData.type}
                            onValueChange={(value) =>
                                handleInputChange('type', value)
                            }
                            options={[
                                { value: 'morning', label: 'Morning Shift' },
                                {
                                    value: 'afternoon',
                                    label: 'Afternoon Shift',
                                },
                                { value: 'night', label: 'Night Shift' },
                                { value: 'rotating', label: 'Rotating Shift' },
                            ]}
                        />
                        <InputField
                            id="startTime"
                            label="Start Time"
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={(e) =>
                                handleInputChange('startTime', e.target.value)
                            }
                        />
                        <InputField
                            id="endTime"
                            label="End Time"
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={(e) =>
                                handleInputChange('endTime', e.target.value)
                            }
                        />
                        <div>
                            <p>Days</p>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {days.map((day) => (
                                    <div
                                        key={day}
                                        className="flex gap-1 items-center cursor-pointer"
                                        onClick={() => handleDaysClick(day)}
                                    >
                                        <div
                                            className={`flex items-center justify-center w-5 h-5 ${formData.periods?.includes(day) ? 'border-red-300' : ''} border rounded-[3px]`}
                                        >
                                            {!!formData.periods?.includes(
                                                day,
                                            ) && (
                                                <div className="w-3 h-3 bg-red-300 rounded-[2px]" />
                                            )}
                                        </div>
                                        <p className="font-medium">{day}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">
                                Assign Employees
                            </h3>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddEmployee}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Employee
                            </Button>
                        </div>

                        {formData.employees.map((employee, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <SelectField
                                    id={`employee-${index}`}
                                    label={`Employee ${index + 1}`}
                                    name={`employee-${index}`}
                                    value={employee}
                                    onValueChange={(value) =>
                                        handleEmployeeChange(index, value)
                                    }
                                    options={employees?.map((emp: any) => ({
                                        value: emp.id,
                                        label: emp.fullName,
                                    }))}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleRemoveEmployee(index)}
                                    className="mt-6"
                                >
                                    <X className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}

                        {formData.employees.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                {`No employees assigned. Click "Add Employee" to
                                assign employees to this shift.`}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-between gap-2">
                {!isFirstStep && (
                    <Button variant="outline" onClick={back}>
                        Back
                    </Button>
                )}
                <div className="flex gap-2 ml-auto">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <BrandButton disabled={isDisabled()} onClick={handleSubmit}>
                        {isLastStep
                            ? initialData
                                ? 'Update Shift'
                                : 'Create Shift'
                            : 'Next'}
                    </BrandButton>
                </div>
            </div>
        </div>
    );
};

export default ShiftForm;
