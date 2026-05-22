import { CustomDialog } from "@/components/common/CustomDialog";
import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logInvoice } from "@/app/actions/payments";
import { useBusiness } from "@/context/businessContext";
import { useSWRConfig } from "swr";

export const LogInvoiceBtn = ({ asMenuItem }: { asMenuItem?: boolean }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    amount: "",
    description: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { business } = useBusiness();
  const { mutate } = useSWRConfig();

  const handleSubmit = async () => {
    if (!formData.invoiceNumber || !formData.amount || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!business?.id) {
      toast.error("No business selected");
      return;
    }

    setLoading(true);
    try {
      await logInvoice(business.id.toString(), {
        invoiceNumber: formData.invoiceNumber,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        date: formData.date,
      });
      toast.success("Invoice logged successfully");
      setFormData({ invoiceNumber: "", amount: "", description: "", date: "" });
      setIsDialogOpen(false);
      // Refresh payment history and plan data
      if (business.id) {
        mutate(`/super-admin/${business.id}/billing/payment-history`);
        mutate(`/super-admin/${business.id}/billing/current-plan`);
      }
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to log invoice";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (asMenuItem) {
    return (
      <CustomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Log Invoice"
        onSubmit={handleSubmit}
        loading={loading}
        trigger={
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsDialogOpen(true);
            }}
            className="cursor-pointer"
          >
            Log invoice
          </DropdownMenuItem>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input
              id="invoiceNumber"
              placeholder="Enter invoice number"
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (₦) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="date">Invoice Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add invoice description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
      </CustomDialog>
    );
  }

  return (
    <CustomDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      title="Log Invoice"
      onSubmit={handleSubmit}
      loading={loading}
      trigger={
        <button className="rounded-lg bg-[#007BFF] px-4 py-2 font-semibold text-sm text-white hover:bg-blue-700 w-full sm:w-auto">
          Log invoice
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number *</Label>
          <Input
            id="invoiceNumber"
            placeholder="Enter invoice number"
            value={formData.invoiceNumber}
            onChange={(e) =>
              setFormData({ ...formData, invoiceNumber: e.target.value })
            }
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount (₦) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="date">Invoice Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add invoice description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-2"
            rows={3}
          />
        </div>
      </div>
    </CustomDialog>
  );
};
