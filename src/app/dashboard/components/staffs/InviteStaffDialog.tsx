"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewMultiSelect } from "@/components/common/NewMultiSelect";
import fetcher from "@/app/actions/fetcher";
import { inviteStaffByEmail } from "@/app/actions/staff";
import { GetPermissionsResponse } from "@/app/actions/types";
import { Module } from "@/types/module";
import { Permission } from "@/app/actions/types";
import { ErrorResponseData } from "@/hooks/types";

export interface InviteBusiness {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the business is preselected (e.g. staffs page context). */
  businessId: number | null;
  businessName?: string | null;
  /** When provided and no businessId is fixed, the inviter picks a business. */
  businesses?: InviteBusiness[];
  onInvited: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteStaffDialog({
  open,
  onOpenChange,
  businessId,
  businessName,
  businesses = [],
  onInvited,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pickedBusinessId, setPickedBusinessId] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<Module[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    []
  );
  const [saving, setSaving] = useState(false);

  const effectiveBusinessId = businessId ?? (pickedBusinessId ? Number(pickedBusinessId) : null);
  const needsBusinessChoice = businessId === null && businesses.length > 0;

  const { data: permissionsData } = useSWR(
    open ? "/permissions/public-permissions" : null,
    (url: string) => fetcher<GetPermissionsResponse>(url)
  );
  const permissions: Permission[] = useMemo(
    () => permissionsData?.permissions ?? [],
    [permissionsData]
  );

  const { data: modulesData } = useSWR(
    open ? "/modules/public-modules" : null,
    (url: string) => fetcher<Module[]>(url)
  );
  const modules = useMemo(() => modulesData ?? [], [modulesData]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPickedBusinessId("");
    setSelectedModules([]);
    setSelectedPermissions([]);
  };

  const close = () => {
    resetForm();
    onOpenChange(false);
  };

  const submit = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter the staff member's full name");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!effectiveBusinessId) {
      toast.error("Please select a business");
      return;
    }
    setSaving(true);
    try {
      const res = await inviteStaffByEmail({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        businessId: effectiveBusinessId,
        moduleIds: selectedModules.map((m) => Number(m.id)),
        permissionIds: selectedPermissions.map((p) => Number(p.id)),
      });
      // Backend #605: the invite is created best-effort — the email may not
      // have been delivered. Report honestly instead of claiming it was sent.
      const delivered = res?.data?.emailDelivered !== false;
      if (delivered) {
        toast.success(`Invite sent to ${email.trim().toLowerCase()}`);
      } else {
        toast(
          "Invite created, but the email could not be delivered. Resend it from the staff list.",
          { icon: "⚠️" },
        );
      }
      onInvited();
      close();
    } catch (e) {
      const message =
        e instanceof AxiosError
          ? (e.response?.data as ErrorResponseData)?.message ||
            "Failed to send invite"
          : "Failed to send invite";
      toast.error(typeof message === "string" ? message : "Failed to send invite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite staff
          </DialogTitle>
          <DialogDescription>
            The new staff member gets an email with a one-time link to accept
            the invite and set their own password. The invite expires after 72
            hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-fullname">Full name</Label>
            <Input
              id="invite-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Adaeze Okafor"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label>Business</Label>
            {needsBusinessChoice ? (
              <Select value={pickedBusinessId} onValueChange={setPickedBusinessId}>
                <SelectTrigger aria-label="Select business">
                  <SelectValue placeholder="Select a business…" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground rounded-md border px-3 py-2 bg-muted/40">
                {businessName ?? `Business #${effectiveBusinessId ?? "—"}`}
              </p>
            )}
          </div>

          <NewMultiSelect
            id="invite-modules"
            label="Modules"
            items={modules}
            value={selectedModules}
            onChange={setSelectedModules}
            displayValue={(m: Module) => m.name}
            placeholder="Select modules (optional)"
            searchPlaceholder="Search modules…"
          />

          <NewMultiSelect
            id="invite-permissions"
            label="Permissions"
            items={permissions}
            value={selectedPermissions}
            onChange={setSelectedPermissions}
            displayValue={(p: Permission) => p.name}
            placeholder="Select permissions (optional)"
            searchPlaceholder="Search permissions…"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
