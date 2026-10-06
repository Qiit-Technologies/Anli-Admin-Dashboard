'use client';

import { updateRole } from '@/app/actions/roles';
import { getPermissions, Permission } from '@/app/actions/permissions';
import { getModules, Module } from '@/app/actions/modules';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';

// Function to format module name
const formatModuleName = (name: string) => {
    return name
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

const EditRoleModal = ({
    isOpen,
    onOpenChange,
    editedRole,
    onSuccess,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editedRole: any;
    onSuccess: () => void;
}) => {
    const [name, setName] = useState(editedRole?.name || '');
    const [description, setDescription] = useState(
        editedRole?.description || '',
    );
    const [permissionIds, setPermissionIds] = useState<number[]>(
        editedRole?.permissions?.map((p: any) => p.id) || [],
    );
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState<{ name?: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            if (isOpen) {
                setIsLoadingData(true);
                try {
                    const [permissionsRes, modulesRes] = await Promise.all([
                        getPermissions(),
                        getModules(),
                    ]);
                    if (permissionsRes.data) {
                        setPermissions(permissionsRes.data.permissions || []);
                    }
                    if (modulesRes.data) {
                        setModules(modulesRes.data || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch data:', error);
                } finally {
                    setIsLoadingData(false);
                }
            }
        };
        fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (editedRole) {
            setName(editedRole.name || '');
            setDescription(editedRole.description || '');
            setPermissionIds(
                editedRole?.permissions?.map((p: any) => p.id) || [],
            );
        }
    }, [editedRole]);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setErrors({});
        }
    }, [isOpen]);

    const filteredModulesAndPermissions = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filteredModules = modules
            .map((module) => {
                const modulePermissions = permissions.filter(
                    (p) =>
                        p.module?.id === module.id &&
                        (p.name.toLowerCase().includes(query) ||
                            (p.description &&
                                p.description.toLowerCase().includes(query))),
                );
                return { ...module, permissions: modulePermissions };
            })
            .filter((module) => module.permissions.length > 0);

        const ungroupedPermissions = permissions.filter(
            (p) =>
                !p.module &&
                (p.name.toLowerCase().includes(query) ||
                    (p.description &&
                        p.description.toLowerCase().includes(query))),
        );

        return { filteredModules, ungroupedPermissions };
    }, [permissions, modules, searchQuery]);

    const handleNameChange = (value: string) => {
        setName(value);
        if (errors.name) {
            setErrors((prev) => ({ ...prev, name: undefined }));
        }
    };

    const togglePermission = (id: number) => {
        setPermissionIds((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const toggleModulePermissions = (moduleId: number | null) => {
        const modulePermissions = moduleId
            ? filteredModulesAndPermissions.filteredModules.find(
                  (m) => m.id === moduleId,
              )?.permissions || []
            : filteredModulesAndPermissions.ungroupedPermissions;

        const allSelected = modulePermissions.every((p) =>
            permissionIds.includes(p.id),
        );

        setPermissionIds((prev) => {
            const updatedIds = new Set(prev);
            modulePermissions.forEach((p) => {
                if (allSelected) {
                    updatedIds.delete(p.id);
                } else {
                    updatedIds.add(p.id);
                }
            });
            return Array.from(updatedIds);
        });
    };

    const validate = () => {
        const newErrors: { name?: string } = {};
        if (!name.trim()) {
            newErrors.name = 'Role name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await updateRole({
                id: editedRole.id,
                name,
                description,
                permissionIds,
            });

            if (response.message === 'Role updated successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Role updated successfully"
                        type="success"
                    />
                ));
                onSuccess();
                onOpenChange(false);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.message ||
                            'Failed to update role. Please try again.'
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Role</DialogTitle>
                    <DialogDescription>
                        Update the role details and permissions.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={name}
                            placeholder="Enter role name"
                            onChange={(e) => handleNameChange(e.target.value)}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Description
                        </label>
                        <Textarea
                            placeholder="Enter role description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {isLoadingData ? (
                        <div className="text-center py-8">
                            Loading permissions...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium">
                                    Permissions
                                </label>
                                <Input
                                    placeholder="Search permissions..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>

                            {/* Module sections */}
                            {filteredModulesAndPermissions.filteredModules.map(
                                (module) => {
                                    const allSelected =
                                        module.permissions.every((p) =>
                                            permissionIds.includes(p.id),
                                        );
                                    const someSelected =
                                        module.permissions.some((p) =>
                                            permissionIds.includes(p.id),
                                        );

                                    return (
                                        <div
                                            key={module.id}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <h4 className="text-md font-semibold text-gray-800">
                                                    {formatModuleName(
                                                        module.name,
                                                    )}
                                                </h4>
                                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={(el) => {
                                                            if (el) {
                                                                el.indeterminate =
                                                                    someSelected &&
                                                                    !allSelected;
                                                            }
                                                        }}
                                                        onChange={() =>
                                                            toggleModulePermissions(
                                                                module.id,
                                                            )
                                                        }
                                                        className="rounded"
                                                    />
                                                    <span className="text-gray-600">
                                                        Select All
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {module.permissions.map(
                                                    (permission) => (
                                                        <label
                                                            key={permission.id}
                                                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={permissionIds.includes(
                                                                    permission.id,
                                                                )}
                                                                onChange={() =>
                                                                    togglePermission(
                                                                        permission.id,
                                                                    )
                                                                }
                                                                className="rounded"
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {
                                                                    permission.name
                                                                }
                                                            </span>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    );
                                },
                            )}

                            {/* Permissions without module */}
                            {filteredModulesAndPermissions.ungroupedPermissions
                                .length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <h4 className="text-md font-semibold text-gray-800">
                                            Other Permissions
                                        </h4>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filteredModulesAndPermissions.ungroupedPermissions.every(
                                                    (p) =>
                                                        permissionIds.includes(
                                                            p.id,
                                                        ),
                                                )}
                                                ref={(el) => {
                                                    if (el) {
                                                        el.indeterminate =
                                                            filteredModulesAndPermissions.ungroupedPermissions.some(
                                                                (p) =>
                                                                    permissionIds.includes(
                                                                        p.id,
                                                                    ),
                                                            ) &&
                                                            !filteredModulesAndPermissions.ungroupedPermissions.every(
                                                                (p) =>
                                                                    permissionIds.includes(
                                                                        p.id,
                                                                    ),
                                                            );
                                                    }
                                                }}
                                                onChange={() =>
                                                    toggleModulePermissions(
                                                        null,
                                                    )
                                                }
                                                className="rounded"
                                            />
                                            <span className="text-gray-600">
                                                Select All
                                            </span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {filteredModulesAndPermissions.ungroupedPermissions.map(
                                            (permission) => (
                                                <label
                                                    key={permission.id}
                                                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={permissionIds.includes(
                                                            permission.id,
                                                        )}
                                                        onChange={() =>
                                                            togglePermission(
                                                                permission.id,
                                                            )
                                                        }
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm font-medium">
                                                        {permission.name}
                                                    </span>
                                                </label>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="default"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-orion-blue hover:bg-orion-blue/90"
                        onClick={handleSubmit}
                    >
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditRoleModal;
