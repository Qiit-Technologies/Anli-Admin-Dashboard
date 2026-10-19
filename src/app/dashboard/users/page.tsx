"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, KeyRound, Loader2, UserPlus, Send, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import HqShell from "../components/layout/hq-shell";
import { useBusinessDirectory } from "../components/hq/useHqData";
import getStaffByOptions, {
  cancelStaffInvite,
  requestStaffPasswordReset,
  resendStaffInvite,
} from "@/app/actions/staff";
import InviteStaffDialog, {
  type InviteBusiness,
} from "../components/staffs/InviteStaffDialog";
import type { StaffDTO } from "@/types/staff";
import { ErrorResponseData } from "@/hooks/types";

type StaffRow = StaffDTO & { invitePending?: boolean };

function fmtDate(v?: string | null): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ErrorResponseData)?.message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

// C3: the old dialog let a super-admin type a new password and post it.
// Resets now email a single-use link — nothing is typed, generated, or
// displayed in plaintext.
function ResetPasswordDialog({
  staff,
  open,
  onOpenChange,
  onDone,
}: {
  staff: StaffRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!staff) return;
    setSaving(true);
    try {
      await requestStaffPasswordReset(staff.id);
      toast.success(`Password reset link sent to ${staff.email}`);
      onDone();
      onOpenChange(false);
    } catch (e) {
      toast.error(apiErrorMessage(e, "Failed to send reset link"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset the password for{" "}
            {staff?.fullName || staff?.email}? A single-use reset link will be
            emailed to {staff?.email}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersPage() {
  const directory = useBusinessDirectory();
  const hotels = useMemo(
    () => (directory.data ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [directory.data],
  );
  const [hotelId, setHotelId] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [resetTarget, setResetTarget] = useState<StaffRow | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [busyInvite, setBusyInvite] = useState<Record<number, boolean>>({});

  const selectedHotelId = hotelId ? Number(hotelId) : null;
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId) ?? null;

  // Debounce the search input so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    selectedHotelId ? ["hq-staff", selectedHotelId, search] : null,
    async () => {
      const res = await getStaffByOptions({
        businessId: String(selectedHotelId),
        page: 1,
        limit: 100,
        searchTerm: search || undefined,
      });
      return res.data?.staffs ?? [];
    },
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const staff: StaffRow[] = data ?? [];
  const searching = isValidating && !isLoading;

  const businesses: InviteBusiness[] = useMemo(
    () => hotels.map((h) => ({ id: h.id, name: h.name })),
    [hotels],
  );

  const handleResendInvite = async (s: StaffRow) => {
    setBusyInvite((prev) => ({ ...prev, [s.id]: true }));
    try {
      await resendStaffInvite(s.id);
      toast.success(`Invite re-sent to ${s.email}`);
      mutate();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Failed to re-send invite."));
    } finally {
      setBusyInvite((prev) => ({ ...prev, [s.id]: false }));
    }
  };

  const handleCancelInvite = async (s: StaffRow) => {
    setBusyInvite((prev) => ({ ...prev, [s.id]: true }));
    try {
      await cancelStaffInvite(s.id);
      toast.success("Invite cancelled");
      mutate();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Failed to cancel invite."));
    } finally {
      setBusyInvite((prev) => ({ ...prev, [s.id]: false }));
    }
  };

  return (
    <HqShell title="Users">
      <Card className="dark:bg-[#151a22] dark:border-white/10">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base sm:text-lg">
            User directory
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              staff accounts per business
            </span>
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={hotelId}
              onValueChange={(v) => setHotelId(v)}
              disabled={directory.isLoading}
            >
              <SelectTrigger className="w-full sm:w-64" aria-label="Select business">
                <SelectValue placeholder="Select a business…" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((h) => (
                  <SelectItem key={h.id} value={String(h.id)}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search staff…"
                className="pl-9 pr-9 sm:w-56"
                aria-label="Search staff"
                disabled={!selectedHotelId}
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            <Button
              className="gap-1.5"
              disabled={!selectedHotelId}
              onClick={() => setShowInviteDialog(true)}
            >
              <UserPlus className="h-4 w-4" />
              Invite staff
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {!selectedHotelId ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Select a business above to list its staff accounts.
            </p>
          ) : error && staff.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                Couldn&apos;t load staff for this business. Please try again.
              </p>
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                Retry
              </Button>
            </div>
          ) : isLoading && staff.length === 0 ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search
                  ? "No staff match your search."
                  : "No staff accounts found for this business."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => {
                  const deleted = !!s.deletedAt;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.fullName || s.username || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{s.email || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {s.phoneNumber || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.department?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px]",
                            s.invitePending
                              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800"
                              : deleted
                                ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                                : s.isActive
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
                          )}
                        >
                          {s.invitePending
                            ? "Invite pending"
                            : deleted
                              ? "Deleted"
                              : s.isActive
                                ? "Active"
                                : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {fmtDate(s.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.invitePending ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              disabled={busyInvite[s.id]}
                              onClick={() => handleResendInvite(s)}
                            >
                              <Send className="h-3.5 w-3.5" />
                              Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-red-700"
                              disabled={busyInvite[s.id]}
                              onClick={() => handleCancelInvite(s)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={deleted}
                            onClick={() => setResetTarget(s)}
                            aria-label={`Reset password for ${s.fullName || s.email}`}
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Reset password
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ResetPasswordDialog
        staff={resetTarget}
        open={!!resetTarget}
        onOpenChange={(v) => {
          if (!v) setResetTarget(null);
        }}
        onDone={() => mutate()}
      />

      <InviteStaffDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        businessId={selectedHotelId}
        businessName={selectedHotel?.name ?? null}
        businesses={businesses}
        onInvited={() => mutate()}
      />
    </HqShell>
  );
}
