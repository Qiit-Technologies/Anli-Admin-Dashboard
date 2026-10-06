'use client';

import { deleteRole } from '@/app/actions/roles';
import Toast from '@/components/toast';
import useRoles from '@/hooks/useRoles';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from '@heroui/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdAddCircleOutline, IoMdRefresh } from 'react-icons/io';
import CreateRoleModal from './CreateRole';
import EditRoleModal from './EditModal';
import renderRolesCell from './RenderRoleCell';

const columns = [
    { name: 'Role', uid: 'name' },
    // { name: 'Department', uid: 'department' },
    { name: 'Description', uid: 'description' },
    { name: 'Created At', uid: 'createdAt' },
    { name: 'Actions', uid: 'actions' },
];

const RoleTable = () => {
    const [editedRole, setEditedRole] = useState<any>(null);
    const { roles, isLoading, searchQuery, setSearchQuery, refreshRoles } =
        useRoles();
    const {
        isOpen: isCreateModalOpen,
        onOpen: onCreateModalOpen,
        onClose: onCreateModalClose,
    } = useDisclosure();

    const editModal = useDisclosure();

    const onCreate = () => {
        onCreateModalOpen();
    };

    const onEdit = (role: any) => {
        setEditedRole(role);
        editModal.onOpen();
    };
    console.log(roles);

    const onDelete = async (id: string) => {
        try {
            const result = await deleteRole(id);

            if (result.message === 'Role deleted successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Role deleted successfully"
                        type="success"
                    />
                ));
                refreshRoles();
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            result.message ||
                            'Failed to delete role. Please try again.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred. Please try again."
                    type="error"
                />
            ));
        }
    };

    return (
        <>
            <Table
                isStriped
                aria-label="Roles table"
                topContent={
                    <div className="flex justify-between gap-3">
                        <div className="flex w-full justify-end gap-2">
                            <Input
                                isClearable
                                className="w-[20%] focus-within:w-[40%] transition-width"
                                placeholder="Search"
                                startContent={
                                    <MagnifyingGlassIcon width={20} />
                                }
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                            />
                            <Button
                                color="default"
                                startContent={<IoMdAddCircleOutline />}
                                id="add-item-btn"
                                className="capitalize bg-btnDark text-white"
                                onPress={() => onCreate()}
                            >
                                Create role
                            </Button>
                            <Button
                                onPress={() => refreshRoles()}
                                isIconOnly
                                aria-label="Refresh"
                                color="default"
                                isLoading={isLoading}
                            >
                                <IoMdRefresh className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                }
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} allowsSorting>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={'No roles to display.'} items={roles}>
                    {(role) => (
                        <TableRow key={role.id}>
                            {(columnKey) => (
                                <TableCell className="capitalize">
                                    {renderRolesCell(
                                        role as any,
                                        columnKey as any,
                                        () => onEdit(role),
                                        () => onDelete(role.id),
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {editedRole && (
                <EditRoleModal
                    editedRole={editedRole}
                    isOpen={editModal.isOpen}
                    onOpenChange={editModal.onOpenChange}
                    onSuccess={refreshRoles}
                />
            )}
            <CreateRoleModal
                isOpen={isCreateModalOpen}
                onOpenChange={onCreateModalClose}
                onSuccess={refreshRoles}
            />
        </>
    );
};

export default RoleTable;
