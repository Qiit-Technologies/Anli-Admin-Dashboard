'use client';
import { deleteMenuBulk } from '@/app/actions/menu';
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
import { itemOrderRejectedIllustration } from '@/components/house-keeping/common/illustrations';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

interface MenuDeleteCellProps {
    selected: number[];
}

const MenuDeleteCell = ({ selected }: MenuDeleteCellProps) => {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleBulkDelete = async () => {
        if (selected.length === 0) return;

        setLoadingDelete(true);
        try {
            const response = await deleteMenuBulk(selected);
            if (response?.message === 'Menus deleted successfully!') {
                setDeleteDialog(false);
                setLoadingDelete(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('menus');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
                setLoadingDelete(false);
            }
            setDeleteDialog(false);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
            setLoadingDelete(false);
        }
    };

    if (selected.length === 0) {
        return null;
    }

    return (
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    disabled={selected.length === 0}
                >
                    Delete Selected ({selected.length})
                </Button>
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
                            Delete {selected.length} Menu
                            {selected.length > 1 ? 's' : ''}
                        </h1>
                        <DialogDescription className="text-center">
                            Are you sure you want to delete {selected.length}{' '}
                            menu{selected.length > 1 ? 's' : ''}? All categories
                            in these menus will also be deleted.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <div className="flex items-center gap-4 mt-4">
                    <Button
                        className="h-12 bg-orion-blue text-white w-full"
                        onClick={handleBulkDelete}
                        disabled={loadingDelete}
                    >
                        {loadingDelete && (
                            <Loader2 className="mr-2 animate-spin" />
                        )}
                        Yes, Delete
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
    );
};

export default MenuDeleteCell;





