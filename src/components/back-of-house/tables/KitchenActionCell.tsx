'use client';
import { deleteKitchen, updateKitchen } from '@/app/actions/back-of-house';
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
import React from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import MutateKitchenForm from '../common/Form/MutateKitchenForm';
import { KitchenType } from '@/types/back-of-house.type';
import MutateKitchenFormDineInArea from '../common/Form/MutateKitchenFormDineInArea';

const KitchenActionCell = ({
    id,
    name,
    description,
    dineInAreas,
}: KitchenType) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [deleteDialog, setDeleteDialog] = React.useState(false);
    const [menuDialog, setMenuDialog] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleKitchenEdit = async (data: KitchenType) => {
        setLoading(true);
        try {
            const response = await updateKitchen(data);
            if (response?.message === 'Kitchen updated successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/kitchen');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
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
        } finally {
            setIsOpen(false);
            setDeleteDialog(false);
            setMenuDialog(false);
            setLoading(false);
        }
    };

    const handleKitchenDelete = async () => {
        setLoading(true);
        try {
            const response = await deleteKitchen(id);
            if (response?.message === 'Kitchen deleted successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/kitchen');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
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
        } finally {
            setIsOpen(false);
            setDeleteDialog(false);
            setMenuDialog(false);
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2 w-full justify-between">
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogTrigger asChild>
                    <button className="text-muted-foreground">Delete</button>
                </DialogTrigger>
                <DialogContent className="w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            <span className="flex justify-center items-center">
                                {/* {itemOrderRejectedIllustration} */}
                            </span>
                        </DialogTitle>
                        <div className="flex flex-col ">
                            <h1 className="text-center text-lg font-semibold">
                                Delete Kitchen
                            </h1>
                            <DialogDescription className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete this kitchen?
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={handleKitchenDelete}
                        >
                            Yes, Sure
                        </Button>
                        <Button
                            variant={'outline'}
                            className="h-12 text-orion-blue border-orion-blue w-full"
                            type="button"
                            onClick={() => setDeleteDialog(false)}
                        >
                            No, Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="h-8 px-2 py-1">
                        Edit
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit kitchen</DialogTitle>
                        <DialogDescription>
                            Edit kitchen details.
                        </DialogDescription>
                    </DialogHeader>
                    <MutateKitchenForm
                        loading={loading}
                        onSubmit={handleKitchenEdit}
                        mode="edit"
                        initialData={{
                            id,
                            name,
                            description,
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="h-8 px-2 py-1">
                        Add Dine-In Area
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Dine-In Area</DialogTitle>
                        <DialogDescription>
                            Add Dine-In Area to Kitchen
                        </DialogDescription>
                    </DialogHeader>
                    <MutateKitchenFormDineInArea
                        loading={loading}
                        onSubmit={handleKitchenEdit}
                        mode="edit"
                        initialData={{
                            id,
                            dineInAreas,
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default KitchenActionCell;
