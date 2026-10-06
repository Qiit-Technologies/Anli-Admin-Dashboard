import React, { useState } from 'react';
import { BiTrash } from 'react-icons/bi';

export interface Service {
    name: string;
    price: number;
    notes: string;
    status: string;
}

interface AdditionalServicesProps {
    data: Service[];
    onChange: (newData: Service[]) => void;
}

const AdditionalServices = ({ data, onChange }: AdditionalServicesProps) => {
    const [services, setServices] = useState<Service[]>(data);

    const updateServices = (newServices: Service[]) => {
        setServices(newServices);
        onChange(newServices);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
    ) => {
        const { name, value } = e.target;
        updateServices(
            services.map((service, i) =>
                i === index ? { ...service, [name]: value } : service,
            ),
        );
    };

    const addService = () => {
        updateServices([
            ...services,
            { name: '', price: 0, notes: '', status: '' },
        ]);
    };

    const removeService = (index: number) => {
        updateServices(services.filter((_, i) => i !== index));
    };

    return (
        <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Additional Services</h2>
            {services.map((service, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="border p-2 rounded w-full"
                            placeholder="Breakfast"
                            value={service.name}
                            onChange={(e) => handleInputChange(e, index)}
                            aria-label="name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            Price (₦)
                        </label>
                        <input
                            type="number"
                            name="price"
                            className="border p-2 rounded w-full"
                            placeholder="20"
                            min="0"
                            step="0.01"
                            value={service.price}
                            onChange={(e) => handleInputChange(e, index)}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            className="border p-2 rounded w-full"
                            placeholder="Any additional notes..."
                            value={service.notes}
                            onChange={(e) => handleInputChange(e, index)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Status
                        </label>
                        <select
                            name="status"
                            className="border p-2 rounded w-full"
                            value={service.status}
                            onChange={(e: any) => handleInputChange(e, index)}
                        >
                            <option value="">Select Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="SCHEDULED">Scheduled</option>
                        </select>
                    </div>

                    <div className="col-span-2 flex justify-end">
                        <button
                            type="button"
                            className="text-red-500 hover:text-red-700 flex items-center"
                            onClick={() => removeService(index)}
                        >
                            <BiTrash className="mr-2" /> Remove Service
                        </button>
                    </div>
                </div>
            ))}

            <button
                type="button"
                className="bg-orion-blue text-xs font-bold text-white px-4 py-2 rounded mt-4"
                onClick={addService}
            >
                Add Additional Service
            </button>
        </div>
    );
};

export default AdditionalServices;
