'use client';
import {
    createModifierOption,
    deleteModifierOption,
    getModifierOptions,
    updateModifierOption,
} from '@/app/actions/modifier';
import { ModifierOption } from '@/app/actions/modifier';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import ModifierOptionForm from './ModifierOptionForm';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface ModifierOptionsManagerProps {
    modifierGroupId: number;
}

export default function ModifierOptionsManager({
    modifierGroupId,
}: ModifierOptionsManagerProps) {
    const [editingOption, setEditingOption] = useState<ModifierOption | null>(
        null,
    );
    const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { data: options } = useSWR(
        [`modifier-options`, modifierGroupId],
        () => getModifierOptions(modifierGroupId),
    );

    const handleOptionSubmit = async (data: any) => {
        if (data.cancel) {
            setIsOptionDialogOpen(false);
            setEditingOption(null);
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (editingOption) {
                response = await updateModifierOption(editingOption.id, data);
            } else {
                response = await createModifierOption({
                    ...data,
                    modifierGroupId,
                });
            }

            if (response?.data) {
                setIsOptionDialogOpen(false);
                setEditingOption(null);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={
                            editingOption
                                ? 'Modifier option updated successfully!'
                                : 'Modifier option created successfully!'
                        }
                        type="success"
                    />
                ));
                mutate([`modifier-options`, modifierGroupId]);
                mutate('modifier-groups');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.error || 'An error occurred'}
                        type="error"
                    />
                ));
            }
        } catch (err) {
            console.error('Error saving modifier option:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOption = async (id: number) => {
        try {
            const response = await deleteModifierOption(id);
            if (response?.message === 'Modifier option deleted successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate([`modifier-options`, modifierGroupId]);
                mutate('modifier-groups');
            }
        } catch (err) {
            console.error('Error deleting modifier option:', err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog
                    open={isOptionDialogOpen}
                    onOpenChange={(open) => {
                        setIsOptionDialogOpen(open);
                        if (!open) {
                            setEditingOption(null);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEditingOption(null);
                                setIsOptionDialogOpen(true);
                            }}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingOption
                                    ? 'Edit Modifier Option'
                                    : 'Add Modifier Option'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingOption
                                    ? 'Update modifier option details'
                                    : 'Add a new option to this modifier group'}
                            </DialogDescription>
                        </DialogHeader>
                        <ModifierOptionForm
                            initialData={editingOption}
                            onSubmit={handleOptionSubmit}
                            isLoading={isLoading}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price Adjustment</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {options?.data?.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground"
                            >
                                No options. Click &quot;Add Option&quot; to create one.
                            </TableCell>
                        </TableRow>
                    ) : (
                        options?.data?.map((option: ModifierOption) => (
                            <TableRow key={option.id}>
                                <TableCell className="font-medium">
                                    {option.name}
                                </TableCell>
                                <TableCell>
                                    {option.price > 0
                                        ? `+₦${option.price}`
                                        : option.price < 0
                                          ? `₦${option.price}`
                                          : 'Free'}
                                </TableCell>
                                <TableCell>
                                    {option.isAvailable ? (
                                        <Badge variant="default">
                                            Available
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            Unavailable
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingOption(option);
                                                setIsOptionDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteOption(option.id)
                                            }
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

