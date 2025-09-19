import { CustomDialog } from "@/components/common/CustomDialog";
import { useState } from "react";

export const SwitchBillingCycleBtn = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    try {
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      onSubmit={handleSubmit}
      title="Switch Billing Cycle"
      trigger={
        <button className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-sm text-white hover:bg-gray-600 w-full sm:w-auto">
          Switch billing cycle
        </button>
      }
    >
      <div></div>
    </CustomDialog>
  );
};
