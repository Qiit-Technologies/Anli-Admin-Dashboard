import { CustomDialog } from "@/components/common/CustomDialog";
import { useState } from "react";

export const LogInvoiceBtn = () => {
  const [formData, setFormData] = useState({});
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
      title="Log Invoice"
      onSubmit={handleSubmit}
      trigger={
        <button className="rounded-lg bg-[#007BFF] px-4 py-2 font-semibold text-sm text-white hover:bg-blue-700 w-full sm:w-auto">
          Log invoice
        </button>
      }
    >
      <div></div>
    </CustomDialog>
  );
};
