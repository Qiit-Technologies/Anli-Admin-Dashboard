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
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { StaffInfoInterface } from "./staffDetailsDrawer";
import { Module } from "@/types/module";

interface FormData {
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  roleId?: number;
  permissions?: string[];
  modules?: [];
}

interface StaffDetailsTestProps {
  formData: FormData;
  selectedPermissions: string[];
  setSelectedPermissions: Dispatch<SetStateAction<string[]>>;
  selectedModules: string[];
  setSelectedModules: Dispatch<SetStateAction<string[]>>;
  onFormChange: (name: string, value: any) => void;
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

  const permissions = useMemo(
    () => permissionsData?.permissions ?? [],
    [permissionsData],
  );

  const { data: rolesData, isLoading: loadingRoles } = useSWR(
    "/roles",
    (url: string) => fetcher<GetRolesResponse>(url),
  );
  const predefinedRoles = rolesData || [];

  const { data: modulesData } = useSWR(
    "/modules/public-modules",
    (url: string) => fetcher<Module[]>(url),
  );

  const modules = useMemo(() => modulesData ?? [], [modulesData]);

  useEffect(() => {
    if (formData.permissions && permissions.length > 0 && modules) {
      const selected = formData.permissions
        .map((p: any) => String(p.id))
        .filter((id: string) =>
          permissions.some((perm: any) => String(perm.id) === id),
        );

      setSelectedPermissions(selected);
    }
  }, [formData.permissions, permissions]);

  useEffect(() => {
    if (formData.modules && modules.length > 0) {
      const selected = formData.modules
        .map((m: any) => String(m.id))
        .filter((id: string) =>
          modules.some((mod: any) => String(mod.id) === id),
        );

      setSelectedModules(selected);
    }
  }, [formData.modules, modules]);

  useEffect(() => {
    if (selectedModules.length > 1 && predefinedRoles) {
      const managerRole = predefinedRoles.find(
        (role: any) => role.name?.toLowerCase() === "manager",
      );

      if (managerRole && formData.roleId !== managerRole.id) {
        onFormChange("roleId", managerRole.id);
      }
    }
  }, [selectedModules, predefinedRoles, formData.roleId]);

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

      <MultiSelect
        options={(modules ?? []).map((module: Module) => ({
          label: module.name,
          value: module.id.toString(),
        }))}
        value={selectedModules}
        onValueChange={setSelectedModules}
        placeholder="Select modules"
        variant="inverted"
        animation={0}
        maxCount={3}
        className="shadow-content1 w-full"
        label="Modules Access"
      />

      <MultiSelect
        options={(permissions ?? []).map((permission: Permission) => ({
          label: permission.name,
          value: permission.id.toString(),
        }))}
        value={selectedPermissions}
        onValueChange={setSelectedPermissions}
        placeholder="Select permissions"
        variant="inverted"
        animation={0}
        maxCount={4}
        className="shadow-content1 w-full"
        label="Permissions"
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
              ? predefinedRoles?.find(
                  (role: Role) => role.id === formData.roleId,
                )
              : null
          }
          className="w-full min-w-0 h-10"
          onChange={(role: Role) => onFormChange("roleId", role.id)}
          displayValue={(role: Role) => role?.name}
        />
      )}
    </form>
  );
};
