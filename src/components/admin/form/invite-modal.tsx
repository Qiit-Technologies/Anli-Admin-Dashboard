import { getModules, Module } from '@/app/actions/modules';
import { getPermissions, Permission } from '@/app/actions/permissions';
import { fetchRoles, inviteStaff, updateStaff } from '@/app/actions/staff';
import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
// Remove the old MultiSelect import completely
// import { MultiSelect } from '@/components/common/multi-select';
import { MultiSelectAlternative } from '@/components/common/MultiSelectAlternative';
import { SearchSelectAlternative } from '@/components/common/SearchSelectAlternative';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Role, SimplifiedStaff } from '@/types/staff.types';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

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
    mode: 'add' | 'edit';
    staffData?: SimplifiedStaff;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const InviteModal = ({
    mode,
    staffData = initialItemState,
    onSuccess,
    onCancel,
}: InviteModalProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<SimplifiedStaff>(staffData);

    const [selectedModules, setSelectedModules] = useState<string[]>([]);

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        [],
    );

    const { data: roles, isLoading: loadingRoles } = useSWR(
        '/roles',
        fetchRoles,
    );
    const predefinedRoles = roles?.data;

    const { data: modulesData } = useSWR('/modules/public-modules', getModules);
    const modules = useMemo(() => modulesData?.data ?? [], [modulesData]);

    const { data: permissionsData } = useSWR(
        '/permissions/public-permissions',
        getPermissions,
    );

    const permissions = useMemo(
        () => permissionsData?.data?.permissions ?? [],
        [permissionsData],
    );

    const handleInputChange = (name: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (selectedModules.length > 1 && predefinedRoles) {
            const managerRole = predefinedRoles.find(
                (role: any) => role.name?.toLowerCase() === 'manager',
            );

            if (managerRole && formData.roleId !== managerRole.id) {
                setFormData((prev) => ({
                    ...prev,
                    roleId: managerRole.id,
                }));
            }
        }
    }, [selectedModules, predefinedRoles, formData.roleId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const payload = {
            fullName: formData.fullName,
            email: formData.email,
            username: mode === 'edit' ? formData.username : formData.fullName,
            roleId: formData.roleId,
            modules: selectedModules.map(Number),
            permissions: selectedPermissions.map(Number),
        };

        try {
            if (mode === 'edit') {
                await updateStaff(payload, formData.id);
                await mutate('/staff-members');
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={`Staff updated successfully: ${formData.email}`}
                        type="success"
                    />
                ));

                onSuccess?.();
            } else {
                const response = await inviteStaff(payload);

                if (response?.message === 'Staff invited successfully') {
                    await mutate('/staff-members');
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={`Staff invited successfully: ${formData.email}`}
                            type="success"
                        />
                    ));

                    setFormData(initialItemState);
                    onSuccess?.();
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response?.message || 'Invite failed'}
                            type="error"
                        />
                    ));
                }
            }
        } catch (error: any) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Unexpected error occurred';
            setError(message);

            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={`Failed to ${
                        mode === 'edit' ? 'update' : 'invite'
                    } staff: ${message}`}
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (staffData && mode === 'edit' && roles?.data) {
            const matchedRole = roles.data.find(
                (role: any) => role.id === staffData.roleId,
            );
            if (matchedRole) {
                setFormData((prev) => ({
                    ...prev,
                    roleId: matchedRole.id,
                }));
            }
        }
    }, [mode, staffData, roles]);

    useEffect(() => {
        if (
            mode === 'edit' &&
            staffData &&
            Array.isArray(staffData.modules) &&
            Array.isArray(modules) &&
            modules.length > 0
        ) {
            const selected = staffData.modules
                .map((m: any) => String(m.id))
                .filter((id: string) =>
                    modules.some((mod: any) => String(mod.id) === id),
                );

            setSelectedModules(selected);
        }
    }, [mode, staffData, staffData.modules, modules]);

    useEffect(() => {
        if (
            mode === 'edit' &&
            staffData &&
            Array.isArray(staffData.permissions) &&
            Array.isArray(permissions) &&
            permissions.length > 0
        ) {
            const selected = staffData.permissions
                .map((p: any) => String(p.id))
                .filter((id: string) =>
                    permissions.some((perm: any) => String(perm.id) === id),
                );

            setSelectedPermissions(selected);
        }
    }, [mode, staffData, staffData.permissions, permissions]);

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 w-full min-w-0"
            style={{ width: '100%' }}
        >
            <InputField
                id="fullName"
                placeholder="Staff FullName"
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
            {mode === 'edit' && (
                <InputField
                    id="username"
                    placeholder="Staff Username"
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={(e) =>
                        handleInputChange('username', e.target.value)
                    }
                />
            )}
            <InputField
                id="email"
                name="email"
                label="Email"
                placeholder="Staff Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {!loadingRoles && (
                <SearchSelectAlternative
                    id="roles"
                    label="Role"
                    placeholder="Select a Role"
                    disabled={selectedModules.length > 1}
                    items={predefinedRoles}
                    value={
                        formData.roleId
                            ? predefinedRoles?.find(
                                  (role: Role) => role.id === formData.roleId,
                              )
                            : null
                    }
                    className="w-full min-w-0"
                    onChange={(role: Role) =>
                        handleInputChange('roleId', role.id)
                    }
                    displayValue={(role: Role) => role?.name}
                />
            )}
            {selectedModules.length > 1 && (
                <div className="bg-gray-50 text-orion-blue text-xs border rounded-lg p-4">
                    Selecting more than one module automatically converts this
                    staffs role to manager
                </div>
            )}
            <MultiSelectAlternative
                items={modules}
                value={selectedModules
                    .map((id) =>
                        modules.find((m: Module) => m.id.toString() === id),
                    )
                    .filter(Boolean)}
                onChange={(items: Module[]) =>
                    setSelectedModules(items.map((item) => item.id.toString()))
                }
                placeholder="Select modules"
                label="Modules Access"
                id="modules-multiselect"
                disabled={false}
                displayValue={(module: Module) => module.name}
                searchPlaceholder="Search modules..."
                maxSelectedDisplay={3}
            />
            <MultiSelectAlternative
                items={permissions}
                value={selectedPermissions
                    .map((id) =>
                        permissions.find(
                            (p: Permission) => p.id.toString() === id,
                        ),
                    )
                    .filter(Boolean)}
                onChange={(items: Permission[]) =>
                    setSelectedPermissions(
                        items.map((item) => item.id.toString()),
                    )
                }
                placeholder="Select permissions"
                label="Assign Permissions"
                id="permissions-multiselect"
                disabled={false}
                displayValue={(permission: Permission) => permission.name}
                searchPlaceholder="Search permissions..."
                maxSelectedDisplay={3}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex w-full gap-2">
                <Button
                    variant="outline"
                    type="button"
                    className="px-4 py-2 w-full text-sm font-medium shadow-none text-gray-700 rounded-md hover:bg-gray-50"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <BrandButton
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading
                        ? 'Processing...'
                        : mode === 'edit'
                          ? 'Update'
                          : 'Invite'}
                </BrandButton>
            </div>
        </form>
    );
};
