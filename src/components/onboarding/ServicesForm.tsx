'use client';
import { memo, useCallback, useMemo } from 'react';

const options = [
    { label: 'Front Office', value: 'front_office' },
    { label: 'House Keeping', value: 'housekeeping' },
    { label: 'Stock', value: 'stock' },
    { label: 'Restaurant', value: 'restaurant' },
    { label: 'Kitchen', value: 'kitchen' },
    { label: 'Bar', value: 'bar' },
    { label: 'Employee', value: 'employee' },
    { label: 'Banquet', value: 'banquet' },
    { label: 'Membership', value: 'membership' },
    { label: 'Account', value: 'account' },
];

type ServicesSelection = {
    services: string[];
};

type ServicesSelectionProps = ServicesSelection & {
    updateFields: (fields: Partial<ServicesSelection>) => void;
};

const ServiceButton = memo(
    ({
        service,
        isSelected,
        handleSelect,
    }: {
        service: (typeof options)[0];
        isSelected: boolean;
        handleSelect: (value: string) => void;
    }) => (
        <button
            type="button"
            onClick={() => handleSelect(service.value)}
            className={`flex items-center w-full gap-4 border rounded-lg py-3 px-4 text-sm font-medium transition-colors 
            ${
                isSelected
                    ? 'border-orange-500 bg-orange-100 text-orange-600'
                    : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 hover:bg-gray-50'
            }`}
        >
            <span>{service.label}</span>
            <span
                className={`w-6 h-6 flex items-center justify-center border-[1px] rounded-full 
                ${isSelected ? 'border-orange-500' : 'border-gray-400 bg-white'}`}
            >
                {isSelected && (
                    <div className="flex items-center justify-center w-full h-full bg-white rounded-full">
                        <span className="w-3 h-3 flex items-center justify-center rounded-full bg-orange-500"></span>
                    </div>
                )}
            </span>
        </button>
    ),
);
ServiceButton.displayName = 'ServiceButton';

function ServicesForm({ services, updateFields }: ServicesSelectionProps) {
    const memoizedOptions = useMemo(() => options, []);

    const handleSelect = useCallback(
        (value: string) => {
            if (services.includes(value)) {
                updateFields({
                    services: services.filter((option) => option !== value),
                });
            } else {
                updateFields({ services: [...services, value] });
            }
        },
        [services, updateFields],
    );

    return (
        <>
            <div className="text-center mb-6">
                <img
                    src="/logos/service.svg"
                    alt="Lock Icon"
                    className="w-8 h-8 place-self-center mb-6"
                />
                <h1 className="text-4xl font-semibold">Choose Service</h1>
                <p className="text-gray-400 text-sm mt-2 max-w-md">
                    Setting up your shop with Regalia brings you closer to
                    customers and allows you to manage finances at your
                    fingertips.
                </p>
            </div>
            <div className="max-w-xl mx-auto p-4">
                <h2 className="text-2xl font-semibold mb-2">
                    What are you looking to manage
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    You can select up to 3 selections from the list below
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {memoizedOptions.map((service) => {
                        const isSelected = services.includes(service.value);
                        return (
                            <ServiceButton
                                key={service.value}
                                service={service}
                                isSelected={isSelected}
                                handleSelect={handleSelect}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default memo(ServicesForm);
