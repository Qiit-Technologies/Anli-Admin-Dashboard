import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import EditRoleModal from './EditModal';

export const RoleActionCell = ({
    role,
    onEdit,
    onDelete,
}: {
    role: any;
    onEdit: (role: any) => void;
    onDelete: (id: string) => void;
}) => {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleDelete = async () => {
        setLoadingDelete(true);
        try {
            await onDelete(role.id);
            setDeleteDialog(false);
        } catch (error) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred. Please try again."
                    type="error"
                />
            ));
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className="flex items-center gap-6 text-sm w-full">
            <button
                className="text-orion-blue cursor-pointer"
                onClick={() => onEdit(role)}
            >
                Edit
            </button>
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogTrigger asChild>
                    <button className="text-muted-foreground cursor-pointer">
                        Delete
                    </button>
                </DialogTrigger>
                <DialogContent className="w-[400px]">
                    <DialogHeader>
                        <div className="flex flex-col">
                            <h1 className="text-center text-lg font-semibold">
                                Delete Role
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                Are you sure you want to delete this role?
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-4">
                        <Button
                            className="h-12 bg-orion-blue text-white w-full"
                            onClick={handleDelete}
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
        </div>
    );
};
