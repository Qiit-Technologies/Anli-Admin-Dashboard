import { Td } from "@/components/common/customTable";
import { StaffDetailsDrawer } from "./staffDetailsDrawer";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { CustomSheet } from "@/components/common/CustomSheet";
import { StaffPasswordModal } from "./StaffPasswordModal";

export const ViewStaffDetailsBtn = ({ staffInfo, refetch }: any) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const openSheetMenu = () => setIsSheetOpen(true);
  const closeSheetMenu = () => setIsSheetOpen(false);

  return (
    <>
      <Td className="text-blue-600 hover:underline cursor-pointer py-4 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)}>
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openSheetMenu}>
              Edit Staff
            </DropdownMenuItem>
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
          isSheetOpen={isSheetOpen}
          refetch={refetch}
          openSheetMenu={openSheetMenu}
          closeSheetMenu={closeSheetMenu}
        />
      )}
    </>
  );
};
