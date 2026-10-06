'use client';

import { InputField } from '@/components/common/Form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Food } from '../types';

const categories = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
];

const catalogItems = [
    { value: 'pizza', label: 'Pizza', category: 'breakfast', defaultCost: '0' },
    {
        value: 'hamburger',
        label: 'Hamburger',
        category: 'lunch',
        defaultCost: '0',
    },
    { value: 'hotdog', label: 'Hotdog', category: 'dinner', defaultCost: '0' },
    { value: 'salad', label: 'Salad', category: 'lunch', defaultCost: '0' },
    {
        value: 'pancakes',
        label: 'Pancakes',
        category: 'breakfast',
        defaultCost: '0',
    },
    { value: 'steak', label: 'Steak', category: 'dinner', defaultCost: '0' },
];

const ItemCard = ({
    item,
    isSelected,
    onToggle,
}: {
    item: (typeof catalogItems)[number];
    isSelected: boolean;
    onToggle: () => void;
}) => (
    <button
        type="button"
        onClick={onToggle}
        className={cn(
            'flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border min-w-[120px] text-left',
            isSelected && 'border-hexbrand ring-1 ring-hexbrand',
        )}
    >
        <div className="w-full flex justify-end mb-2">
            <Checkbox
                checked={isSelected}
                onCheckedChange={onToggle}
                className="w-5 h-5"
            />
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">🍽️</span>
        </div>
        <p className="text-sm font-medium text-gray-800">{item.label}</p>
    </button>
);

interface FoodSelectProps {
    value: Food[];
    onChange: (food: Food[]) => void;
}

const FoodSelect = ({ value, onChange }: FoodSelectProps) => {
    const selectedKeys = new Set(value.map((f) => f.name.toLowerCase()));

    const toggleItem = (catalogKey: string) => {
        const item = catalogItems.find((i) => i.value === catalogKey);
        if (!item) return;
        const key = item.label.toLowerCase();

        if (selectedKeys.has(key)) {
            onChange(value.filter((f) => f.name.toLowerCase() !== key));
        } else {
            const id = Math.max(0, ...value.map((f) => f.id), 0) + 1;
            onChange([
                ...value,
                {
                    id,
                    name: item.label,
                    description: item.category,
                    cost: item.defaultCost,
                    quantity: '1',
                },
            ]);
        }
    };

    const updateFoodLine = (
        name: string,
        field: 'cost' | 'quantity',
        fieldValue: string,
    ) => {
        const key = name.toLowerCase();
        onChange(
            value.map((f) =>
                f.name.toLowerCase() === key
                    ? { ...f, [field]: fieldValue }
                    : f,
            ),
        );
    };

    const getItemsByCategory = (categoryValue: string) =>
        catalogItems.filter((item) => item.category === categoryValue);

    return (
        <div className="space-y-6">
            {categories.map((category) => {
                const categoryItems = getItemsByCategory(category.value);
                if (categoryItems.length === 0) return null;

                return (
                    <div key={category.value} className="space-y-3">
                        <h3 className="text-base text-gray-700">
                            {category.label}
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {categoryItems.map((item) => (
                                <ItemCard
                                    key={item.value}
                                    item={item}
                                    isSelected={selectedKeys.has(
                                        item.label.toLowerCase(),
                                    )}
                                    onToggle={() => toggleItem(item.value)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {value.length > 0 ? (
                <div className="space-y-3 rounded-lg border p-4 bg-gray-50">
                    <p className="text-sm font-semibold">
                        Selected food — set price per item (optional)
                    </p>
                    {value.map((item) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end border-b pb-3 last:border-0"
                        >
                            <div className="md:col-span-1">
                                <p className="text-sm font-medium">
                                    {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {item.description}
                                </p>
                            </div>
                            <InputField
                                id={`food-cost-${item.id}`}
                                label="Unit price"
                                type="number"
                                name={`cost-${item.id}`}
                                value={item.cost}
                                onChange={(e) =>
                                    updateFoodLine(
                                        item.name,
                                        'cost',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputField
                                id={`food-qty-${item.id}`}
                                label="Quantity"
                                type="number"
                                name={`qty-${item.id}`}
                                value={item.quantity}
                                onChange={(e) =>
                                    updateFoodLine(
                                        item.name,
                                        'quantity',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default FoodSelect;
