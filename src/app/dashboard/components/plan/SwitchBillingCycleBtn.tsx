import { CustomDialog } from "@/components/common/CustomDialog";
import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const SwitchBillingCycleBtn = ({
  asMenuItem = false,
}: {
  asMenuItem?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    try {
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const trigger = asMenuItem ? (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        setIsDialogOpen(true);
      }}
      className="cursor-pointer"
    >
      Switch billing cycle
    </DropdownMenuItem>
  ) : (
    <button className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-sm text-white hover:bg-gray-600 w-full sm:w-auto">
      Switch billing cycle
    </button>
  );

  return (
    <CustomDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSubmit={handleSubmit}
      title="Switch Billing Cycle"
      loading={loading}
      trigger={trigger}
    >
      <div></div>
    </CustomDialog>
  );
};
