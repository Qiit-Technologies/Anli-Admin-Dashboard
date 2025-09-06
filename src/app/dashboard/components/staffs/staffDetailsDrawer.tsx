import { StaffDetails } from "./staffDetails";
import { useState } from "react";
import { updateStaff } from "@/app/actions/staff";
import { CustomSheet } from "@/components/common/CustomSheet";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { ErrorResponseData } from "@/hooks/types";

export interface StaffInfoInterface {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  department: string;
  roles: {
    id: number;
  };
  roleId?: number;
  modules: [];
  permissions: [];
}

export const StaffDetailsDrawer = ({
  refetch,
  staffInfo,
  isSheetOpen,
  openSheetMenu,
  closeSheetMenu,
  businessId,
}: {
  refetch: () => void;
  staffInfo: StaffInfoInterface;
  isSheetOpen: boolean;
  openSheetMenu: () => void;
  closeSheetMenu: () => void;
  businessId: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<StaffInfoInterface>>({
    fullName: staffInfo.fullName,
    username: staffInfo.username,
    email: staffInfo.email,
    phoneNumber: staffInfo.phoneNumber,
    roleId: staffInfo?.roles?.id,
    permissions: staffInfo.permissions || [],
    modules: staffInfo.modules || [],
  });

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function updateStaffDetails() {
    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        roleId: formData.roleId,
        permissions: selectedPermissions.map(Number),
        modules: selectedModules.map(Number),
      };

      await updateStaff(Number(businessId), payload, staffInfo.id);

      toast.success("Staff member updated successfully");
      refetch();
      closeSheetMenu();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as ErrorResponseData)?.message ||
          "An unexpected error occurred";
        toast.error(message);
        return;
      }

      toast.error("Failed to update staff information");
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomSheet
      title="Edit Staff Member"
      subTitle="Update staff member details"
      open={isSheetOpen}
      setOpen={(open) => (open ? openSheetMenu() : closeSheetMenu())}
      loading={loading}
      onComplete={updateStaffDetails}
    >
      <StaffDetails
        formData={formData}
        onFormChange={handleFormChange}
        selectedModules={selectedModules}
        setSelectedModules={setSelectedModules}
        selectedPermissions={selectedPermissions}
        setSelectedPermissions={setSelectedPermissions}
      />
    </CustomSheet>
  );
};
