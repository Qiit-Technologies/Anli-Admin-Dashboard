import { CustomDialog } from "@/components/common/CustomDialog";
import { useState } from "react";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { switchBillingCycle } from "@/app/actions/plan";
import { useBusiness } from "@/context/businessContext";
import { useSWRConfig } from "swr";

export const SwitchBillingCycleBtn = ({ asMenuItem }: { asMenuItem?: boolean }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { business } = useBusiness();
  const { mutate } = useSWRConfig();

  const handleSubmit = async () => {
    if (!selectedCycle) {
      toast.error("Please select a billing cycle");
      return;
    }

    if (!business?.id) {
      toast.error("No business selected");
      return;
    }

    setLoading(true);
    try {
      await switchBillingCycle(
        Number(business.id),
        selectedCycle as "monthly" | "yearly"
      );
      toast.success(`Billing cycle switched to ${selectedCycle}`);
      setIsDialogOpen(false);
      setSelectedCycle("");
      // Refresh the plan data
      mutate(`/super-admin/${business.id}/billing/current-plan`);
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to switch billing cycle";
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
        onSubmit={handleSubmit}
        title="Switch Billing Cycle"
        loading={loading}
        trigger={
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsDialogOpen(true);
            }}
            className="cursor-pointer"
          >
            Switch billing cycle
          </DropdownMenuItem>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="billingCycle">Select Billing Cycle</Label>
            <Select
              value={selectedCycle}
              onValueChange={setSelectedCycle}
            >
              <SelectTrigger id="billingCycle" className="mt-2">
                <SelectValue placeholder="Choose billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500">
            Changing the billing cycle will affect future subscription renewals.
          </p>
        </div>
      </CustomDialog>
    );
  }

  return (
    <CustomDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSubmit={handleSubmit}
      title="Switch Billing Cycle"
      loading={loading}
      trigger={
        <button className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-sm text-white hover:bg-gray-600 w-full sm:w-auto">
          Switch billing cycle
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="billingCycle">Select Billing Cycle</Label>
          <Select
            value={selectedCycle}
            onValueChange={setSelectedCycle}
          >
            <SelectTrigger id="billingCycle" className="mt-2">
              <SelectValue placeholder="Choose billing cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-500">
          Changing the billing cycle will affect future subscription renewals.
        </p>
      </div>
    </CustomDialog>
  );
};
