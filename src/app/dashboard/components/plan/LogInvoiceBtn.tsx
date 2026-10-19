import { CustomDialog } from "@/components/common/CustomDialog";
import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const LogInvoiceBtn = ({
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
      Log invoice
    </DropdownMenuItem>
  ) : (
    <button className="rounded-lg bg-[#007BFF] px-4 py-2 font-semibold text-sm text-white hover:bg-blue-700 w-full sm:w-auto">
      Log invoice
    </button>
  );

  return (
    <CustomDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      title="Log Invoice"
      onSubmit={handleSubmit}
      loading={loading}
      trigger={trigger}
    >
      <div></div>
    </CustomDialog>
  );
};
