import { createIssue } from "@/app/actions/report";
import { CustomDialog } from "@/components/common/CustomDialog";
import { TextAreaInput } from "@/components/common/TextAreaInput";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-toastify";

export const AddIssueBtn = ({
  businessId,
  refetch,
}: {
  businessId: string;
  refetch: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
  });

  const handleFormInput = (value: string, field: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreateIssue = async () => {
    setLoading(true);
    try {
      if (!formData.description.trim()) {
        toast.error("Description cannot be empty.");
        return;
      }

      await createIssue(formData, businessId);
      setIsDialogOpen(false);
      setFormData({
        description: "",
      });

      toast.success("Staff member updated successfully");
      refetch();
    } catch (error: any) {
      if (typeof error === "string") toast.error(error);
      else toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomDialog
      subTitle="Please include a description of the issue you are trying to report"
      loading={loading}
      title="Create Issue"
      onSubmit={handleCreateIssue}
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      trigger={<Button>Create Issue</Button>}
    >
      <TextAreaInput
        required={true}
        id="description"
        name="description"
        label="Description"
        placeholder="Issue description..."
        value={formData.description}
        onChange={(e) => handleFormInput(e.target.value, "description")}
        className="min-h-[100px]"
      />
    </CustomDialog>
  );
};
