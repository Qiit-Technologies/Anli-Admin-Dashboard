'use client';
import {
    createTable,
    deleteDineInArea,
    updateDineInArea,
    updateDineInAreaMenu,
} from '@/app/actions/back-of-house';
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
import MutateDineAreaForm from '../common/Form/MutateDineAreaForm';
import MutateAreaTableForm, {
    TableMutateProps,
} from '../common/Form/MutateTableAreaForm';
import MutateMenuForm from '../common/Form/MutateMenuForm';
import { useRouter } from 'nextjs-toploader/app';
import useHotel from '@/hooks/useHotel';

interface CellProps {
    id?: number;
    name?: string;
    description?: string;
    menuCategories?: any[];
    dineInAreaId?: number;
}

const DineAreaActionCell = ({
    id,
    name,
    description,
    menuCategories,
}: CellProps) => {
    const hotelData = useHotel();
    const hotelId = hotelData?.organization?.id?.toString();

    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [openTable, setOpenTable] = React.useState(false);
    const [deleteDialog, setDeleteDialog] = React.useState(false);
    const [menuDialog, setMenuDialog] = React.useState(false);

    const handleTableSubmit = async (data: TableMutateProps) => {
        try {
            const response = await createTable(data);
            if (response?.message === 'Table created successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/restaurants/dine-in-areas');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
            }
            setIsOpen(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
    };

    const handleAreaEdit = async (data: CellProps) => {
        try {
            const response = await updateDineInArea(data);
            if (response?.message === 'Dine in area updated successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/restaurants/dine-in-areas');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
            }
            setIsOpen(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
    };

    // Handle delete action
    const handleDelete = async () => {
        try {
            const response = await deleteDineInArea(id as number);
            if (response?.message === 'Dine in area deleted successfully!') {
                setDeleteDialog(false);
                mutate('/restaurants/dine-in-areas');
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
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
        }
    };

    const handleMenuUpdate = async (_data: {
        name: string;
        description: string;
        dineInAreaId?: number;
    }) => {
        // Form data is not used; we extract menuCategoryIds from the menuCategories prop
        void _data;
        try {
            // Extract menuCategoryIds from menuCategories if available
            const menuCategoryIds =
                menuCategories?.map((cat: { id: number }) => cat.id) || [];
            const body = { menuCategoryIds };
            const response = await updateDineInAreaMenu(id as number, body);
            if (response?.message === 'Dine in area updated successfully!') {
                setIsOpen(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/restaurants/dine-in-areas');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
            }
            setDeleteDialog(false);
            setMenuDialog(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
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
                                Delete Dine-In Area
                            </h1>
                            <DialogDescription className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete this dine-in
                                area?
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={handleDelete}
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
                        <DialogTitle>Edit Dine Area</DialogTitle>
                        <DialogDescription>
                            Edit area details.
                        </DialogDescription>
                    </DialogHeader>
                    <MutateDineAreaForm
                        onSubmit={handleAreaEdit}
                        mode="add"
                        initialData={{
                            id: id as number,
                            name,
                            description,
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="h-8 px-2 py-1">
                        Item Category
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Menu Categories</DialogTitle>
                        <DialogDescription>
                            Add Menu Categories to Dine-In Area
                        </DialogDescription>
                    </DialogHeader>
                    <MutateMenuForm
                        onSubmit={handleMenuUpdate}
                        mode="edit"
                        initialData={{
                            name: '',
                            description: '',
                            dineInAreaId: id,
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openTable} onOpenChange={setOpenTable}>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="h-8 px-2 py-1">
                        Add Table
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="">Add Table</DialogTitle>
                        <DialogDescription>
                            Add a new table to area
                        </DialogDescription>
                    </DialogHeader>
                    <MutateAreaTableForm
                        onSubmit={handleTableSubmit}
                        mode="edit"
                        initialData={{
                            areaId: id,
                            number: 0,
                            numberOfSeats: 0,
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Button
                onClick={() =>
                    router.push(`/scan/dine?hotel=${hotelId}&dine=${id}`)
                }
                className="bg-orion-blue text-white"
            >
                Print QR Code
            </Button>
        </div>
    );
};

export default DineAreaActionCell;
