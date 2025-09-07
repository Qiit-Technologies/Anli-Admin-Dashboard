import fetcher from "@/app/actions/fetcher";
import {
  GetPermissionsResponse,
  GetRolesResponse,
  Permission,
} from "@/app/actions/types";
import { InputField } from "@/components/common/form";
import { MultiSelect } from "@/components/common/MultiSelect";
import { SearchSelect } from "@/components/common/SearchSelect";
import { Role } from "@/types/staff";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import useSWR from "swr";
import { Module } from "@/types/module";
import { NewMultiSelect } from "@/components/common/NewMultiSelect";

interface FormData {
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  roleId?: number;
  permissions: Permission[];
  modules?: Module[];
}

interface StaffDetailsTestProps {
  formData: FormData;
  selectedPermissions: string[];
  setSelectedPermissions: Dispatch<SetStateAction<string[]>>;
  selectedModules: string[];
  setSelectedModules: Dispatch<SetStateAction<string[]>>;
  onFormChange: (name: string, value: string) => void;
}

export const StaffDetails = ({
  formData,
  selectedPermissions,
  setSelectedPermissions,
  selectedModules,
  setSelectedModules,
  onFormChange,
}: StaffDetailsTestProps) => {
  const { data: permissionsData } = useSWR(
    "/permissions/public-permissions",
    (url: string) => fetcher<GetPermissionsResponse>(url),
  );

  const permissions: Permission[] = useMemo(
    () => permissionsData?.permissions ?? [],
    [permissionsData],
  );

  const { data: rolesData, isLoading: loadingRoles } = useSWR(
    "/roles",
    (url: string) => fetcher<GetRolesResponse>(url),
  );
  const predefinedRoles = useMemo(() => rolesData || [], [rolesData]);

  const { data: modulesData } = useSWR(
    "/modules/public-modules",
    (url: string) => fetcher<Module[]>(url),
  );

  const modules = useMemo(() => modulesData ?? [], [modulesData]);

  useEffect(() => {
    if (formData.permissions && permissions.length > 0 && modules) {
      const selected = formData.permissions
        .map((p: Permission) => String(p.id))
        .filter((id: string) =>
          permissions.some((perm: Permission) => String(perm.id) === id),
        );

      setSelectedPermissions(selected);
    }
  }, [formData.permissions, permissions, modules, setSelectedPermissions]);

  useEffect(() => {
    if (formData.modules && modules.length > 0) {
      const selected = formData.modules
        .map((m: Module) => String(m.id))
        .filter((id: string) =>
          modules.some((mod: Module) => String(mod.id) === id),
        );

      setSelectedModules(selected);
    }
  }, [formData.modules, modules, setSelectedModules]);

  useEffect(() => {
    if (selectedModules.length > 1 && predefinedRoles) {
      const managerRole = predefinedRoles.find(
        (role: Role) => role.name?.toLowerCase() === "manager",
      );

      if (managerRole && formData.roleId !== managerRole.id) {
        onFormChange("roleId", String(managerRole.id));
      }
    }
  }, [selectedModules, predefinedRoles, formData.roleId, onFormChange]);

  return (
    <form className="w-full h-full mt-2 flex flex-col gap-4">
      <InputField
        id="fullName"
        placeholder="Staff Fullname"
        name="fullName"
        label="Full Name"
        value={formData.fullName}
        readOnly={true}
      />

      <InputField
        id="userName"
        placeholder="Staff Username"
        name="username"
        label="Username"
        value={formData.username}
        readOnly={true}
      />

      <InputField
        id="email"
        placeholder="Staff Email"
        name="email"
        label="Email"
        value={formData.email}
        onChange={(e) => onFormChange("email", e.target.value)}
      />

      <InputField
        id="phoneNumber"
        placeholder="Staff Phone Number"
        name="phoneNumber"
        label="Phone Number"
        value={formData.phoneNumber || ""}
        onChange={(e) => onFormChange("phoneNumber", e.target.value)}
      />

      {selectedModules.length > 1 && (
        <div className="bg-gray-50 text-orion-blue text-xs border rounded-lg p-4">
          Selecting more than one module automatically converts this staffs role
          to manager
        </div>
      )}
      <NewMultiSelect
        items={modules}
        value={selectedModules
          .map((id) => modules.find((m: Module) => m.id.toString() === id))
          .filter((m): m is Module => Boolean(m))}
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

      <NewMultiSelect
        items={permissions}
        value={selectedPermissions
          .map((id) =>
            permissions.find((p: Permission) => p.id.toString() === id),
          )
          .filter((p): p is Permission => Boolean(p))}
        onChange={(items: Permission[]) =>
          setSelectedPermissions(items.map((item) => item.id.toString()))
        }
        placeholder="Select permissions"
        label="Assign Permissions"
        id="permissions-multiselect"
        disabled={false}
        displayValue={(permission: Permission) => permission.name}
        searchPlaceholder="Search permissions..."
        maxSelectedDisplay={3}
      />

      {!loadingRoles && predefinedRoles && (
        <SearchSelect
          id="roles"
          label="Role"
          placeholder="Select a Role"
          items={predefinedRoles}
          disabled={false}
          value={
            formData.roleId
              ? (predefinedRoles?.find(
                  (role: Role) => role.id === formData.roleId,
                ) ?? null)
              : null
          }
          className="w-full min-w-0 h-10"
          onChange={(role: Role) => onFormChange("roleId", String(role.id))}
          displayValue={(role: Role) => role?.name}
        />
      )}
    </form>
  );
};
