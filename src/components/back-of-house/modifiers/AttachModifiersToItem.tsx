'use client';
import {
    attachModifierGroupsToMenuItem,
    getModifierGroups,
    getMenuItemWithModifiers,
} from '@/app/actions/modifier';
import { ModifierGroup } from '@/app/actions/modifier';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

interface AttachModifiersToItemProps {
    menuItemId: number;
    trigger?: ReactNode;
}

export default function AttachModifiersToItem({
    menuItemId,
    trigger,
}: AttachModifiersToItemProps) {
    const [open, setOpen] = useState(false);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { data: modifierGroups } = useSWR(
        open ? 'modifier-groups' : null,
        getModifierGroups,
    );

    const { data: menuItemData } = useSWR(
        open && menuItemId ? [`menu-item-modifiers`, menuItemId] : null,
        () => getMenuItemWithModifiers(menuItemId),
    );

    useEffect(() => {
        if (menuItemData?.data?.modifierGroups) {
            const ids = menuItemData.data.modifierGroups.map((g: ModifierGroup) => g.id);
            setSelectedGroupIds(ids);
        }
    }, [menuItemData]);

    const handleToggle = (groupId: number) => {
        setSelectedGroupIds((prev) => {
            if (prev.includes(groupId)) {
                return prev.filter((id) => id !== groupId);
            } else {
                return [...prev, groupId];
            }
        });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await attachModifierGroupsToMenuItem(menuItemId, {
                modifierGroupIds: selectedGroupIds,
            });

            if (response?.data) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Modifier groups attached successfully!"
                        type="success"
                    />
                ));
                mutate([`menu-item-modifiers`, menuItemId]);
                mutate('menu-item?=f&b');
                setOpen(false);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.error || 'Failed to attach modifiers'}
                        type="error"
                    />
                ));
            }
        } catch (err) {
            console.error('Error attaching modifiers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        Manage Modifiers
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Attach Modifier Groups</DialogTitle>
                    <DialogDescription>
                        Select which modifier groups should be available for this menu item
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {modifierGroups?.data?.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No modifier groups found. Create one first.
                        </p>
                    ) : (
                        modifierGroups?.data?.map((group: ModifierGroup) => (
                            <div
                                key={group.id}
                                className="flex items-center space-x-2 p-3 border rounded-lg"
                            >
                                <Checkbox
                                    id={`group-${group.id}`}
                                    checked={selectedGroupIds.includes(group.id)}
                                    onCheckedChange={() => handleToggle(group.id)}
                                />
                                <Label
                                    htmlFor={`group-${group.id}`}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium">{group.name}</span>
                                            {group.description && (
                                                <p className="text-xs text-gray-500">
                                                    {group.description}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {group.options?.length || 0} options
                                        </span>
                                    </div>
                                </Label>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-orion-blue"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

