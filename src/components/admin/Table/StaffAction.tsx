import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { removeStaff } from '@/app/actions/staff';
import { CustomSheet } from '@/components/common/CustomSheet';
import Toast from '@/components/toast';
import { useDisclosure } from '@/hooks/useDisclosure';
import { EmployeeType } from '@/types/employee';
import { Tooltip } from '@heroui/react';
import { Row } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { InviteModal } from '../form/invite-modal';

interface Props {
    row: Row<EmployeeType>;
}
const StaffAction = ({ row }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure();

    const onDelete = async (item: number) => {
        const { data, status } = await removeStaff(item);
        if (status >= 400) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={
                        data.message ||
                        `Failed to delete staff member. Please try again.`
                    }
                    type="error"
                />
            ));
        }
        await mutate('/staff-members');
        toast.custom(() => (
            <Toast
                title="Success!"
                description={`Staff deleted successfully`}
                type="success"
            />
        ));
    };
    return (
        <div className="flex gap-2">
            <Tooltip
                className="text-muted-foreground rounded-sm font-medium"
                content="Edit staff member"
                showArrow={true}
            >
                <CustomSheet
                    title="Edit Staff Member"
                    subTitle="Update staff member details"
                    open={isOpen}
                    setOpen={(open) => (open ? onOpen() : onClose())}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted/50"
                            onClick={() => console.log('Edit', row.original)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    }
                >
                    <InviteModal
                        mode="edit"
                        staffData={{
                            id: row.original.id,
                            createdAt: row.original.createdAt,
                            email: row.original.email,
                            department: '-',
                            departmentName: '-',
                            fullName: row.original.fullName,
                            roleId: row.original.roles.id,
                            username: row.original.username,
                            modules: row.original.modules ?? [],
                            permissions: row.original.permissions ?? [],
                        }}
                        onSuccess={() => {
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                </CustomSheet>
            </Tooltip>
            <Dialog open={isDeleteOpen} onOpenChange={onDeleteOpen}>
                <Tooltip content="Delete staff member" showArrow>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                                row.original.roles.name === 'administrator'
                            }
                            className="h-8 w-8 bg-destructive/10 text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </Tooltip>

                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action will permanently delete{' '}
                            <strong>{row.original.fullName}</strong>. This
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={onDeleteClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                onDelete(row.original.id);
                                onDeleteClose();
                            }}
                        >
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StaffAction;
