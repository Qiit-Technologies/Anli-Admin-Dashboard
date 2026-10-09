"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Search, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import HqShell from "../components/layout/hq-shell";
import { useBusinessDirectory } from "../components/hq/useHqData";
import getStaffByOptions from "@/app/actions/staff";
import { resetStaffPassword } from "@/app/actions/staff";
import type { StaffDTO } from "@/types/staff";

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

function ResetPasswordDialog({
  staff,
  hotelId,
  open,
  onOpenChange,
  onDone,
}: {
  staff: StaffDTO | null;
  hotelId: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const close = () => {
    setPassword("");
    setConfirm("");
    onOpenChange(false);
  };

  const submit = async () => {
    if (!staff || hotelId === null) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await resetStaffPassword(hotelId, staff.id, {
        password,
        email: staff.email,
      });
      toast.success(`Password reset for ${staff.fullName || staff.email}`);
      onDone();
      close();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
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
            Set a new password for {staff?.fullName || staff?.email}. They will
            need to sign in with it next time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat the password"
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset password
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
  const [search, setSearch] = useState("");
  const [resetTarget, setResetTarget] = useState<StaffDTO | null>(null);

  const selectedHotelId = hotelId ? Number(hotelId) : null;

  const { data, isLoading, mutate } = useSWR(
    selectedHotelId ? ["hq-staff", selectedHotelId, search] : null,
    async () => {
      const res = await getStaffByOptions({
        businessId: selectedHotelId as number,
        page: 1,
        limit: 100,
        searchTerm: search.trim() || undefined,
      } as any);
      return (res as any)?.data?.staffs ?? [];
    },
    { revalidateOnFocus: false },
  );

  const staff: StaffDTO[] = data ?? [];

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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff…"
                className="pl-9 sm:w-56"
                aria-label="Search staff"
                disabled={!selectedHotelId}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {!selectedHotelId ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Select a business above to list its staff accounts.
            </p>
          ) : isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              {search ? "No staff match your search." : "No staff accounts found for this business."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
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
                        {s.department?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px]",
                            deleted
                              ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                              : s.isActive
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
                          )}
                        >
                          {deleted ? "Deleted" : s.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {fmtDate(s.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-right">
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
        hotelId={selectedHotelId}
        open={!!resetTarget}
        onOpenChange={(v) => {
          if (!v) setResetTarget(null);
        }}
        onDone={() => mutate()}
      />
    </HqShell>
  );
}
