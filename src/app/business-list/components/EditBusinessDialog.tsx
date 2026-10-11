"use client";

import { useEffect, useState } from "react";
import { CustomDialog } from "@/components/common/CustomDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBusiness } from "@/app/actions/business";
import { BusinessDTO } from "@/types/business";
import toast from "react-hot-toast";

const BUSINESS_TYPES = ["HOTEL", "RESORT", "RESTAURANT"];

interface EditBusinessDialogProps {
  business: BusinessDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void | Promise<unknown>;
}

/**
 * Shared dialog for editing a business's core details (H2).
 * Used from the business list (row action menu) and the General Info page.
 * Persists via PATCH /super-admin/hotels/:id (super-admin guarded).
 */
export default function EditBusinessDialog({
  business,
  open,
  onOpenChange,
  onSaved,
}: EditBusinessDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    businessType: "HOTEL",
    country: "",
    state: "",
    registrationNumber: "",
    taxId: "",
  });

  useEffect(() => {
    if (open && business) {
      setForm({
        name: business.name ?? "",
        address: business.address ?? "",
        businessType: business.businessType ?? "HOTEL",
        country: business.country ?? "",
        state: business.state ?? "",
        registrationNumber: business.registrationNumber ?? "",
        taxId: business.taxId ?? "",
      });
    }
  }, [open, business]);

  const setField =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!business) return;
    if (!form.name.trim()) {
      toast.error("Business name is required");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        address: form.address.trim(),
        businessType: form.businessType,
        country: form.country.trim(),
        state: form.state.trim(),
      };
      if (form.registrationNumber.trim()) {
        payload.registrationNumber = form.registrationNumber.trim();
      }
      if (form.taxId.trim()) {
        payload.taxId = form.taxId.trim();
      }
      await updateBusiness(business.id.toString(), payload);
      toast.success("Business updated successfully!");
      onOpenChange(false);
      await onSaved?.();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update business";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Business"
      description={
        business
          ? `Update the core details for ${business.name}.`
          : undefined
      }
      onConfirm={handleSave}
      isLoading={saving}
      confirmText="Save Changes"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="editBusinessName">Business Name *</Label>
          <Input
            id="editBusinessName"
            placeholder="e.g. Grand Hotel"
            value={form.name}
            onChange={setField("name")}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editBusinessType">Business Type</Label>
          <Select
            value={form.businessType}
            onValueChange={(value) =>
              setForm((f) => ({ ...f, businessType: value }))
            }
          >
            <SelectTrigger id="editBusinessType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="editAddress">Address</Label>
          <Input
            id="editAddress"
            placeholder="Address"
            value={form.address}
            onChange={setField("address")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editCountry">Country</Label>
          <Input
            id="editCountry"
            placeholder="Country"
            value={form.country}
            onChange={setField("country")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editState">State</Label>
          <Input
            id="editState"
            placeholder="State"
            value={form.state}
            onChange={setField("state")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editRegNumber">Registration Number</Label>
          <Input
            id="editRegNumber"
            placeholder="Registration number"
            value={form.registrationNumber}
            onChange={setField("registrationNumber")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editTaxId">Tax ID</Label>
          <Input
            id="editTaxId"
            placeholder="Tax ID"
            value={form.taxId}
            onChange={setField("taxId")}
          />
        </div>
      </div>
    </CustomDialog>
  );
}
