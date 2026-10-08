'use client';
import {
    deleteModifierGroup,
    updateModifierGroup,
} from '@/app/actions/modifier';
import { ModifierGroup } from '@/app/actions/modifier';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Pencil, Trash2, Settings } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import ModifierGroupForm from '../modifiers/ModifierGroupForm';
import ModifierOptionsManager from '../modifiers/ModifierOptionsManager';

interface ModifierGroupActionCellProps {
    group: ModifierGroup;
}

export default function ModifierGroupActionCell({
    group,
}: ModifierGroupActionCellProps) {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [optionsDialog, setOptionsDialog] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const handleUpdate = async (data: any) => {
        if (data.cancel) {
            setEditDialog(false);
            return;
        }

        setLoadingUpdate(true);
        try {
            const response = await updateModifierGroup(group.id, data);
            if (response?.data) {
                setLoadingUpdate(false);
                setEditDialog(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Modifier group updated successfully!"
                        type="success"
                    />
                ));
                mutate('modifier-groups');
            } else {
                setLoadingUpdate(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.error || 'Failed to update'}
                        type="error"
                    />
                ));
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
            setLoadingUpdate(false);
        }
    };

    const handleDelete = async (id: number) => {
        setLoadingDelete(true);
        try {
            const response = await deleteModifierGroup(id);
            if (response?.message === 'Modifier group deleted successfully!') {
                setDeleteDialog(false);
                setLoadingDelete(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('modifier-groups');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message || 'Failed to delete'}
                        type="error"
                    />
                ));
                setLoadingDelete(false);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
            setLoadingDelete(false);
        }
        setDeleteDialog(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Dialog open={optionsDialog} onOpenChange={setOptionsDialog}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Manage Options: {group.name}</DialogTitle>
                        <DialogDescription>
                            Add, edit, or remove modifier options for this group
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <ModifierOptionsManager modifierGroupId={group.id} />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Modifier Group</DialogTitle>
                        <DialogDescription>
                            Update modifier group details
                        </DialogDescription>
                    </DialogHeader>
                    <ModifierGroupForm
                        initialData={group}
                        onSubmit={handleUpdate}
                        isLoading={loadingUpdate}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Modifier Group</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{group.name}&quot;? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleDelete(group.id)}
                            disabled={loadingDelete}
                        >
                            {loadingDelete ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

