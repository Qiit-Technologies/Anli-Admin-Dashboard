import { Td } from "@/components/common/customTable";
import { StaffDetailsDrawer } from "./staffDetailsDrawer";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { requestStaffPasswordReset } from "@/app/actions/staff";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { ErrorResponseData } from "@/hooks/types";

export const ViewStaffDetailsBtn = ({
  staffInfo,
  onDelete,
  onUndelete,
  isDeleting,
  isUndeleting,
  refetch,
  businessId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staffInfo: any;
  onDelete?: (staffId: number) => void;
  onUndelete?: (staffId: number) => void;
  isDeleting?: boolean;
  isUndeleting?: boolean;
  refetch?: () => void;
  businessId: string;
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const openSheetMenu = () => setIsSheetOpen(true);
  const closeSheetMenu = () => setIsSheetOpen(false);

  const isDeleted = staffInfo.deletedAt;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleRestoreClick = () => {
    setShowRestoreConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete?.(staffInfo.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Keep modal open on error, let the parent handle the error display
      console.error("Delete failed:", error);
    }
  };

  // C3: resets now email a single-use link — no password is typed,
  // generated, or displayed anywhere in the HQ.
  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await requestStaffPasswordReset(staffInfo.id);
      toast.success(`Password reset link sent to ${staffInfo.email}`);
      setShowResetConfirm(false);
    } catch (error: unknown) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as ErrorResponseData)?.message
          : undefined;
      toast.error(
        typeof message === "string" && message
          ? message
          : "Failed to send reset link",
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleRestoreConfirm = async () => {
    console.log("staffInfo object:", staffInfo);
    console.log("staffInfo.id:", staffInfo.id);
    try {
      await onUndelete?.(staffInfo.id);
      setShowRestoreConfirm(false);
    } catch (error) {
      // Keep modal open on error, let the parent handle the error display
      console.error("Restore failed:", error);
    }
  };

  return (
    <>
      <Td className="text-blue-600 hover:underline cursor-pointer py-4 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {!isDeleted && (
              <DropdownMenuItem onClick={handleResetClick}>
                Reset Password
              </DropdownMenuItem>
            )}
            {!isDeleted && (
              <DropdownMenuItem onClick={openSheetMenu}>
                Edit Staff
              </DropdownMenuItem>
            )}
            {!isDeleted ? (
              <DropdownMenuItem
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                Delete Staff
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={handleRestoreClick}
                disabled={isUndeleting}
                className="text-green-600 focus:text-green-600"
              >
                Restore Staff
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Td>

      {/* Reset Password Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
        title="Reset Password"
        description={`Are you sure you want to reset the password for ${staffInfo.fullName}? A single-use reset link will be emailed to ${staffInfo.email}.`}
        confirmLabel="Send reset link"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isResetting}
      />

      {isSheetOpen && (
        <StaffDetailsDrawer
          staffInfo={staffInfo}
          isSheetOpen={isSheetOpen}
          refetch={refetch || (() => {})}
          openSheetMenu={openSheetMenu}
          closeSheetMenu={closeSheetMenu}
          businessId={businessId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${staffInfo.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Restore Staff Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={handleRestoreConfirm}
        title="Restore Staff Member"
        description={`Are you sure you want to restore ${staffInfo.fullName}? This will make the staff member active again.`}
        confirmLabel="Restore"
        cancelLabel="Cancel"
        variant="primary"
        isLoading={isUndeleting}
      />
    </>
  );
};
