import {
    deleteMembershipPlan,
    editMembershipPlan,
} from '@/app/actions/membership';
import Toast from '@/components/toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Row } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import CreatePlanForm from '../forms/create-plan';
import { MembershipPlan } from './columns/plan-column';

interface Props {
    row: Row<MembershipPlan>;
}
const PlanTableAction = ({ row }: Props) => {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    //loading states
    const [isEditLoading, setIsEditLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const handleEditPlan = async (planData: {
        name: string;
        price: number;
        numberOfReferrals: number;
        maxDurationMonths: number;
    }) => {
        const rowId = row.original.id;
        try {
            setIsEditLoading(true);
            const response = await editMembershipPlan(rowId, planData);
            if (response.data) {
                toast.custom(
                    <Toast
                        title="Success"
                        type="success"
                        description="Plan updated successfully"
                    />,
                );
                setShowEditDialog(false);
                mutate('/api/membership-plans');
                setIsEditLoading(false);
            }
        } catch (error: any) {
            console.error('Error creating membership plan:', error);
            setIsEditLoading(false);
            toast.custom(
                <Toast
                    title="Error"
                    type="error"
                    description="Failed to create plan"
                />,
            );
            throw error;
        }
    };

    const handleDeletePlan = async () => {
        const rowId = row.original.id;
        try {
            const response = await deleteMembershipPlan(rowId.toString());
            if (response.message === 'Plan deleted successfully') {
                toast.custom(
                    <Toast
                        title="Success"
                        type="success"
                        description="Plan deleted successfully"
                    />,
                );
                setShowDeleteDialog(false);
                mutate('/api/membership-plans');
            }
        } catch (error: any) {
            console.error('Error deleting membership plan:', error);
            setIsDeleteLoading(false);
            toast.custom(
                <Toast
                    title="Error"
                    type="error"
                    description="Failed to delete plan"
                />,
            );
            throw error;
        }
    };

    return (
        <div className="flex flex-row gap-3 text-[#667085]">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                    <Button
                        variant={'ghost'}
                        className="hover:text-orion-blue cursor-pointer flex items-center gap-1"
                    >
                        <Edit size={14} />
                        <span className="text-sm">Edit</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="max-w-3xl">
                        <DialogTitle>Edit Membership Plan</DialogTitle>
                    </DialogHeader>
                    <CreatePlanForm
                        onSubmit={handleEditPlan}
                        onCancel={() => setShowEditDialog(false)}
                        initialData={row.original}
                        mode="edit"
                        isLoading={isEditLoading}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogTrigger asChild>
                    <Button
                        variant={'ghost'}
                        className="hover:text-red-600 cursor-pointer flex items-center gap-1"
                    >
                        <Trash2 size={14} />
                        <span className="text-sm">Delete</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Membership Plan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the plan &quot;
                            {row.original.name}&quot;? This action cannot be
                            undone and will permanently remove the plan from
                            your system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePlan}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleteLoading ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PlanTableAction;
