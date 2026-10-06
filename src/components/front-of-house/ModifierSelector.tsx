'use client';
import { ModifierGroup } from '@/app/actions/modifier';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useRef } from 'react';

interface SelectedModifier {
    modifierGroupId: number;
    modifierOptionId: number;
}

interface ModifierSelectorProps {
    modifierGroups: ModifierGroup[];
    initialSelection?: SelectedModifier[];
    onSelectionChange: (selection: SelectedModifier[]) => void;
}

export default function ModifierSelector({
    modifierGroups,
    initialSelection = [],
    onSelectionChange,
}: ModifierSelectorProps) {
    const [selectedModifiers, setSelectedModifiers] = useState<
        Map<number, number[]>
    >(() => {
        // Initialize from initialSelection on mount only
        const map = new Map<number, number[]>();
        initialSelection.forEach((sel) => {
            const existing = map.get(sel.modifierGroupId) || [];
            map.set(sel.modifierGroupId, [...existing, sel.modifierOptionId]);
        });
        return map;
    });

    // Only update from initialSelection if it changes externally (not from our own updates)
    const prevInitialSelectionRef = useRef<string>(JSON.stringify(initialSelection));
    useEffect(() => {
        const currentSelectionStr = JSON.stringify(initialSelection);
        if (currentSelectionStr !== prevInitialSelectionRef.current) {
            const map = new Map<number, number[]>();
            initialSelection.forEach((sel) => {
                const existing = map.get(sel.modifierGroupId) || [];
                map.set(sel.modifierGroupId, [...existing, sel.modifierOptionId]);
            });
            setSelectedModifiers(map);
            prevInitialSelectionRef.current = currentSelectionStr;
        }
    }, [initialSelection]);

    // Notify parent of selection changes
    useEffect(() => {
        const selection: SelectedModifier[] = [];
        selectedModifiers.forEach((optionIds, groupId) => {
            optionIds.forEach((optionId) => {
                selection.push({ modifierGroupId: groupId, modifierOptionId: optionId });
            });
        });
        onSelectionChange(selection);
    }, [selectedModifiers, onSelectionChange]);

    const handleSingleSelection = (groupId: number, optionId: number) => {
        const newMap = new Map(selectedModifiers);
        newMap.set(groupId, [optionId]);
        setSelectedModifiers(newMap);
    };

    const handleMultipleSelection = (groupId: number, optionId: number) => {
        const newMap = new Map(selectedModifiers);
        const current = newMap.get(groupId) || [];
        const index = current.indexOf(optionId);

        if (index > -1) {
            // Remove if already selected
            newMap.set(groupId, current.filter((id) => id !== optionId));
        } else {
            // Add if not selected
            const group = modifierGroups.find((g) => g.id === groupId);
            if (group) {
                const updated = [...current, optionId];
                // Enforce max selections
                if (group.maxSelections > 0 && updated.length > group.maxSelections) {
                    return; // Don't add if max reached
                }
                newMap.set(groupId, updated);
            }
        }
        setSelectedModifiers(newMap);
    };

    const getTotalPriceAdjustment = (): number => {
        let total = 0;
        selectedModifiers.forEach((optionIds, groupId) => {
            const group = modifierGroups.find((g) => g.id === groupId);
            const options = group?.options ?? [];
            optionIds.forEach((optionId) => {
                const option = options.find((o) => o.id === optionId);
                if (option) {
                    // Ensure price is a number (handle string decimals from backend)
                    const price =
                        typeof option.price === 'string'
                            ? parseFloat(option.price)
                            : Number(option.price) || 0;
                    total += price;
                }
            });
        });
        return total;
    };

    const getSelectedOptions = (groupId: number): number[] => {
        return selectedModifiers.get(groupId) || [];
    };

    const isOptionSelected = (groupId: number, optionId: number): boolean => {
        return getSelectedOptions(groupId).includes(optionId);
    };

    const canSelectMore = (group: ModifierGroup): boolean => {
        if (!group.allowMultiple) return false;
        if (group.maxSelections === 0) return true;
        const selected = getSelectedOptions(group.id).length;
        return selected < group.maxSelections;
    };

    const hasMinSelections = (group: ModifierGroup): boolean => {
        const selected = getSelectedOptions(group.id).length;
        return selected >= group.minSelections;
    };

    if (!modifierGroups || modifierGroups.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {modifierGroups
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((group) => {
                    const availableOptions =
                        group.options?.filter((o) => o.isAvailable) || [];

                    if (availableOptions.length === 0) return null;

                    return (
                        <div key={group.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">
                                    {group.name}
                                    {group.isRequired && (
                                        <Badge variant="destructive" className="ml-2">
                                            Required
                                        </Badge>
                                    )}
                                </Label>
                                {group.allowMultiple &&
                                    group.maxSelections > 0 && (
                                        <span className="text-xs text-gray-500">
                                            Select up to {group.maxSelections}
                                        </span>
                                    )}
                            </div>
                            {group.description && (
                                <p className="text-xs text-gray-500">
                                    {group.description}
                                </p>
                            )}

                            {group.allowMultiple ? (
                                <div className="space-y-2">
                                    {availableOptions
                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                        .map((option) => {
                                            const isSelected = isOptionSelected(
                                                group.id,
                                                option.id,
                                            );
                                            const canSelect = isSelected || canSelectMore(group);

                                            return (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`option-${option.id}`}
                                                        checked={isSelected}
                                                        disabled={!canSelect}
                                                        onCheckedChange={() =>
                                                            handleMultipleSelection(
                                                                group.id,
                                                                option.id,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`option-${option.id}`}
                                                        className={`flex-1 cursor-pointer ${
                                                            !canSelect ? 'opacity-50' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{option.name}</span>
                                                            <span className="text-sm font-medium">
                                                                {option.price > 0
                                                                    ? `+₦${option.price}`
                                                                    : option.price < 0
                                                                      ? `₦${option.price}`
                                                                      : 'Free'}
                                                            </span>
                                                        </div>
                                                        {option.description && (
                                                            <p className="text-xs text-gray-500">
                                                                {option.description}
                                                            </p>
                                                        )}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <RadioGroup
                                    value={String(
                                        getSelectedOptions(group.id)[0] || '',
                                    )}
                                    onValueChange={(value) =>
                                        handleSingleSelection(
                                            group.id,
                                            parseInt(value),
                                        )
                                    }
                                >
                                    {availableOptions
                                        .sort((a, b) => a.displayOrder - b.displayOrder)
                                        .map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <RadioGroupItem
                                                    value={String(option.id)}
                                                    id={`option-${option.id}`}
                                                />
                                                <Label
                                                    htmlFor={`option-${option.id}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>{option.name}</span>
                                                        <span className="text-sm font-medium">
                                                            {option.price > 0
                                                                ? `+₦${option.price}`
                                                                : option.price < 0
                                                                  ? `₦${option.price}`
                                                                  : 'Free'}
                                                        </span>
                                                    </div>
                                                    {option.description && (
                                                        <p className="text-xs text-gray-500">
                                                            {option.description}
                                                        </p>
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                </RadioGroup>
                            )}

                            {group.isRequired &&
                                !hasMinSelections(group) &&
                                getSelectedOptions(group.id).length === 0 && (
                                    <p className="text-xs text-red-500">
                                        Please select at least {group.minSelections}{' '}
                                        option{group.minSelections > 1 ? 's' : ''}
                                    </p>
                                )}

                            <Separator className="my-2" />
                        </div>
                    );
                })}

            {getTotalPriceAdjustment() !== 0 && (
                <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">
                            Total Modifier Adjustment:
                        </span>
                        <span
                            className={`text-sm font-bold ${
                                getTotalPriceAdjustment() > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}
                        >
                            {getTotalPriceAdjustment() > 0 ? '+' : ''}
                            ₦{getTotalPriceAdjustment()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

