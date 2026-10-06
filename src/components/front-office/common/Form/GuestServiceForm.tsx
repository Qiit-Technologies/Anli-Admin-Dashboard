'use client';
import {
    createHotelServiceType,
    getHotelServicesType,
} from '@/app/actions/hotel';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
export interface ServiceLogs {
    type: string;
    amountPaid: number;
    notes: string;
    isPaid: boolean;
}

interface ServiceLogsFormProps {
    onSubmit: (data: ServiceLogs) => void;
    onClose?: () => void;
}

const GuestServiceForm = ({ onSubmit, onClose }: ServiceLogsFormProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [addType, setAddType] = useState(false);
    const [formData, setFormData] = useState<ServiceLogs>({
        type: '',
        amountPaid: 0,
        notes: '',
        isPaid: false,
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onSubmit(formData);
            onClose?.();
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const { data: serviceTypes } = useSWR(
        '/hotels/other-services',
        getHotelServicesType,
    );

    // const serviceTypes = ['Laundry', 'Gym Membership', 'Spa', 'Pool'];

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <div>
                <h1 className="text-xl font-semibold">Log a service</h1>
                <span className="text-sm text-gray-500">
                    Logged Untracked Services
                </span>
            </div>
            <div className="mt-4">
                <Button
                    size={'sm'}
                    variant={'outline'}
                    className="w-fit border-orion-blue text-orion-blue hover:bg-orion-blue hover:text-white"
                    onClick={() => setAddType(!addType)}
                >
                    {addType ? <ChevronDown /> : <ChevronUp />}
                    Add Service Type
                </Button>
            </div>
            {addType ? (
                <motion.div layout>
                    <ServiceTypeForm />
                </motion.div>
            ) : null}
            <div className="mt-4">
                <form className="space-y-4">
                    <SelectField
                        id="type"
                        name="type"
                        label="Service Type"
                        options={serviceTypes?.data.map((item: any) => {
                            return {
                                value: item.id,
                                label: item.type,
                            };
                        })}
                        value={formData.type}
                        onValueChange={(value) =>
                            setFormData({ ...formData, type: value })
                        }
                    />
                    <InputField
                        id="amountPaid"
                        name="amountPaid"
                        label="Amount Paid"
                        type="text"
                        placeholder="₦0.00"
                        value={
                            formData.amountPaid === 0
                                ? ''
                                : `₦${formData.amountPaid.toLocaleString()}`
                        }
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setFormData({
                                ...formData,
                                amountPaid: value ? Number(value) : 0,
                            });
                        }}
                    />
                    <InputField
                        id="notes"
                        name="notes"
                        label="Notes"
                        type="text"
                        placeholder="Notes"
                        value={formData.notes}
                        onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                        }
                    />
                    <div className="flex items-center space-x-2">
                        <input
                            id="isPaid"
                            name="isPaid"
                            type="checkbox"
                            checked={formData.isPaid}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    isPaid: e.target.checked,
                                })
                            }
                            className="h-4 w-4 border-gray-300 rounded text-orion-blue"
                        />
                        <label
                            htmlFor="isPaid"
                            className="text-sm text-gray-700 mt-2"
                        >
                            Mark as Paid
                        </label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-orion-blue hover:bg-orion-blue h-12"
                        onClick={handleSubmit}
                    >
                        {isLoading ? 'Logging...' : 'Log Service'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

const ServiceTypeForm = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await createHotelServiceType(formData);
            if (response) {
                if (
                    response.message ===
                    'Hotel service type created successfully!'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                }
                mutate('/hotels/other-services');
                setIsLoading(false);
                setFormData({
                    type: '',
                    description: '',
                });
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Something went wrong"
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
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="mt-4 border p-4 rounded-lg">
            <div>
                <h1 className="text-xl font-semibold">Service Type</h1>
                <span className="text-sm text-gray-500">
                    Add a new service type
                </span>
            </div>
            <div className="mt-4">
                <form className="space-y-4">
                    <InputField
                        id="type"
                        label="Service Type"
                        placeholder="e.g. Laundry"
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                    />
                    <InputField
                        id="description"
                        label="Description"
                        placeholder="e.g. Laundry for your room"
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full bg-orion-blue hover:bg-orion-blue h-12"
                    >
                        Add Service Type
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default GuestServiceForm;
