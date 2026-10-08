import { deleteTable, updateTable } from '@/app/actions/back-of-house';
import { itemOrderRejectedIllustration } from '@/components/house-keeping/common/illustrations';
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
import MutateAreaTableForm, {
    TableMutateProps,
} from '../common/Form/MutateTableAreaForm';
import { TDAreaProps } from './columns/TableManagement';

interface TableAreaActionCellProps {
    table: TDAreaProps;
}
const TableAreaActionCell = ({ table }: TableAreaActionCellProps) => {
    const [deleteDialog, setDeleteDialog] = React.useState(false);
    const [editDialog, setEditDialog] = React.useState(false);
    const handleDelete = async (id: number) => {
        setDeleteDialog(false);
        console.log(id);
        try {
            const response = await deleteTable(id);
            if (response?.message === 'Table deleted successfully!') {
                setDeleteDialog(false);

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/restaurants/table');
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
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
    };
    const handleUpdate = async (id: number, data: TableMutateProps) => {
        setEditDialog(false);
        try {
            const response = await updateTable(id, data);
            if (response?.message === 'Table updated successfully!') {
                setEditDialog(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/restaurants/table');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
            }
            setEditDialog(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
    };
    return (
        <div className="flex items-center gap-4 text-sm">
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogTrigger asChild>
                    <button className="text-muted-foreground">Delete</button>
                </DialogTrigger>
                <DialogContent className="w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            <span className="flex justify-center items-center">
                                {itemOrderRejectedIllustration}
                            </span>
                        </DialogTitle>
                        <div className="flex flex-col ">
                            <h1 className="text-center text-lg font-semibold">
                                Delete Table
                            </h1>
                            <DialogDescription className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete this table?
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={() => handleDelete(table.id)}
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
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogTrigger asChild>
                    <button className="text-hexbrand">Edit</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Table Detail</DialogTitle>
                        <DialogDescription>
                            Update the number of seats or table number for this
                            area.
                        </DialogDescription>
                    </DialogHeader>
                    <MutateAreaTableForm
                        onSubmit={(data) => {
                            handleUpdate(table.id, data);
                        }}
                        initialData={{
                            areaId: table.dineInArea.id,
                            number: table.number,
                            numberOfSeats: table.numberOfSeats,
                        }}
                        mode="edit"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TableAreaActionCell;
