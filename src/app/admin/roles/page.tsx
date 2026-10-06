'use client';

import React from 'react';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import CustomTable from '@/components/common/table/CustomTable';
import { Button } from '@/components/ui/button';
import DashboardLoader from '@/components/DashboardLoader';
import { Plus } from 'lucide-react';
import { useDisclosure } from '@/hooks/useDisclosure';
import useRoles from '@/hooks/useRoles';
import CreateRoleModal from '@/components/admin/Table/CreateRole';
import EditRoleModal from '@/components/admin/Table/EditModal';
import { deleteRole } from '@/app/actions/roles';
import Toast from '@/components/toast';
import toast from 'react-hot-toast';
import { RoleColumn } from '@/components/admin/Table/column/RoleColumn';

const RolesPage = () => {
    const [editedRole, setEditedRole] = React.useState<any>(null);
    const { roles, isLoading, refreshRoles } = useRoles();

    const {
        isOpen: isCreateModalOpen,
        onOpen: onCreateModalOpen,
        onClose: onCreateModalClose,
        onOpenChange: onCreateModalOpenChange,
    } = useDisclosure();

    const editModal = useDisclosure();

    const onEdit = (role: any) => {
        setEditedRole(role);
        editModal.onOpen();
    };

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

    const columns = RoleColumn({
        onEdit,
        onDelete,
    });

    if (isLoading) {
        return <DashboardLoader />;
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle title="Roles" subtitle="Role Management" />
            </PageHeader>
            <div>
                <CustomTable
                    columns={columns}
                    data={roles}
                    extend={
                        <CreateRoleModal
                            trigger={
                                <Button className="bg-orion-blue">
                                    <Plus className="w-4 h-4" />
                                    Role
                                </Button>
                            }
                            isOpen={isCreateModalOpen}
                            onOpenChange={onCreateModalOpenChange}
                            onSuccess={() => {
                                refreshRoles();
                                setEditedRole(null);
                            }}
                        />
                    }
                />
            </div>

            {editedRole && (
                <EditRoleModal
                    editedRole={editedRole}
                    isOpen={editModal.isOpen}
                    onOpenChange={(open) => {
                        editModal.onOpenChange(open);
                        if (!open) setEditedRole(null);
                    }}
                    onSuccess={() => {
                        refreshRoles();
                        editModal.onOpenChange(false);
                        setEditedRole(null);
                    }}
                />
            )}
        </PageWrapper>
    );
};

export default RolesPage;
