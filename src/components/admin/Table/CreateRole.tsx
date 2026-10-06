'use client';

import { createRole } from '@/app/actions/roles';
import { getPermissions, Permission } from '@/app/actions/permissions';
import { getModules, Module } from '@/app/actions/modules';
import Toast from '@/components/toast';
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface Role {
    name: string;
    description: string;
    permissionIds: number[];
}

const initialRoleState: Role = {
    name: '',
    description: '',
    permissionIds: [],
};

interface CreateRoleModalProps {
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

// Function to format module name
const formatModuleName = (name: string) => {
    return name
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
    trigger,
    isOpen,
    onOpenChange,
    onSuccess,
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const actualOpen = isOpen ?? internalOpen;
    const handleOpenChange = (open: boolean) => {
        if (onOpenChange) {
            onOpenChange(open);
        } else {
            setInternalOpen(open);
        }
        if (!open) {
            setNewRole(initialRoleState);
            setSearchQuery('');
            setErrors({});
        }
    };

    const [newRole, setNewRole] = useState<Role>(initialRoleState);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState<{ name?: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            if (actualOpen) {
                setIsLoadingPermissions(true);
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
                    setIsLoadingPermissions(false);
                }
            }
        };
        fetchData();
    }, [actualOpen]);

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

    const handleChange = (value: Partial<Role>) => {
        setNewRole({
            ...newRole,
            ...value,
        });
        if (value.name !== undefined) {
            setErrors((prev) => ({ ...prev, name: undefined }));
        }
    };

    const togglePermission = (permissionId: number) => {
        setNewRole((prev) => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permissionId)
                ? prev.permissionIds.filter((id) => id !== permissionId)
                : [...prev.permissionIds, permissionId],
        }));
    };

    const toggleModulePermissions = (moduleId: number | null) => {
        const modulePermissions = moduleId
            ? filteredModulesAndPermissions.filteredModules.find(
                  (m) => m.id === moduleId,
              )?.permissions || []
            : filteredModulesAndPermissions.ungroupedPermissions;

        const allSelected = modulePermissions.every((p) =>
            newRole.permissionIds.includes(p.id),
        );

        setNewRole((prev) => {
            const updatedIds = new Set(prev.permissionIds);
            modulePermissions.forEach((p) => {
                if (allSelected) {
                    updatedIds.delete(p.id);
                } else {
                    updatedIds.add(p.id);
                }
            });
            return {
                ...prev,
                permissionIds: Array.from(updatedIds),
            };
        });
    };

    const validate = () => {
        const newErrors: { name?: string; permissionIds?: string } = {};
        if (!newRole.name.trim()) {
            newErrors.name = 'Role name is required';
        }
        if (newRole.permissionIds.length === 0) {
            newErrors.permissionIds = 'At least one permission is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            return;
        }
        const result = await createRole({
            name: newRole.name,
            description: newRole.description,
            permissionIds: newRole.permissionIds,
        });

        if (result.message === 'Role created successfully!') {
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={`Role "${newRole.name}" created successfully.`}
                    type="success"
                />
            ));
            handleOpenChange(false);
            onSuccess?.();
        } else {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={result.message}
                    type="error"
                />
            ));
        }
    };

    return (
        <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>
                        Create a new role with the permissions you want.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={newRole.name}
                            onChange={(e) =>
                                handleChange({ name: e.target.value })
                            }
                            placeholder="Enter role name"
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
                            value={newRole.description}
                            onChange={(e) =>
                                handleChange({ description: e.target.value })
                            }
                            placeholder="Enter role description"
                        />
                    </div>

                    {isLoadingPermissions ? (
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
                                {errors.permissionIds && (
                                    <p className="text-sm text-red-500">
                                        {errors.permissionIds}
                                    </p>
                                )}
                            </div>

                            {/* Module sections */}
                            {filteredModulesAndPermissions.filteredModules.map(
                                (module) => {
                                    const allSelected =
                                        module.permissions.every((p) =>
                                            newRole.permissionIds.includes(
                                                p.id,
                                            ),
                                        );
                                    const someSelected =
                                        module.permissions.some((p) =>
                                            newRole.permissionIds.includes(
                                                p.id,
                                            ),
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
                                                                checked={newRole.permissionIds.includes(
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
                                                        newRole.permissionIds.includes(
                                                            p.id,
                                                        ),
                                                )}
                                                ref={(el) => {
                                                    if (el) {
                                                        el.indeterminate =
                                                            filteredModulesAndPermissions.ungroupedPermissions.some(
                                                                (p) =>
                                                                    newRole.permissionIds.includes(
                                                                        p.id,
                                                                    ),
                                                            ) &&
                                                            !filteredModulesAndPermissions.ungroupedPermissions.every(
                                                                (p) =>
                                                                    newRole.permissionIds.includes(
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
                                                        checked={newRole.permissionIds.includes(
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
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-orion-blue hover:bg-orion-blue/90"
                        onClick={handleSave}
                    >
                        Create Role
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateRoleModal;
