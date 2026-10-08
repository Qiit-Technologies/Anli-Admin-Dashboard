'use client';

import { addStaffV2 } from '@/app/actions/add-staff-v2';
import { getModules, Module } from '@/app/actions/modules';
import { getPermissions, Permission } from '@/app/actions/permissions';
import { fetchRoles } from '@/app/actions/staff';
import Toast from '@/components/toast';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import { updateStaffV2 } from '@/app/actions/update-staff-v2';
import { EmployeeType } from '@/types/employee';

interface AddStaffModalV2Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    onSuccess: () => void;
    staff?: EmployeeType | null;
}

export const AddStaffModalV2 = ({
    isOpen,
    onOpenChange,
    // onClose,
    onSuccess,
    staff = null,
}: AddStaffModalV2Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        roleId: '',
        pin: ['', '', '', ''],
    });

    const [selectedTab, setSelectedTab] = useState<'permissions' | 'report'>(
        'permissions',
    );

    React.useEffect(() => {
        if (staff && isOpen) {
            setFormData({
                fullName: staff.fullName || '',
                email: staff.email || '',
                roleId: staff.roles?.id?.toString() || '',
                pin: ['', '', '', ''], // PIN is usually not returned from backend
            });
            setSelectedPermissions(staff.permissions?.map((p) => p.id) || []);
            setSelectedModules(staff.modules?.map((m) => m.id) || []);
        } else if (!staff && isOpen) {
            setFormData({
                fullName: '',
                email: '',
                roleId: '',
                pin: ['', '', '', ''],
            });
            setSelectedPermissions([]);
            setSelectedModules([]);
        }
    }, [staff, isOpen]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
        [],
    );
    const [selectedModules, setSelectedModules] = useState<number[]>([]);
    const [permissionSearchQuery, setPermissionSearchQuery] = useState('');

    const { data: roles } = useSWR('/roles', fetchRoles);
    const { data: modulesData } = useSWR('/modules/public-modules', getModules);
    const { data: permissionsData } = useSWR(
        '/permissions/public-permissions',
        getPermissions,
    );

    const modules = useMemo(() => modulesData?.data ?? [], [modulesData]);
    const permissions = useMemo(
        () => (permissionsData?.data?.permissions as Permission[]) ?? [],
        [permissionsData],
    );

    const groupedPermissions = useMemo(() => {
        const groups: {
            name: string;
            id?: number;
            permissions: Permission[];
        }[] = [];

        // Filter permissions based on active tab and search query
        const tabFilteredPerms = permissions.filter((p) => {
            const isReport =
                p.name.toLowerCase().includes('report') ||
                p.description?.toLowerCase().includes('report');

            const matchesSearch =
                p.name
                    .toLowerCase()
                    .includes(permissionSearchQuery.toLowerCase()) ||
                p.description
                    ?.toLowerCase()
                    .includes(permissionSearchQuery.toLowerCase());

            const isCorrectTab =
                selectedTab === 'report' ? isReport : !isReport;

            return isCorrectTab && matchesSearch;
        });

        // Add modules with their permissions
        modules.forEach((mod: Module) => {
            const modPerms = tabFilteredPerms.filter(
                (p: any) => p.module?.id === mod.id || p.moduleId === mod.id,
            );
            if (modPerms.length > 0) {
                groups.push({
                    name: mod.description || mod.name,
                    id: mod.id,
                    permissions: modPerms,
                });
            }
        });

        // Add General group for permissions without moduleId
        const generalPerms = tabFilteredPerms.filter(
            (p: any) => !p.module?.id && !p.moduleId,
        );
        if (generalPerms.length > 0) {
            groups.push({
                name: 'General',
                permissions: generalPerms,
            });
        }

        return groups;
    }, [modules, permissions, selectedTab, permissionSearchQuery]);

    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (value && !/^\d*$/.test(value)) return;

        const newPin = [...formData.pin];
        newPin[index] = value;
        setFormData({ ...formData, pin: newPin });

        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === 'Backspace' && !formData.pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            prevInput?.focus();
        }
    };

    const togglePermission = (permId: number, moduleId?: number) => {
        setSelectedPermissions((prev) => {
            const isSelected = prev.includes(permId);
            const next = isSelected
                ? prev.filter((id) => id !== permId)
                : [...prev, permId];

            // If selecting a permission, ensure the module is also selected
            if (
                !isSelected &&
                moduleId &&
                !selectedModules.includes(moduleId)
            ) {
                setSelectedModules((prevMod) => [...prevMod, moduleId]);
            }

            return next;
        });
    };

    const toggleModule = (moduleId: number) => {
        setSelectedModules((prev) => {
            const isSelected = prev.includes(moduleId);
            const next = isSelected
                ? prev.filter((id) => id !== moduleId)
                : [...prev, moduleId];

            // If unselecting a module, unselect all its permissions
            // If unselecting a module, unselect all its permissions
            if (isSelected) {
                const modPerms = permissions
                    .filter(
                        (p: any) =>
                            p.module?.id === moduleId ||
                            p.moduleId === moduleId,
                    )
                    .map((p) => p.id);
                setSelectedPermissions((prevPerms) =>
                    prevPerms.filter((id) => !modPerms.includes(id)),
                );
            } else {
                // If selecting a module, select all its permissions for the CURRENT tab
                const modPerms = permissions.filter(
                    (p: any) =>
                        p.module?.id === moduleId || p.moduleId === moduleId,
                );

                const tabPerms = modPerms
                    .filter((p) => {
                        const isReport =
                            p.name.toLowerCase().includes('report') ||
                            p.description?.toLowerCase().includes('report');
                        return selectedTab === 'report' ? isReport : !isReport;
                    })
                    .map((p) => p.id);

                setSelectedPermissions((prevPerms) => {
                    const uniqueNewPerms = tabPerms.filter(
                        (id) => !prevPerms.includes(id),
                    );
                    return [...prevPerms, ...uniqueNewPerms];
                });
            }

            return next;
        });
    };

    const handleSubmit = async () => {
        if (!formData.roleId) {
            toast.error('Please select a user role');
            return;
        }

        if (!formData.fullName) {
            toast.error('Please enter full name');
            return;
        }

        if (!formData.email) {
            toast.error('Please enter email address');
            return;
        }

        setIsLoading(true);
        try {
            const pinString = formData.pin.join('');

            const payload: any = {
                fullName: formData.fullName,
                email: formData.email,
                username: formData.email,
                roleId: parseInt(formData.roleId),
                modules: selectedModules,
                permissions: selectedPermissions,
            };

            if (pinString.length === 4) {
                payload.pin = pinString;
            }

            const response = staff
                ? await updateStaffV2(staff.id, payload)
                : await addStaffV2(payload);

            if (response?.message?.includes('successfully')) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                onSuccess();
            } else {
                toast.error(response?.message || 'Failed to invite staff');
            }
        } catch (error: any) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden rounded-2xl border-none">
                <div className="p-6 pb-4 flex items-center justify-between border-b border-[#EAECF0]">
                    <DialogTitle className="text-xl font-bold text-[#101828]">
                        {staff ? 'Edit User' : 'Add User'}
                    </DialogTitle>
                </div>

                <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label className="text-sm font-medium text-[#667085]">
                                User Role
                            </Label>
                            <Select
                                value={formData.roleId}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, roleId: val })
                                }
                            >
                                <SelectTrigger className="h-11 rounded-lg border-[#D0D5DD] bg-[#F9FAFB]">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles?.data?.map((role: any) => (
                                        <SelectItem
                                            key={role.id}
                                            value={role.id.toString()}
                                        >
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label className="text-sm font-medium text-[#667085]">
                                Full Name
                            </Label>
                            <Input
                                placeholder="Enter Full Name"
                                className="h-11 rounded-lg border-[#D0D5DD] bg-[#F9FAFB]"
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fullName: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#667085]">
                            User Email Address
                        </Label>
                        <Input
                            placeholder="Enter Email Address"
                            className="h-11 rounded-lg border-[#D0D5DD] bg-[#F9FAFB]"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#667085]">
                            User pin
                        </Label>
                        <div className="flex gap-3">
                            {formData.pin.map((digit, i) => (
                                <Input
                                    key={i}
                                    id={`pin-${i}`}
                                    className="w-12 h-12 text-center text-lg font-bold rounded-lg border-[#D0D5DD] bg-[#F9FAFB] focus:bg-white focus:ring-1 focus:ring-[#007BFF]"
                                    value={digit}
                                    onChange={(e) =>
                                        handlePinChange(i, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    maxLength={1}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#F9FAFB] p-5 rounded-xl border border-[#EAECF0]">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-semibold text-[#667085]">
                                Module-Based Permissions
                            </p>
                            <div className="relative w-40">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-8 h-8 text-xs border-[#D0D5DD] rounded-lg bg-white"
                                    value={permissionSearchQuery}
                                    onChange={(e) =>
                                        setPermissionSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <Tabs
                            defaultValue="permissions"
                            className="w-full mb-4"
                        >
                            <TabsList className="bg-[#EAECF0] p-1 h-10 w-full rounded-lg">
                                <TabsTrigger
                                    value="permissions"
                                    className="flex-1 rounded-md py-1.5 data-[state=active]:bg-[#007BFF] data-[state=active]:text-white text-[#667085]"
                                    onClick={() =>
                                        setSelectedTab('permissions')
                                    }
                                >
                                    Permissions
                                </TabsTrigger>
                                <TabsTrigger
                                    value="report"
                                    className="flex-1 rounded-md py-1.5 data-[state=active]:bg-[#007BFF] data-[state=active]:text-white text-[#667085]"
                                    onClick={() => setSelectedTab('report')}
                                >
                                    Report
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {groupedPermissions.length > 0 ? (
                            <Accordion
                                type="single"
                                collapsible
                                className="space-y-3"
                            >
                                {groupedPermissions.map((group) => (
                                    <AccordionItem
                                        key={group.name}
                                        value={group.name}
                                        className="border-none bg-white rounded-xl px-4 border border-[#EAECF0] shadow-sm overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            {group.id && (
                                                <Checkbox
                                                    checked={selectedModules.includes(
                                                        group.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleModule(group.id!)
                                                    }
                                                    className="h-5 w-5 rounded border-[#D0D5DD] data-[state=checked]:bg-[#007BFF] data-[state=checked]:border-[#007BFF]"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <AccordionTrigger className="hover:no-underline py-4 text-sm font-md text-[#101828] w-full">
                                                    {group.name}
                                                </AccordionTrigger>
                                            </div>
                                        </div>
                                        <AccordionContent className="pb-4">
                                            <div className="grid grid-cols-1 gap-1 pt-1">
                                                {group.permissions.length >
                                                0 ? (
                                                    group.permissions.map(
                                                        (perm) => (
                                                            <div
                                                                key={perm.id}
                                                                className="flex items-center justify-between w-full p-2 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                                                            >
                                                                <label
                                                                    htmlFor={`perm-${perm.id}`}
                                                                    className="text-sm font-medium text-[#344054] cursor-pointer"
                                                                >
                                                                    {perm.name}
                                                                </label>
                                                                <Checkbox
                                                                    id={`perm-${perm.id}`}
                                                                    checked={selectedPermissions.includes(
                                                                        perm.id,
                                                                    )}
                                                                    onCheckedChange={() =>
                                                                        togglePermission(
                                                                            perm.id,
                                                                            group.id,
                                                                        )
                                                                    }
                                                                    className="h-5 w-5 rounded-md border-gray-400 data-[state=checked]:bg-[#007BFF] data-[state=checked]:border-[#007BFF]"
                                                                />
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <p className="text-xs text-[#98A2B3] italic px-2">
                                                        No specific permissions
                                                        for this module
                                                    </p>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-sm text-[#667085] text-center py-4">
                                No items found
                            </p>
                        )}
                    </div>

                    <Button
                        className="w-full h-12 bg-[#007BFF] hover:bg-[#0069D9] text-white font-bold rounded-lg mt-2 shadow-sm"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save User'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
