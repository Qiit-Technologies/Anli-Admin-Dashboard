import { fetchRoles, inviteStaff, updateStaffMember } from '@/app/actions/staff';
import Toast from '@/components/toast';
import { MiniStaff, Role, SimplifiedStaff } from '@/types/staff.types';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
} from '@heroui/react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const initialItemState: SimplifiedStaff = {
    id: 0,
    username: '',
    fullName: '',
    email: '',
    createdAt: '',
    department: '',
    departmentName: '',
    roleId: 0,
    modules: [],
    permissions: [],
};

interface InviteModalProps {
    isEdit?: boolean;
    editedStaff?: SimplifiedStaff;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    setRefreshTable: React.Dispatch<React.SetStateAction<number>>;
    refreshTable: number;
}

type Department = {
    value: number;
    label: string;
    name: string;
};

const InviteModal: React.FC<InviteModalProps> = ({
    isEdit,
    editedStaff,
    isOpen,
    onOpenChange,
    setRefreshTable,
    refreshTable,
}) => {
    const [newItem, setNewItem] = useState<SimplifiedStaff>(initialItemState);
    const [roles, setRoles] = useState<Department[]>([]);

    useEffect(() => {
        if (isEdit && editedStaff) {
            setNewItem(editedStaff);
        } else if (!isEdit) {
            setNewItem(initialItemState);
        }
    }, [isEdit, editedStaff]);

    useEffect(() => {
        const getRoles = async () => {
            const response = await fetchRoles();
            const data = response.data;
            console.log(data);
            setRoles(
                data.map((item: Role) => ({
                    value: item.id,
                    name: item.name,
                    label: item.department,
                })),
            );
        };
        getRoles();
    }, []);

    const handleChange = (value: Partial<MiniStaff>) => {
        setNewItem({
            ...newItem,
            ...value,
        });
    };

    const handleSave = async (member: MiniStaff) => {
        try {
            if (isEdit) {
                await updateStaffMember(
                    {
                        fullName: member.fullName,
                        email: member.email,
                        username: member.username,
                        roleId: member.roleId,
                    },
                    newItem.id,
                );
            } else {
                const response = await inviteStaff({
                    fullName: member.fullName,
                    email: member.email,
                    username: member.fullName,
                    roleId: member.roleId,
                });
                if (response) {
                    if (response.message === 'Staff invited successfully') {
                        toast.custom(() => (
                            <Toast
                                title="Success!"
                                description={`Staff invited successfully: ${member.email}`}
                                type="success"
                            />
                        ));
                        setRefreshTable(refreshTable + 1);
                    } else {
                        toast.custom(() => (
                            <Toast
                                title="Error!"
                                description={response.message}
                                type="error"
                            />
                        ));
                    }
                }
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={`Failed to invite staff: ${error.message}`}
                    type="error"
                />
            ));
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Invite Staff Member
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                label="Staff's full name"
                                value={newItem.fullName}
                                onChange={(e) =>
                                    handleChange({
                                        fullName: e.target.value,
                                        // username: e.target.value,
                                    })
                                }
                            />
                            {isEdit && (
                                <Input
                                    label="Staff's username"
                                    value={newItem.username}
                                    onChange={(e) =>
                                        handleChange({
                                            username: e.target.value,
                                        })
                                    }
                                />
                            )}
                            <Select
                                items={roles}
                                label="Role"
                                placeholder="Select a role"
                                selectedKeys={newItem.roleId.toString()}
                                onChange={(e) => {
                                    handleChange({
                                        roleId: parseInt(e.target.value),
                                    });
                                }}
                            >
                                {(item) => (
                                    <SelectItem
                                        key={item.value}
                                        textValue={
                                            item.label ? item.label : item.name
                                        }
                                    >
                                        {item.label ? item.label : item.name}
                                    </SelectItem>
                                )}
                            </Select>
                            <Input
                                label="Staff's Email"
                                value={newItem.email}
                                onChange={(e) =>
                                    handleChange({ email: e.target.value })
                                }
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={() => {
                                    handleSave(newItem);
                                    onClose();
                                }}
                            >
                                {isEdit ? 'Update' : 'Invite'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default InviteModal;
