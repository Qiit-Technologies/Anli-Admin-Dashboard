"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import { ShieldCheck, Pencil, Copy, Trash2, Plus, ChevronDown } from "lucide-react";
import fetcher from "@/app/actions/fetcher";
import type { GetPermissionsResponse } from "@/app/actions/types";
import getStaffByOptions from "@/app/actions/staff";
import type { StaffDTO } from "@/types/staff";
import {
  getRoleTemplates,
  listHotelRoles,
  createHotelRole,
  updateHotelRole,
  deleteHotelRole,
  applyRoleTemplateToStaff,
  type RoleTemplate,
  type HotelRole,
} from "@/app/actions/hq-roles";

/* ── Role editor dialog (create / edit / clone) ───────────────────────── */

function RoleEditorDialog({
  open,
  onOpenChange,
  initial,
  permissionCatalog,
  saving,
  onSave,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: { name: string; description: string; permissionIds: number[] };
  permissionCatalog: { id: number; name: string }[];
  saving: boolean;
  onSave: (input: {
    name: string;
    description: string;
    permissionIds: number[];
  }) => void;
  title: string;
  description: string;
}) {
  const [name, setName] = useState(initial.name);
  const [desc, setDesc] = useState(initial.description);
  const [selected, setSelected] = useState<number[]>(initial.permissionIds);
  const [query, setQuery] = useState("");

  // Reset when a different role is opened.
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setName(initial.name);
    setDesc(initial.description);
    setSelected(initial.permissionIds);
    setQuery("");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permissionCatalog;
    return permissionCatalog.filter((p) => p.name.toLowerCase().includes(q));
  }, [permissionCatalog, query]);

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="grid gap-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Night Auditor"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-desc">Description</Label>
            <Input
              id="role-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What this role is for"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>
                Permissions{" "}
                <span className="text-muted-foreground">
                  ({selected.length} selected)
                </span>
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(filtered.map((p) => p.id))}
                >
                  Select visible
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected([])}
                >
                  Clear
                </Button>
              </div>
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search permissions…"
            />
            <div className="border rounded-lg p-3 max-h-64 overflow-y-auto grid sm:grid-cols-2 gap-1">
              {filtered.map((p) => (
                <label
                  key={p.id}
                  className="flex items-start gap-2 text-sm py-1 px-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span className="text-gray-700">{p.name}</span>
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">
                  No permissions match.
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={saving || !name.trim() || selected.length === 0}
            onClick={() =>
              onSave({
                name: name.trim(),
                description: desc.trim(),
                permissionIds: selected,
              })
            }
          >
            {saving ? "Saving…" : "Save role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Apply-template dialog ────────────────────────────────────────────── */

function ApplyTemplateDialog({
  open,
  onOpenChange,
  template,
  businessId,
  onApplied,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template: RoleTemplate | null;
  businessId: string;
  onApplied: () => void;
}) {
  const [staffId, setStaffId] = useState("");
  const [applying, setApplying] = useState(false);

  const { data: staffRes } = useSWR(
    open ? ["hq-roles-staff", businessId] : null,
    () => getStaffByOptions({ businessId, page: 1, limit: 100 }),
    { revalidateOnFocus: false },
  );
  const staffList: StaffDTO[] = staffRes?.data?.staffs ?? [];

  const apply = async () => {
    if (!template || !staffId) return;
    setApplying(true);
    const res = await applyRoleTemplateToStaff(
      businessId,
      Number(staffId),
      template.key,
    );
    setApplying(false);
    if (res.ok) {
      toast.success(
        `"${res.data.templateName}" applied (${res.data.permissionCount} permissions)`,
      );
      onOpenChange(false);
      onApplied();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply template to staff member</DialogTitle>
          <DialogDescription>
            {template
              ? `This replaces the staff member's permission checkboxes with the "${template.name}" set (${template.permissionCount} permissions). The granular checkboxes stay editable afterwards.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label>Staff member</Label>
          <Select value={staffId} onValueChange={setStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staffList.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.fullName || s.username || s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!staffId || applying} onClick={apply}>
            {applying ? "Applying…" : "Apply template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main section ─────────────────────────────────────────────────────── */

export default function RolesManager({ businessId }: { businessId: string }) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [applyTemplate, setApplyTemplate] = useState<RoleTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<HotelRole | null>(null);
  const [cloningFrom, setCloningFrom] = useState<HotelRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HotelRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: templatesRes,
    isLoading: templatesLoading,
  } = useSWR("hq-role-templates", getRoleTemplates, {
    revalidateOnFocus: false,
  });
  const templates: RoleTemplate[] =
    templatesRes && templatesRes.ok ? templatesRes.data : [];

  const {
    data: rolesRes,
    isLoading: rolesLoading,
    mutate: mutateRoles,
  } = useSWR(["hq-hotel-roles", businessId], () => listHotelRoles(businessId), {
    revalidateOnFocus: false,
  });
  const roles: HotelRole[] = rolesRes && rolesRes.ok ? rolesRes.data : [];

  const { data: permData } = useSWR(
    "/permissions/public-permissions",
    (url: string) => fetcher<GetPermissionsResponse>(url),
  );
  const permissionCatalog = useMemo(
    () =>
      (permData?.permissions ?? []).map((p) => ({
        // Client Permission type declares id as string; normalize to number.
        id: Number(p.id),
        name: p.name,
      })),
    [permData],
  );

  const openCreate = () => {
    setEditingRole(null);
    setCloningFrom(null);
    setEditorOpen(true);
  };
  const openEdit = (role: HotelRole) => {
    setEditingRole(role);
    setCloningFrom(null);
    setEditorOpen(true);
  };
  const openClone = (role: HotelRole) => {
    setEditingRole(null);
    setCloningFrom(role);
    setEditorOpen(true);
  };

  // Memoized so the editor dialog's render-phase reset only fires when the
  // edited/cloned role actually changes (a fresh object every render would
  // wipe the form on any parent re-render, e.g. SWR revalidation).
  const editorInitial = useMemo(
    () =>
      editingRole
        ? {
            name: editingRole.name,
            description: editingRole.description ?? "",
            permissionIds: (editingRole.permissions ?? []).map((p) => p.id),
          }
        : cloningFrom
          ? {
              name: `${cloningFrom.name} (copy)`,
              description: cloningFrom.description ?? "",
              permissionIds: (cloningFrom.permissions ?? []).map((p) => p.id),
            }
          : { name: "", description: "", permissionIds: [] as number[] },
    [editingRole, cloningFrom],
  );

  const saveRole = async (input: {
    name: string;
    description: string;
    permissionIds: number[];
  }) => {
    setSaving(true);
    const res = editingRole
      ? await updateHotelRole(businessId, editingRole.id, input)
      : await createHotelRole(businessId, input);
    setSaving(false);
    if (res.ok) {
      toast.success(
        editingRole ? "Role updated" : "Role created",
      );
      setEditorOpen(false);
      mutateRoles();
    } else {
      toast.error(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteHotelRole(businessId, deleteTarget.id);
    setDeleting(false);
    if (res.ok) {
      toast.success("Role deleted");
      setDeleteTarget(null);
      mutateRoles();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Templates ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-[#FF6F00]" />
            Role templates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            One-click starting points. Applying a template fills the staff
            member&apos;s permission checkboxes with that set — the granular
            checkboxes remain the underlying mechanism and stay editable.
          </p>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {templatesRes && !templatesRes.ok
                ? `Could not load templates: ${templatesRes.error}`
                : "No role templates available."}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {templates.map((t) => (
                <div
                  key={t.key}
                  className="border rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{t.name}</p>
                    <Badge variant="outline">
                      {t.permissionCount} permissions
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setApplyTemplate(t)}
                    >
                      Apply to staff…
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedTemplate(
                          expandedTemplate === t.key ? null : t.key,
                        )
                      }
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expandedTemplate === t.key ? "rotate-180" : ""}`}
                      />
                      {expandedTemplate === t.key ? "Hide" : "View"} permissions
                    </Button>
                  </div>
                  {expandedTemplate === t.key && (
                    <ul className="mt-1 max-h-48 overflow-y-auto text-xs text-gray-600 border-t pt-2 grid sm:grid-cols-2 gap-x-3">
                      {t.permissions.map((p) => (
                        <li key={p.id} className="py-0.5 truncate" title={p.name}>
                          • {p.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Custom roles ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Custom roles</CardTitle>
            <p className="text-sm text-muted-foreground">
              Business-specific roles. Staff keep their own granular permission
              sets; assigning a role here does not change existing users.
            </p>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> New role
          </Button>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {rolesRes && !rolesRes.ok
                ? `Could not load roles: ${rolesRes.error}`
                : "No custom roles yet. Create one, or clone from a template-style set above."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {r.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(r.permissions ?? []).length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(r)}
                          aria-label={`Edit ${r.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openClone(r)}
                          aria-label={`Clone ${r.name}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteTarget(r)}
                          aria-label={`Delete ${r.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RoleEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={editorInitial}
        permissionCatalog={permissionCatalog}
        saving={saving}
        onSave={saveRole}
        title={
          editingRole
            ? `Edit role — ${editingRole.name}`
            : cloningFrom
              ? `Clone role — ${cloningFrom.name}`
              : "New custom role"
        }
        description="Pick the granular permissions for this role. Nothing about existing users changes."
      />

      <ApplyTemplateDialog
        open={applyTemplate !== null}
        onOpenChange={(v) => !v && setApplyTemplate(null)}
        template={applyTemplate}
        businessId={businessId}
        onApplied={() => mutateRoles()}
      />

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete role"
        description={`Delete the role "${deleteTarget?.name}"? Staff members keep their own permission sets — only the role definition is removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
