import useOrderStore from '@/store/useOrder';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface Item {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
}

const ItemOrderTableAction = ({ item }: { item: Item }) => {
    const { increaseItemQuantity, decreaseItemQuantity, removeItem } =
        useOrderStore();
    const onQuantityChange = (isIncrement: boolean) => {
        if (isIncrement) {
            increaseItemQuantity(Number(item.id));
        } else {
            decreaseItemQuantity(Number(item.id));
        }
    };

    const onRemoveItem = () => {
        removeItem(Number(item.id));
    };

    return (
        <div className="flex items-center gap-2">
            <div className="text-xs rounded-md p-0.5 flex gap-2 items-center justify-center text-gray-500">
                <button
                    className="hover:bg-gray-100 p-1 rounded-sm border-gray-200"
                    onClick={() => onQuantityChange(true)}
                >
                    <Plus className="w-3 h-3" />
                </button>
                <button
                    disabled={item.quantity === 1}
                    className="hover:bg-gray-100 p-1 border-gray-200 rounded-sm"
                    onClick={() => onQuantityChange(false)}
                >
                    <Minus className="w-3 h-3" />
                </button>
                <button
                    onClick={onRemoveItem}
                    className="hover:bg-gray-100 text-destructive cursor-pointer border-gray-200 rounded-sm"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export const ItemOrderTableActionForUpdate = ({
    item,
    originalItemIds,
    originalItemQuantities,
    canRemoveItems = true,
}: {
    item: Item;
    originalItemIds: Set<number>;
    originalItemQuantities?: Map<number, number>;
    canRemoveItems?: boolean;
}) => {
    const { increaseItemQuantity, decreaseItemQuantity, removeItem } =
        useOrderStore();
    const onQuantityChange = (isIncrement: boolean) => {
        if (isIncrement) {
            increaseItemQuantity(Number(item.id));
        } else {
            decreaseItemQuantity(Number(item.id));
        }
    };

    const onRemoveItem = () => {
        removeItem(Number(item.id));
    };

    const isOriginalItem = originalItemIds.has(Number(item.id));
    const originalQty = originalItemQuantities?.get(Number(item.id)) ?? 0;

    // For managers (canRemoveItems=false): disable decrease button if at or below original quantity
    // For creators (canRemoveItems=true): only disable if quantity is 1
    const isDecreaseDisabled = isOriginalItem && !canRemoveItems
        ? item.quantity <= originalQty
        : item.quantity === 1;

    return (
        <div className="flex items-center gap-2">
            <div className="text-xs rounded-md p-0.5 flex gap-2 items-center justify-center text-gray-500">
                <button
                    className="hover:bg-gray-100 p-1 rounded-sm border-gray-200"
                    onClick={() => onQuantityChange(true)}
                >
                    <Plus className="w-3 h-3" />
                </button>
                <button
                    disabled={isDecreaseDisabled}
                    className={`hover:bg-gray-100 p-1 border-gray-200 rounded-sm ${isDecreaseDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                    onClick={() => onQuantityChange(false)}
                    title={
                        isOriginalItem && !canRemoveItems && item.quantity <= originalQty
                            ? `Cannot reduce below original quantity (${originalQty})`
                            : undefined
                    }
                >
                    <Minus className="w-3 h-3" />
                </button>
                <button
                    onClick={onRemoveItem}
                    className="hover:bg-gray-100 text-destructive cursor-pointer border-gray-200 rounded-sm"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ItemOrderTableAction;
