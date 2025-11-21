import { CustomSheet } from "@/components/common/CustomSheet";
import { ViewIssueDetails } from "./ViewIssueDetails";
import { useState } from "react";
import { ReportDTO } from "@/types/report";
import { updateReport } from "@/app/actions/report";
import { toast } from "react-toastify";

export const ViewIssueSheet = ({
  open,
  setOpen,
  report,
  businessId,
  refetch,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  report: ReportDTO;
  businessId: string;
  refetch: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    comment: report.comment || "",
    status: report.status,
  });

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateIssue = async () => {
    setLoading(true);
    try {
      await updateReport(businessId, report.id, formData);

      refetch();
      setOpen(false);
      setFormData({
        comment: "",
        status: "",
      });
      toast.success("Issue updated successfully");
    } catch (error) {
      if (typeof error == "string") {
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomSheet
      open={open}
      loading={loading}
      setOpen={setOpen}
      noTitle={true}
      defaultOpen={false}
      onComplete={handleUpdateIssue}
      onClose={() => setOpen(false)}
    >
      <ViewIssueDetails
        report={report}
        formData={formData}
        handleFormInputChange={handleFormChange}
      />
    </CustomSheet>
  );
};
