import { resetStaffPassword } from "@/app/actions/staff";
import { CustomDialog } from "@/components/common/CustomDialog";
import { InputField } from "@/components/common/form";
import { useBusiness } from "@/context/businessContext";
import { ErrorResponseData } from "@/hooks/types";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
  staffInfo: {
    id: number;
    email: string;
  };
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const StaffPasswordModal = ({ staffInfo, isOpen, setIsOpen }: Props) => {
  const { business } = useBusiness();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [, setLoading] = useState(false);

  const resetPassword = async () => {
    try {
      setError(null);
      if (!business) {
        throw new Error("Business not found");
      }

      const payload = {
        email: staffInfo.email,
        password: formData.password,
      };

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const response = await resetStaffPassword(
        business?.id,
        staffInfo.id,
        payload,
      );

      if (!response) {
        throw new Error("Failed to reset password");
      }

      toast.success("Password reset successfully");

      setIsOpen(false);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as ErrorResponseData)?.message ||
          "An unexpected error occurred";
        toast.error(errorMessage);
        setError(errorMessage);
        return;
      }

      toast.error("Failed to reset password");
    } finally {
      setError(null);
      setLoading(false);
    }
  };

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <CustomDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onSubmit={resetPassword}
      title="Reset Staff Password"
      subTitle={`Are you sure you want to reset the password for ${staffInfo.email}?`}
    >
      <form className="space-y-2">
        <InputField
          id="password"
          placeholder="New Password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={(e) => handleFormChange("password", e.target.value)}
        />

        <InputField
          id="confirmPassword"
          placeholder="Confirm Password"
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => handleFormChange("confirmPassword", e.target.value)}
        />
        {error && (
          <span className="text-xs text-red-500 font-semibold">{error}</span>
        )}
      </form>
    </CustomDialog>
  );
};
