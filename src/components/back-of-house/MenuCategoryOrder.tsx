'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { GripVertical, ListOrdered } from 'lucide-react';
import { useEffect, useState } from 'react';

export type MenuCategoryOrderGroup = {
    id: string;
    label: string;
    items: { id: number; label: string }[];
    rankType?: 'category' | 'sub-category';
    parentCategoryId?: number | null;
    menuCategoryId?: number;
};

type MenuCategoryOrderProps = {
    groups: MenuCategoryOrderGroup[];
    onSave: (groups: MenuCategoryOrderGroup[]) => Promise<void>;
};

export default function MenuCategoryOrder({
    groups,
    onSave,
}: MenuCategoryOrderProps) {
    const [orderedGroups, setOrderedGroups] = useState(groups);
    const [savedGroups, setSavedGroups] = useState(groups);
    const [draggedItem, setDraggedItem] = useState<{
        groupId: string;
        itemId: number;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setOrderedGroups(groups);
        setSavedGroups(groups);
    }, [groups]);

    if (groups.length === 0) return null;

    const hasChanges =
        JSON.stringify(orderedGroups) !== JSON.stringify(savedGroups);

    const moveItem = (groupId: string, targetId: number) => {
        if (!draggedItem || draggedItem.groupId !== groupId) return;

        setOrderedGroups((current) =>
            current.map((group) => {
                if (group.id !== groupId) return group;

                const items = [...group.items];
                const sourceIndex = items.findIndex(
                    (item) => item.id === draggedItem.itemId,
                );
                const targetIndex = items.findIndex(
                    (item) => item.id === targetId,
                );
                if (sourceIndex < 0 || targetIndex < 0) return group;

                const [movedItem] = items.splice(sourceIndex, 1);
                items.splice(targetIndex, 0, movedItem);
                return { ...group, items };
            }),
        );
        setDraggedItem(null);
    };

    const saveOrder = async () => {
        setIsSaving(true);
        setError('');
        try {
            await onSave(orderedGroups);
            setSavedGroups(orderedGroups);
            setIsOpen(false);
        } catch (saveError) {
            setError(
                saveError instanceof Error
                    ? saveError.message
                    : 'Could not save the category order.',
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline">
                    <ListOrdered size={16} />
                    Arrange order
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Arrange display order</DialogTitle>
                    <DialogDescription>
                        Drag items within each group to set their ranking.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {orderedGroups.map((group) => (
                        <section key={group.id}>
                            <h3 className="mb-2 text-sm font-medium text-gray-600">
                                {group.label}
                            </h3>
                            <ol className="space-y-1">
                                {group.items.map((item, index) => (
                                    <li
                                        key={item.id}
                                        draggable
                                        onDragStart={() =>
                                            setDraggedItem({
                                                groupId: group.id,
                                                itemId: item.id,
                                            })
                                        }
                                        onDragOver={(event) =>
                                            event.preventDefault()
                                        }
                                        onDrop={() =>
                                            moveItem(group.id, item.id)
                                        }
                                        onDragEnd={() => setDraggedItem(null)}
                                        className="flex cursor-grab items-center gap-3 rounded border border-gray-200 px-3 py-2 text-sm active:cursor-grabbing"
                                    >
                                        <GripVertical
                                            size={16}
                                            className="shrink-0 text-gray-400"
                                            aria-label="Drag to change rank"
                                        />
                                        <span className="w-6 shrink-0 text-right text-gray-500">
                                            {index + 1}
                                        </span>
                                        <span className="min-w-0 truncate text-gray-900">
                                            {item.label}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ))}
                </div>
                {error && (
                    <p role="alert" className="text-sm text-red-600">
                        {error}
                    </p>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={saveOrder}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
