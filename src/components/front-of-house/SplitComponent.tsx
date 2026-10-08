'use client';

import {
    createSplitBill,
    type CreateSplitBillData,
} from '@/app/actions/split-bill';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Info, Plus, Receipt, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import BrandButton from '../common/Button';

interface OrderItem {
    id: number;
    orderItemId?: number;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    items: OrderItem[];
    guestName?: string;
    guestPhoneNumber?: string;
    guestEmail?: string;
}

interface SplitGroup {
    id: number;
    name: string;
    items: OrderItem[];
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    paymentMethod?: string;
    percentage?: number;
    customAmount?: number;
}

interface SplitOrderProps {
    order: Order;
    onConfirmSplit: () => void;
}

export default function SplitOrder({
    order,
    onConfirmSplit,
}: Readonly<SplitOrderProps>) {
    const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([
        {
            id: 1,
            name: 'Split 1',
            items: [],
            customerName: order.guestName,
            customerPhone: order.guestPhoneNumber,
            customerEmail: order.guestEmail,
        },
        { id: 2, name: 'Split 2', items: [] },
    ]);
    const [assignedItems, setAssignedItems] = useState(new Set<number>());
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [splitCompleted, setSplitCompleted] = useState(false);
    const [activeSplitMode, setActiveSplitMode] = useState<
        'equal' | 'percentage' | null
    >(null);

    const addSplitGroup = () => {
        const newId = Math.max(...splitGroups.map((g) => g.id)) + 1;
        const next = [
            ...splitGroups,
            { id: newId, name: `Split ${newId}`, items: [] },
        ];

        if (activeSplitMode === 'equal') {
            const totalAmount = getOrderTotal();
            const equalAmount = totalAmount / next.length;
            const balanced = distributeItemsEquallyByAmount(next);
            const newGroups = balanced.map((group) => ({
                ...group,
                customAmount: equalAmount,
                percentage: undefined,
            }));
            setSplitGroups(newGroups);
            const newAssignedItems = new Set<number>();
            newGroups.forEach((group) => {
                group.items.forEach((item) => newAssignedItems.add(item.id));
            });
            setAssignedItems(newAssignedItems);
            return;
        }
        if (activeSplitMode === 'percentage') {
            const defaultPercent = Math.floor((100 / next.length) * 100) / 100;
            const remainder = 100 - defaultPercent * next.length;
            const totalAmount = getOrderTotal();
            const newGroups = next.map((group, index) => {
                const pct =
                    index === 0 ? defaultPercent + remainder : defaultPercent;
                const amount = (totalAmount * pct) / 100;
                return {
                    ...group,
                    percentage: Number(pct.toFixed(2)),
                    customAmount: Math.round(amount * 100) / 100,
                };
            });
            setSplitGroups(newGroups);
            return;
        }
        setSplitGroups(next);
    };

    const removeSplitGroup = (groupId: number) => {
        if (splitGroups.length <= 2) return;
        const groupToRemove = splitGroups.find((g) => g.id === groupId);
        if (groupToRemove) {
            groupToRemove.items.forEach((item) => {
                setAssignedItems((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(item.id);
                    return newSet;
                });
            });
        }
        const remaining = splitGroups.filter((g) => g.id !== groupId);

        if (activeSplitMode === 'equal') {
            const totalAmount = getOrderTotal();
            const equalAmount = totalAmount / remaining.length;
            const balanced = distributeItemsEquallyByAmount(remaining);
            const newGroups = balanced.map((group) => ({
                ...group,
                customAmount: equalAmount,
                percentage: undefined,
            }));
            setSplitGroups(newGroups);
            const newAssignedItems = new Set<number>();
            newGroups.forEach((group) => {
                group.items.forEach((item) => newAssignedItems.add(item.id));
            });
            setAssignedItems(newAssignedItems);
            return;
        }
        if (activeSplitMode === 'percentage') {
            const defaultPercent =
                Math.floor((100 / remaining.length) * 100) / 100;
            const remainderPct = 100 - defaultPercent * remaining.length;
            const totalAmount = getOrderTotal();
            const newGroups = remaining.map((group, index) => {
                const pct =
                    index === 0
                        ? defaultPercent + remainderPct
                        : defaultPercent;
                const amount = (totalAmount * pct) / 100;
                return {
                    ...group,
                    percentage: Number(pct.toFixed(2)),
                    customAmount: Math.round(amount * 100) / 100,
                };
            });
            setSplitGroups(newGroups);
            return;
        }
        setSplitGroups(remaining);
    };

    const toggleItemInGroup = (item: OrderItem, groupId: number) => {
        setSplitGroups((prevGroups) => {
            const wasItemInTargetGroup = prevGroups
                .find((g) => g.id === groupId)
                ?.items.some((i) => i.id === item.id);

            const newGroups = prevGroups.map((group) => {
                const updatedItems = group.items.filter(
                    (i) => i.id !== item.id,
                );

                if (group.id === groupId && !wasItemInTargetGroup) {
                    return { ...group, items: [...updatedItems, item] };
                }

                return { ...group, items: updatedItems };
            });

            const newAssignedItems = new Set<number>();
            newGroups.forEach((group) => {
                group.items.forEach((i) => newAssignedItems.add(i.id));
            });
            setAssignedItems(newAssignedItems);

            return newGroups;
        });
    };

    const resetSplit = () => {
        setSplitGroups([
            { id: 1, name: 'Split 1', items: [] },
            { id: 2, name: 'Split 2', items: [] },
        ]);
        setAssignedItems(new Set());
    };

    const clearSplitAmounts = () => {
        setSplitGroups(
            splitGroups.map((group) => ({
                ...group,
                customAmount: undefined,
                percentage: undefined,
            })),
        );
        setActiveSplitMode(null);
    };

    const getOrderTotal = () =>
        order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const getGroupAssignedTotal = (group: SplitGroup) =>
        group.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const distributeItemsEquallyByAmount = (targetGroups?: SplitGroup[]) => {
        const baseGroups = targetGroups ?? splitGroups;
        const groups = baseGroups.map((g) => ({
            ...g,
            items: [] as OrderItem[],
        }));
        const itemsSorted = [...order.items].sort(
            (a, b) => b.price * b.quantity - a.price * a.quantity,
        );
        for (const item of itemsSorted) {
            let targetIndex = 0;
            let minTotal = Number.POSITIVE_INFINITY;
            groups.forEach((g, idx) => {
                const t = getGroupAssignedTotal(g);
                if (t < minTotal) {
                    minTotal = t;
                    targetIndex = idx;
                }
            });
            groups[targetIndex].items = [...groups[targetIndex].items, item];
        }
        return groups;
    };

    const validateBeforeSubmit = (): { valid: boolean; message?: string } => {
        const allAssigned = order.items.every((i) => assignedItems.has(i.id));
        if (!allAssigned) {
            return {
                valid: false,
                message:
                    'Please assign all items to split groups before confirming.',
            };
        }

        const percentages = splitGroups
            .map((g) => g.percentage || 0)
            .filter((p) => p > 0);
        if (percentages.length > 0) {
            const sum = percentages.reduce((a, b) => a + b, 0);
            if (Math.abs(sum - 100) > 0.01) {
                return {
                    valid: false,
                    message: 'Percentages must sum to 100%.',
                };
            }
        }

        for (const group of splitGroups) {
            if (group.customerPhone) {
                const digitsOnly = group.customerPhone.replace(/\D/g, '');
                if (digitsOnly.length < 10 || digitsOnly.length > 11) {
                    return {
                        valid: false,
                        message: `Phone number for "${group.name}" must be 10-11 digits.`,
                    };
                }
            }
        }

        return { valid: true };
    };

    const applyEqualSplit = () => {
        const hasAnyAssigned = splitGroups.some((g) => g.items.length > 0);
        if (hasAnyAssigned) {
            const proceed = window.confirm(
                'Equal split will redistribute items across groups. Continue?',
            );
            if (!proceed) return;
        }

        const totalAmount = getOrderTotal();
        const equalAmount = totalAmount / splitGroups.length;

        const balanced = distributeItemsEquallyByAmount();
        const newGroups = balanced.map((group) => ({
            ...group,
            customAmount: equalAmount,
            percentage: undefined,
        }));

        setSplitGroups(newGroups);
        setActiveSplitMode('equal');

        const newAssignedItems = new Set<number>();
        newGroups.forEach((group) => {
            group.items.forEach((item) => newAssignedItems.add(item.id));
        });
        setAssignedItems(newAssignedItems);

        toast.custom(() => (
            <Toast
                title="Success"
                description={`Items distributed equally among ${splitGroups.length} groups`}
                type="success"
            />
        ));
    };

    const applyPercentageSplit = () => {
        const hasAnyAssigned = splitGroups.some((g) => g.items.length > 0);
        if (hasAnyAssigned) {
            const proceed = window.confirm(
                'Applying percentages will set target amounts for groups but will not move items. Continue?',
            );
            if (!proceed) return;
        }

        const defaultPercent =
            Math.floor((100 / splitGroups.length) * 100) / 100;
        const remainder = 100 - defaultPercent * splitGroups.length;
        const totalAmount = getOrderTotal();

        const newGroups = splitGroups.map((group, index) => {
            const pct =
                index === 0 ? defaultPercent + remainder : defaultPercent;
            const amount = (totalAmount * pct) / 100;
            return {
                ...group,
                percentage: Number(pct.toFixed(2)),
                customAmount: Math.round(amount * 100) / 100,
            };
        });

        setSplitGroups(newGroups);
        setActiveSplitMode('percentage');

        toast.custom(() => (
            <Toast
                title="Success"
                description="Percentage split targets set successfully"
                type="success"
            />
        ));
    };

    const updateGroupCustomer = (
        groupId: number,
        field: string,
        value: string,
    ) => {
        setSplitGroups(
            splitGroups.map((group) =>
                group.id === groupId ? { ...group, [field]: value } : group,
            ),
        );
    };

    const calculateGroupTotal = (items: OrderItem[]) => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const handleConfirmSplit = async () => {
        try {
            const allAssignedItems = new Set<number>();
            splitGroups.forEach((group) => {
                group.items.forEach((item) => allAssignedItems.add(item.id));
            });

            const unassignedItems = order.items.filter(
                (item) => !allAssignedItems.has(item.id),
            );

            if (unassignedItems.length > 0) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description="Please assign all items to split groups before confirming."
                        type="error"
                    />
                ));
                return;
            }

            const missingNames = splitGroups
                .filter((g) => g.items.length > 0 && !g.customerName?.trim())
                .map((g) => g.name);

            if (missingNames.length > 0) {
                setShowCustomerDetails(true);
                toast.custom(() => (
                    <Toast
                        title="Validation Error"
                        description={`Please enter a customer name for: ${missingNames.join(', ')}`}
                        type="error"
                    />
                ));
                return;
            }

            const validation = validateBeforeSubmit();
            if (!validation.valid) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            validation.message ?? 'Invalid split configuration.'
                        }
                        type="error"
                    />
                ));
                return;
            }

            setIsSubmitting(true);
            const groupsWithItems = splitGroups.filter(
                (group) => group.items.length > 0,
            );

            const results = [];
            for (let index = 0; index < groupsWithItems.length; index += 1) {
                const group = groupsWithItems[index];
                const splitBillData: CreateSplitBillData = {
                    originalOrderId: order.id,
                    items: group.items.map((item) => ({
                        orderItemId: item.orderItemId ?? item.id,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: item.price * item.quantity,
                    })),
                    customerName: group.customerName || `Split ${index + 1}`,
                    customerPhone: group.customerPhone,
                    customerEmail: group.customerEmail,
                    paymentMethod: group.paymentMethod,
                    percentage: group.percentage,
                    customAmount: group.customAmount,
                    splitMethod: group.percentage
                        ? 'PERCENTAGE'
                        : group.customAmount
                          ? 'AMOUNT'
                          : 'ITEM_BASED',
                };

                const result = await createSplitBill(splitBillData);
                results.push(result);
                if (result?.error) {
                    break;
                }
            }
            const errors = results.filter((result) => result?.error);

            if (errors.length > 0) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            errors.map((error) => error?.error).join(', ') ||
                            'Failed to create some split bills. Please try again.'
                        }
                        type="error"
                    />
                ));
                return;
            }

            toast.custom(() => (
                <Toast
                    title="Success"
                    description="Order split successfully!"
                    type="success"
                />
            ));

            setSplitCompleted(true);
            onConfirmSplit();
        } catch (error: any) {
            console.error('Error:', error);
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={` ${error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'} `}
                    type="error"
                />
            ));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-none">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        Split Order <Badge variant="outline">{order.id}</Badge>
                    </CardTitle>
                    <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="px-2 py-1 bg-muted/60 rounded">
                            Items: {order.items?.length || 0}
                        </div>
                        <div className="px-2 py-1 bg-muted/60 rounded">
                            Assigned: {Array.from(assignedItems).length}
                        </div>
                        <div className="px-2 py-1 bg-muted/60 rounded">
                            Unassigned:{' '}
                            {Math.max(
                                0,
                                (order.items?.length || 0) -
                                    Array.from(assignedItems).length,
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {(order.items?.length || 0) - Array.from(assignedItems).length >
                    0 && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                        <Info className="w-4 h-4 mt-0.5" />
                        <div className="text-xs">
                            {Math.max(
                                0,
                                (order.items?.length || 0) -
                                    Array.from(assignedItems).length,
                            )}{' '}
                            item
                            {Math.max(
                                0,
                                (order.items?.length || 0) -
                                    Array.from(assignedItems).length,
                            ) > 1
                                ? 's'
                                : ''}{' '}
                            not assigned yet. Assign all items or use Equal
                            Split to auto-distribute.
                        </div>
                    </div>
                )}
                <div>
                    <h3 className="font-semibold mb-3">Original Order Items</h3>
                    <div className="space-y-2">
                        {order.items.map((item) => {
                            const isAssigned = assignedItems.has(item.id);
                            return (
                                <div
                                    key={item.id}
                                    className={`rounded-lg border p-4 transition-colors ${
                                        isAssigned
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white hover:border-muted-foreground/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm mb-1">
                                                {item.name}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>
                                                    Qty: {item.quantity}
                                                </span>
                                                <span>
                                                    Unit Price:{' '}
                                                    {item.price.toLocaleString(
                                                        'en-NG',
                                                        {
                                                            style: 'currency',
                                                            currency: 'NGN',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="font-semibold text-sm">
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toLocaleString('en-NG', {
                                                        style: 'currency',
                                                        currency: 'NGN',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Total
                                                </div>
                                            </div>
                                            {isAssigned && (
                                                <Badge
                                                    variant="outline"
                                                    className="h-5 text-[10px] text-green-700 border-green-300 bg-green-100"
                                                >
                                                    Assigned
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Split Groups</h3>
                        <div className="flex items-center gap-3">
                            <Tabs
                                value={activeSplitMode ?? 'manual'}
                                onValueChange={(v) => {
                                    if (v === 'equal') return applyEqualSplit();
                                    if (v === 'percentage')
                                        return applyPercentageSplit();
                                    clearSplitAmounts();
                                }}
                            >
                                <TabsList>
                                    <TabsTrigger value="manual">
                                        Manual
                                    </TabsTrigger>
                                    <TabsTrigger value="equal">
                                        Equal
                                    </TabsTrigger>
                                    <TabsTrigger value="percentage">
                                        Percentage
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <Button
                                onClick={() =>
                                    setShowCustomerDetails(!showCustomerDetails)
                                }
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                <Receipt className="w-4 h-4" />
                                Customer Details
                            </Button>
                            <Button
                                onClick={clearSplitAmounts}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Clear Amounts
                            </Button>
                            <Button
                                onClick={addSplitGroup}
                                size="sm"
                                variant="outline"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Split
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {splitGroups.map((group) => {
                            const groupTotal = calculateGroupTotal(group.items);
                            const hasTarget =
                                typeof group.customAmount === 'number';
                            const target = Number(group.customAmount || 0);
                            const diff = hasTarget ? target - groupTotal : 0;
                            const progressPct = hasTarget
                                ? Math.min(
                                      100,
                                      Math.max(
                                          0,
                                          Math.round(
                                              (groupTotal /
                                                  Math.max(1, target)) *
                                                  100,
                                          ),
                                      ),
                                  )
                                : 0;
                            return (
                                <Card
                                    key={group.id}
                                    className="shadow-sm hover:shadow transition-shadow"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <span className="inline-flex h-2 w-2 rounded-full bg-orion-blue" />
                                                    {group.name}
                                                    {hasTarget && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {group.percentage
                                                                ? 'Percentage'
                                                                : 'Equal'}{' '}
                                                            Split
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {group.items.length} item
                                                    {group.items.length === 1
                                                        ? ''
                                                        : 's'}{' '}
                                                    · Total:{' '}
                                                    {groupTotal.toLocaleString(
                                                        'en-NG',
                                                        {
                                                            style: 'currency',
                                                            currency: 'NGN',
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right min-w-[160px]">
                                                {splitGroups.length > 2 && (
                                                    <div className="flex justify-end mb-1">
                                                        <Button
                                                            onClick={() =>
                                                                removeSplitGroup(
                                                                    group.id,
                                                                )
                                                            }
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            aria-label="Remove split group"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {hasTarget && (
                                                    <div className="text-xs">
                                                        <div>
                                                            Target:{' '}
                                                            <span className="font-medium">
                                                                {target.toLocaleString(
                                                                    'en-NG',
                                                                    {
                                                                        style: 'currency',
                                                                        currency:
                                                                            'NGN',
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={`${diff === 0 ? '' : diff > 0 ? 'text-amber-600' : 'text-green-600'}`}
                                                        >
                                                            Diff:{' '}
                                                            {diff.toLocaleString(
                                                                'en-NG',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'NGN',
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {hasTarget && (
                                            <div className="mt-2">
                                                <div className="h-1.5 w-full bg-muted rounded">
                                                    <div
                                                        className="h-1.5 rounded bg-orion-blue"
                                                        style={{
                                                            width: `${progressPct}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {order.items.map((item) => {
                                                const isChecked =
                                                    group.items.some(
                                                        (i) => i.id === item.id,
                                                    );
                                                return (
                                                    <div
                                                        key={item.id}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() =>
                                                            toggleItemInGroup(
                                                                item,
                                                                group.id,
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    'Enter' ||
                                                                e.key === ' '
                                                            ) {
                                                                e.preventDefault();
                                                                toggleItemInGroup(
                                                                    item,
                                                                    group.id,
                                                                );
                                                            }
                                                        }}
                                                        className={`flex items-start justify-between gap-2 rounded-md border p-2 text-sm transition-colors ${
                                                            isChecked
                                                                ? 'border-orion-blue bg-orion-blue/5'
                                                                : 'hover:bg-muted/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <Checkbox
                                                                className="mt-0.5 data-[state=checked]:bg-orion-blue data-[state=checked]:border-orion-blue data-[state=checked]:text-white"
                                                                checked={
                                                                    isChecked
                                                                }
                                                                onCheckedChange={() =>
                                                                    toggleItemInGroup(
                                                                        item,
                                                                        group.id,
                                                                    )
                                                                }
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            />
                                                            <div>
                                                                <div className="font-medium line-clamp-1">
                                                                    {item.name}
                                                                </div>
                                                                <div className="text-muted-foreground text-xs">
                                                                    ×
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="font-medium">
                                                            {(
                                                                item.price *
                                                                item.quantity
                                                            ).toLocaleString(
                                                                'en-NG',
                                                                {
                                                                    style: 'currency',
                                                                    currency:
                                                                        'NGN',
                                                                    minimumFractionDigits: 0,
                                                                    maximumFractionDigits: 0,
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">
                                                    Total:
                                                </span>
                                                <span className="font-bold text-lg">
                                                    {calculateGroupTotal(
                                                        group.items,
                                                    ).toLocaleString('en-NG', {
                                                        style: 'currency',
                                                        currency: 'NGN',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    })}
                                                </span>
                                            </div>

                                            {/* Show split amount if set */}
                                            {group.customAmount && (
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-sm text-gray-600">
                                                        Split Amount:
                                                    </span>
                                                    <span className="text-sm font-medium text-blue-600">
                                                        {group.customAmount.toLocaleString(
                                                            'en-NG',
                                                            {
                                                                style: 'currency',
                                                                currency: 'NGN',
                                                                minimumFractionDigits: 0,
                                                                maximumFractionDigits: 0,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Show percentage if set and meaningful */}
                                            {group.percentage &&
                                                group.percentage > 0 && (
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-sm text-gray-600">
                                                            Percentage:
                                                        </span>
                                                        <span className="text-sm font-medium text-green-600">
                                                            {group.percentage}%
                                                        </span>
                                                    </div>
                                                )}

                                            {showCustomerDetails && (
                                                <div className="mt-3 space-y-2">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Label className="text-xs">
                                                                Customer Name
                                                            </Label>
                                                            <Input
                                                                placeholder="Customer name"
                                                                value={
                                                                    group.customerName ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateGroupCustomer(
                                                                        group.id,
                                                                        'customerName',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 text-xs"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">
                                                                Phone
                                                            </Label>
                                                            <Input
                                                                placeholder="Phone number"
                                                                value={
                                                                    group.customerPhone ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateGroupCustomer(
                                                                        group.id,
                                                                        'customerPhone',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-8 text-xs"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Summary */}
                <div className="rounded-md border p-3 bg-muted/20 flex flex-wrap items-center gap-3">
                    <div className="text-sm">
                        Order Total:{' '}
                        <span className="font-semibold">
                            {getOrderTotal().toLocaleString('en-NG', {
                                style: 'currency',
                                currency: 'NGN',
                            })}
                        </span>
                    </div>
                    <div className="text-sm">
                        Assigned Total:{' '}
                        <span className="font-semibold">
                            {splitGroups
                                .reduce(
                                    (s, g) => s + calculateGroupTotal(g.items),
                                    0,
                                )
                                .toLocaleString('en-NG', {
                                    style: 'currency',
                                    currency: 'NGN',
                                })}
                        </span>
                    </div>
                    <div className="ml-auto text-xs px-2 py-1 rounded bg-muted/60">
                        Unassigned Items:{' '}
                        {Math.max(
                            0,
                            (order.items?.length || 0) -
                                Array.from(assignedItems).length,
                        )}
                    </div>
                </div>

                <div className="flex w-full justify-end gap-3">
                    <Button
                        onClick={resetSplit}
                        variant="outline"
                        disabled={isSubmitting}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>

                    <BrandButton
                        onClick={handleConfirmSplit}
                        disabled={isSubmitting || splitCompleted}
                        icon={<Check className="w-4 h-4 mr-2" />}
                        iconPosition="left"
                    >
                        {splitCompleted
                            ? 'Split Completed'
                            : isSubmitting
                              ? 'Processing...'
                              : 'Confirm Split'}
                    </BrandButton>
                </div>
            </CardContent>
        </Card>
    );
}
