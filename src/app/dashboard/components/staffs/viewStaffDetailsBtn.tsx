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
import { StaffPasswordModal } from "./StaffPasswordModal";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";

export const ViewStaffDetailsBtn = ({
  staffInfo,
  onDelete,
  onUndelete,
  isDeleting,
  isUndeleting,
}: {
  staffInfo: any;
  onDelete?: (staffId: number) => void;
  onUndelete?: (staffId: number) => void;
  isDeleting?: boolean;
  isUndeleting?: boolean;
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

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

  const handleResetConfirm = () => {
    setIsResetPasswordOpen(true);
    setShowResetConfirm(false);
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

      <StaffPasswordModal
        isOpen={isResetPasswordOpen}
        setIsOpen={setIsResetPasswordOpen} // Pass the setter function
        staffInfo={staffInfo}
      />

      {isSheetOpen && (
        <StaffDetailsDrawer
          staffInfo={staffInfo}
          closeSheetMenu={closeSheetMenu}
          isSheetOpen={isSheetOpen}
          openSheetMenu={openSheetMenu}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${staffInfo.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
        isLoading={isDeleting}
      />

      {/* Reset Password Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetConfirm}
        title="Reset Password"
        description={`Are you sure you want to reset the password for ${staffInfo.fullName}? A new password will be generated and shown to you.`}
        confirmText="Reset Password"
        cancelText="Cancel"
        confirmVariant="default"
        isLoading={false}
      />

      {/* Restore Staff Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={handleRestoreConfirm}
        title="Restore Staff Member"
        description={`Are you sure you want to restore ${staffInfo.fullName}? This will make the staff member active again.`}
        confirmText="Restore"
        cancelText="Cancel"
        confirmVariant="default"
        isLoading={isUndeleting}
      />
    </>
  );
};
