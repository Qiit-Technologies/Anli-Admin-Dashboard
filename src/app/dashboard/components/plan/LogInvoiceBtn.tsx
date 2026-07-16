import { CustomDialog } from "@/components/common/CustomDialog";
import { useMemo, useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logInvoice } from "@/app/actions/payments";
import { useBusiness } from "@/context/businessContext";
import { useSWRConfig } from "swr";

type InvoiceFormErrors = Partial<{
  invoiceNumber: string;
  amount: string;
  date: string;
  file: string;
}>;

export const LogInvoiceBtn = ({ asMenuItem }: { asMenuItem?: boolean }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    amount: "",
    remarks: "",
    billingMonth: "",
    date: "",
    file: null as File | null,
  });
  const [errors, setErrors] = useState<InvoiceFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { business } = useBusiness();
  const { mutate } = useSWRConfig();
  const monthOptions = useMemo(() => {
    const now = new Date();
    const result: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      const value = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(value.toISOString().slice(0, 7));
    }
    return result;
  }, []);

  const handleSubmit = async () => {
    const validationErrors: InvoiceFormErrors = {};

    if (!formData.invoiceNumber.trim()) {
      validationErrors.invoiceNumber = "Invoice number is required";
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      validationErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.date) {
      validationErrors.date = "Invoice date is required";
    }

    if (!formData.file) {
      validationErrors.file = "Invoice file is required";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please complete all required invoice fields");
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
        description: formData.remarks || undefined,
        remarks: formData.remarks || undefined,
        billingMonth: formData.billingMonth || undefined,
        date: formData.date,
        file: formData.file,
      });
      toast.success("Invoice logged successfully");
      setFormData({
        invoiceNumber: "",
        amount: "",
        remarks: "",
        billingMonth: "",
        date: "",
        file: null,
      });
      setErrors({});
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
              onChange={(e) => {
                setFormData({ ...formData, invoiceNumber: e.target.value });
                setErrors((current) => ({
                  ...current,
                  invoiceNumber: undefined,
                }));
              }}
              className={`mt-2 ${errors.invoiceNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              aria-invalid={Boolean(errors.invoiceNumber)}
            />
            {errors.invoiceNumber && (
              <p className="mt-1 text-xs text-red-600">
                {errors.invoiceNumber}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount (₦) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setErrors((current) => ({ ...current, amount: undefined }));
              }}
              className={`mt-2 ${errors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Invoice Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                setErrors((current) => ({ ...current, date: undefined }));
              }}
              className={`mt-2 ${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <Label htmlFor="billingMonth">Billing Month</Label>
            <select
              id="billingMonth"
              value={formData.billingMonth}
              onChange={(e) =>
                setFormData({ ...formData, billingMonth: e.target.value })
              }
              className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select month</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder="Add invoice remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className="mt-2"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="invoiceFile">Invoice File *</Label>
            <Input
              id="invoiceFile"
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg,image/gif"
              required
              onChange={(e) => {
                setFormData({ ...formData, file: e.target.files?.[0] || null });
                setErrors((current) => ({ ...current, file: undefined }));
              }}
              className={`mt-2 ${errors.file ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              aria-invalid={Boolean(errors.file)}
            />
            {errors.file && (
              <p className="mt-1 text-xs text-red-600">{errors.file}</p>
            )}
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
            onChange={(e) => {
              setFormData({ ...formData, invoiceNumber: e.target.value });
              setErrors((current) => ({
                ...current,
                invoiceNumber: undefined,
              }));
            }}
            className={`mt-2 ${errors.invoiceNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            aria-invalid={Boolean(errors.invoiceNumber)}
          />
          {errors.invoiceNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.invoiceNumber}</p>
          )}
        </div>

        <div>
          <Label htmlFor="amount">Amount (₦) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) => {
              setFormData({ ...formData, amount: e.target.value });
              setErrors((current) => ({ ...current, amount: undefined }));
            }}
            className={`mt-2 ${errors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <Label htmlFor="date">Invoice Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => {
              setFormData({ ...formData, date: e.target.value });
              setErrors((current) => ({ ...current, date: undefined }));
            }}
            className={`mt-2 ${errors.date ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <Label htmlFor="billingMonth">Billing Month</Label>
          <select
            id="billingMonth"
            value={formData.billingMonth}
            onChange={(e) =>
              setFormData({ ...formData, billingMonth: e.target.value })
            }
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select month</option>
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="remarks">Remarks (Optional)</Label>
          <Textarea
            id="remarks"
            placeholder="Add invoice remarks"
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
            className="mt-2"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="invoiceFile">Invoice File *</Label>
          <Input
            id="invoiceFile"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/jpg,image/gif"
            required
            onChange={(e) => {
              setFormData({ ...formData, file: e.target.files?.[0] || null });
              setErrors((current) => ({ ...current, file: undefined }));
            }}
            className={`mt-2 ${errors.file ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            aria-invalid={Boolean(errors.file)}
          />
          {errors.file && (
            <p className="mt-1 text-xs text-red-600">{errors.file}</p>
          )}
        </div>
      </div>
    </CustomDialog>
  );
};
