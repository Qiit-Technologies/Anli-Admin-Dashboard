import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency } from '@/lib/utils';
import { Martini, Minus, Plus, Utensils } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface MenuItemCardProps {
    item: any;
    orderItems: any[];
    onAdd: () => void;
    onRemove: () => void;
    onIncrease: () => void;
    onDecrease: () => void;
    onSpecialInstructionsChange: (instructions: string) => void;
}

export const MenuItemCard = ({
    item,
    orderItems,
    onAdd,
    onRemove,
    onIncrease,
    onDecrease,
    onSpecialInstructionsChange,
}: MenuItemCardProps) => {
    const quantity = orderItems.find((i) => i.id === item.id)?.quantity || 0;
    const isInOrder = quantity > 0;
    const [imageError, setImageError] = useState(false);

    const hasItem = (itemId: number) => {
        return orderItems.some((i) => i.id === itemId);
    };

    return (
        <div
            className={`bg-white rounded-lg border overflow-hidden transition-all ${!item.isAvailable ? 'opacity-70' : 'hover:shadow-md'}`}
        >
            <div className="w-full h-40 relative">
                {item.imageUrl ? (
                    item.imageUrl && item.imageUrl !== '' && !imageError ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.name}
                            className="object-cover z-10"
                            fill
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <Image
                            src={'https://placehold.co/100x100?text=No+Image'}
                            alt={item.name}
                            className="object-cover z-10"
                            fill
                            onError={() => setImageError(true)}
                        />
                    )
                ) : (
                    <div className="flex items-center border-b justify-center h-full">
                        {item?.category?.name === 'Drink' ? (
                            <Martini className="h-14 w-14 text-gray-400" />
                        ) : (
                            <Utensils className="h-14 w-14 text-gray-400" />
                        )}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg">
                            {item?.name}
                            {!item?.isAvailable && (
                                <span className="ml-2 text-sm text-red-500">
                                    (Sold Out)
                                </span>
                            )}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {item?.description}
                        </p>
                    </div>
                    <span className="font-medium">
                        {formatCurrency(item?.price)}
                    </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onDecrease}
                            disabled={!isInOrder || !item.isAvailable}
                            className="h-8 w-8"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm w-6 text-center">
                            {quantity}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onIncrease}
                            disabled={!item.isAvailable}
                            className="h-8 w-8"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        variant={hasItem(item.id) ? 'destructive' : 'default'}
                        size="sm"
                        onClick={!hasItem(item.id) ? onAdd : onRemove}
                        disabled={!item.isAvailable}
                        className={cn(
                            hasItem(item.id)
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-hexbrand hover:bg-hexbrand/10 text-white',
                        )}
                    >
                        {hasItem(item.id) ? 'Remove' : 'Add'}
                    </Button>
                </div>

                {isInOrder && (
                    <div className="mt-3">
                        <Textarea
                            placeholder="Special instructions..."
                            value={
                                orderItems.find((i) => i.id === item.id)
                                    ?.notes || ''
                            }
                            onChange={(e) =>
                                onSpecialInstructionsChange(e.target.value)
                            }
                            className="w-full text-sm focus-visible:ring-hexbrand"
                            rows={2}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
