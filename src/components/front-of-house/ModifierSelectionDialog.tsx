'use client';
import { ModifierGroup } from '@/app/actions/modifier';
import ModifierSelector from './ModifierSelector';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useRef } from 'react';

interface SelectedModifier {
    modifierGroupId: number;
    modifierOptionId: number;
}

interface ModifierSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modifierGroups: ModifierGroup[];
    itemName: string;
    basePrice: number;
    onConfirm: (
        selectedModifiers: SelectedModifier[],
        totalPrice: number,
    ) => void;
    initialSelection?: SelectedModifier[];
}

export default function ModifierSelectionDialog({
    open,
    onOpenChange,
    modifierGroups,
    itemName,
    basePrice,
    onConfirm,
    initialSelection = [],
}: ModifierSelectionDialogProps) {
    const [selectedModifiers, setSelectedModifiers] = useState<
        SelectedModifier[]
    >([]);
    const [modifierPriceAdjustment, setModifierPriceAdjustment] = useState(0);
    const prevOpenRef = useRef(open);

    // Reset selection when dialog opens
    useEffect(() => {
        if (open && !prevOpenRef.current) {
            // Dialog just opened, reset to initial selection
            setSelectedModifiers(initialSelection);
        }
        prevOpenRef.current = open;
    }, [open, initialSelection]);

    useEffect(() => {
        // Calculate price adjustment from selected modifiers
        let adjustment = 0;
        selectedModifiers.forEach((sel) => {
            const group = modifierGroups.find(
                (g) => g.id === sel.modifierGroupId,
            );
            if (group?.options) {
                const option = group.options.find(
                    (o) => o.id === sel.modifierOptionId,
                );
                if (option) {
                    // Ensure price is a number (handle string decimals from backend)
                    const price =
                        typeof option.price === 'string'
                            ? parseFloat(option.price)
                            : Number(option.price) || 0;
                    adjustment += price;
                }
            }
        });
        setModifierPriceAdjustment(adjustment);
    }, [selectedModifiers, modifierGroups]);

    // Ensure both basePrice and modifierPriceAdjustment are numbers
    const basePriceNum =
        typeof basePrice === 'string'
            ? parseFloat(basePrice)
            : Number(basePrice) || 0;
    const adjustmentNum =
        typeof modifierPriceAdjustment === 'string'
            ? parseFloat(modifierPriceAdjustment)
            : Number(modifierPriceAdjustment) || 0;
    const totalPrice = basePriceNum + adjustmentNum;

    const handleConfirm = () => {
        // Validate required modifiers
        const requiredGroups = modifierGroups.filter((g) => g.isRequired);
        const allRequiredSelected = requiredGroups.every((group) => {
            const selected = selectedModifiers.filter(
                (s) => s.modifierGroupId === group.id,
            );
            return selected.length >= group.minSelections;
        });

        if (!allRequiredSelected) {
            return; // Don't close if required modifiers not selected
        }

        onConfirm(selectedModifiers, totalPrice);
        onOpenChange(false);
    };

    const handleCancel = () => {
        setSelectedModifiers(initialSelection);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Customize {itemName}</DialogTitle>
                    <DialogDescription>
                        Select your preferred options for this item
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <ModifierSelector
                        key={open ? 'open' : 'closed'}
                        modifierGroups={modifierGroups}
                        initialSelection={initialSelection}
                        onSelectionChange={setSelectedModifiers}
                    />
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>Base Price:</span>
                            <span>
                                ₦
                                {basePriceNum.toLocaleString('en-NG', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        {adjustmentNum !== 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Modifier Adjustment:</span>
                                <span
                                    className={
                                        adjustmentNum > 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }
                                >
                                    {adjustmentNum > 0 ? '+' : ''}₦
                                    {adjustmentNum.toLocaleString('en-NG', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-hexbrand">
                                ₦
                                {totalPrice.toLocaleString('en-NG', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} className="bg-orion-blue">
                        Add to Order
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
