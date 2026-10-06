'use client';
import { deleteMenuSubCategoryBulk } from '@/app/actions/menu-sub-category';
import { itemOrderRejectedIllustration } from '@/components/house-keeping/common/illustrations';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip } from '@heroui/react';
import { Loader2, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

interface CellProps {
    selected: number[];
}
const MiniCatDeleteCell = ({ selected }: CellProps) => {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleDeleteAll = async () => {
        setLoadingDelete(true);
        try {
            const response = await deleteMenuSubCategoryBulk(selected);
            if (
                response?.message === 'Menu sub category deleted successfully!'
            ) {
                setDeleteDialog(false);
                setLoadingDelete(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));

                mutate('/menu/sub-category');
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

    return (
        <div className="flex items-center gap-10 text-sm justify-between w-full">
            {!!selected.length && (
                <div onClick={() => setDeleteDialog(true)}>
                    <Tooltip
                        className="text-muted-foreground rounded-sm font-medium"
                        content="Delete selected rows"
                        showArrow={true}
                    >
                        <span className="cursor-pointer flex items-center gap-2 text-red-700 pr-5 w-full">
                            Delete <TrashIcon size={15} />
                        </span>
                    </Tooltip>
                </div>
            )}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent className="w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            <span className="flex justify-center items-center">
                                {itemOrderRejectedIllustration}
                            </span>
                        </DialogTitle>
                        <div className="flex flex-col ">
                            <h1 className="text-center text-lg font-semibold">
                                Delete Mini Categories
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete these mini
                                categories?
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            disabled={loadingDelete}
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={handleDeleteAll}
                        >
                            {loadingDelete ? (
                                <Loader2 className="animate-spin mr-2" />
                            ) : (
                                'Yes, Sure'
                            )}
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
        </div>
    );
};

export default MiniCatDeleteCell;
