import { cn } from '@/lib/utils';
import useOrderStore, { Order } from '@/store/useOrder';
import { Eye, Pencil } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Textarea } from '../ui/textarea';
import { ItemCategory } from './data/types/types';

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    basePrice: number;
    quantity: number;
    category: ItemCategory;
    subCategory: string;
    imageUrl?: string;
    specialInstructions?: string;
    notes?: string;
    menuItem?: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string;
    };
}

export const MenuItemCard = ({
    item,
    selectedItem,
    onItemSelect,
}: {
    item: MenuItem;
    selectedItem?: MenuItem;
    onItemSelect: (item: MenuItem) => void;
    onQuantityChange: (id: number, increase: boolean) => void;
}) => {
    const { addSpecialInstructions } = useOrderStore();
    const [tempInstructions, setTempInstructions] = useState(
        selectedItem?.notes || '',
    );
    const isChecked = selectedItem !== undefined;
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [item.imageUrl]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div
                key={item.id + 'card-image-section'}
                className={cn(
                    'relative w-full h-32 cursor-pointer rounded-lg overflow-hidden',
                    'transition-all duration-300 ease-in-out transform group',
                    isChecked ? 'scale-[1.02]' : 'hover:scale-[1.02]',
                )}
                onClick={() => onItemSelect(item)}
            >
                {/* Image */}
                {item.imageUrl && item.imageUrl !== '' && !imageError ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        className="object-cover rounded-lg z-10"
                        fill
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <Image
                        src={'https://placehold.co/600x400?text=No+Image'}
                        alt={item.name}
                        className="object-cover rounded-lg z-10"
                        fill
                        onError={() => setImageError(true)}
                    />
                )}

                {/* Overlay */}
                <div
                    className={cn(
                        'absolute inset-0 z-20 rounded-lg transition-opacity duration-200 ease-in-out',
                        item.imageUrl && item.imageUrl !== ''
                            ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent'
                            : 'bg-gradient-to-t from-black/80 via-black/40 to-transparent',
                        isChecked
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100',
                    )}
                />

                {/* Checkbox */}
                <Checkbox
                    checked={isChecked}
                    className="absolute top-2 left-2 z-30 bg-white shadow-none border-muted-foreground rounded-full w-6 h-6 data-[state=checked]:border-hexbrand data-[state=checked]:bg-hexbrand data-[state=checked]:text-white"
                    onClick={(e) => e.stopPropagation()}
                />
                {/* Dialog for Item Details (View Button) */}
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-2 right-2 z-30 bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                            aria-label="View item details"
                        >
                            <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] z-50">
                        <DialogHeader>
                            <DialogTitle>{item.name}</DialogTitle>
                            <DialogDescription>
                                {item.description}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {item.imageUrl && (
                                <div className="relative w-full h-48">
                                    {item.imageUrl &&
                                    item.imageUrl !== '' &&
                                    !imageError ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="object-cover rounded-lg z-10"
                                            fill
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <Image
                                            src={
                                                'https://placehold.co/600x400?text=No+Image'
                                            }
                                            alt={item.name}
                                            className="object-cover rounded-lg z-10"
                                            fill
                                            onError={() => setImageError(true)}
                                        />
                                    )}
                                </div>
                            )}
                            <div className="flex mt-auto justify-between items-center">
                                <span className="font-semibold">Price</span>
                                <span className="font-bold text-hexbrand">
                                    NGN{' '}
                                    {new Intl.NumberFormat('en-NG').format(
                                        Number(item.price),
                                    )}
                                </span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex flex-col gap-1 py-0 w-full">
                <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-hexbrand font-semibold line-clamp-1 leading-4 flex-grow">
                        {item.name}
                    </p>
                    {/* Popover for Special Instructions */}
                    {isChecked && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className=" text-muted-foreground hover:text-foreground rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 flex-shrink-0"
                                    aria-label="Edit special instructions"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-64 sm:w-72 z-[51] p-4"
                                onClick={(e) => e.stopPropagation()}
                                align="start"
                                sideOffset={5}
                            >
                                <div className="grid gap-3">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium leading-none">
                                            Special Instructions
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            Add any specific requests for this
                                            item.
                                        </p>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor={`special-instructions-popover-${item.id}`}
                                            className="text-xs sr-only"
                                        >
                                            Instructions{' '}
                                        </Label>
                                        <Textarea
                                            id={`special-instructions-popover-${item.id}`}
                                            value={tempInstructions}
                                            onChange={(e) => {
                                                setTempInstructions(
                                                    e.target.value,
                                                );
                                                addSpecialInstructions(
                                                    item.id,
                                                    e.target.value,
                                                );
                                            }}
                                            className="min-h-[70px] resize-none text-sm"
                                            placeholder="e.g., No onions, extra spicy."
                                        />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                <span
                    className={cn(
                        'text-xs line-clamp-1 leading-4 text-muted-foreground',
                    )}
                >
                    {item.description}
                </span>

                {item.notes && item.notes.trim() !== '' && (
                    <p className="text-xs italic text-muted-foreground mt-1 line-clamp-2 leading-snug">
                        <span className="font-semibold">Notes:</span>{' '}
                        {item.notes}
                    </p>
                )}
            </div>
        </div>
    );
};

export const MenuItemGrid = ({
    items,
    order,
    addItem,
    handleQuantityChange,
}: {
    items: any[];
    order: Order;
    addItem: (item: MenuItem) => void;
    handleQuantityChange: (id: number, increase: boolean) => void;
}) => {
    const MenuItemGrid = useMemo(
        () => (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6 py-2 gap-3 sm:gap-2 md:gap-4">
                {items?.map((item) => (
                    <MenuItemCard
                        key={item.id}
                        item={item}
                        selectedItem={(order.items as MenuItem[]).find(
                            (i) => i.id === item.id,
                        )}
                        onItemSelect={addItem}
                        onQuantityChange={handleQuantityChange}
                    />
                ))}
            </div>
        ),
        [items, order.items, addItem, handleQuantityChange],
    );
    return MenuItemGrid;
};
