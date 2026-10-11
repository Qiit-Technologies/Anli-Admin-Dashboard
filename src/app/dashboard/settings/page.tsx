"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import HqShell from "../components/layout/hq-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useUser } from "@/context/userContext";
import {
  addIntegration,
  changeSuperAdminPassword,
  getCompanyProfile,
  getNotificationToggles,
  getSuperAdminMe,
  listEmailTemplates,
  listIntegrations,
  listSmsTemplates,
  revokeIntegration,
  updateCompanyProfile,
  updateEmailTemplate,
  updateNotificationToggles,
  updateSmsTemplate,
  type CompanyProfile,
  type EmailTemplate,
  type Integration,
  type NotificationToggles,
  type SmsTemplate,
} from "@/app/actions/settings";

const TABS = [
  { id: "profile", label: "My Profile" },
  { id: "company", label: "Company Profile" },
  { id: "email", label: "Email Templates" },
  { id: "sms", label: "SMS Templates" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabId) || "profile";
  const [tab, setTab] = useState<TabId>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "profile",
  );

  return (
    <HqShell title="Settings">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 rounded-t-lg text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-[#FDEFE5] text-[#FF6F00]"
                  : "text-gray-500 hover:text-gray-800",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && <ProfileTab />}
        {tab === "company" && <CompanyTab />}
        {tab === "email" && <EmailTemplatesTab />}
        {tab === "sms" && <SmsTemplatesTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "integrations" && <IntegrationsTab />}
      </div>
    </HqShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}

/* ------------------------------ Profile ------------------------------ */

function ProfileTab() {
  const { user } = useUser();
  const [me, setMe] = useState<{ fullName?: string; email?: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSuperAdminMe();
        setMe(data);
      } catch {
        // Fall back to the session user stored at sign-in.
        setMe({
          fullName: (user as any)?.fullName,
          email: (user as any)?.email,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await changeSuperAdminPassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Spinner size="md" /> <span>Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">My Profile</h3>
        <p className="text-sm text-gray-500">Your super-admin account details.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input value={me?.fullName ?? ""} readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={me?.email ?? ""} readOnly disabled />
        </div>
      </div>
      <div className="border-t pt-6">
        <h4 className="font-semibold mb-1">Change password</h4>
        <p className="text-sm text-gray-500 mb-4">
          Enter your current password to set a new one.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div />
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={saving}
          className="mt-4 bg-[#007BFF] hover:bg-[#007BFF]/90 text-white"
        >
          {saving ? "Changing…" : "Change password"}
        </Button>
      </div>
    </div>
  );
}

/* --------------------------- Company profile -------------------------- */

function CompanyTab() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await getCompanyProfile());
    } catch (e: any) {
      toast.error(e?.message || "Failed to load company profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateCompanyProfile(profile);
      setProfile(updated);
      toast.success("Company profile saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save company profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Spinner size="md" /> <span>Loading company profile…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Company Profile</h3>
        <p className="text-sm text-gray-500">
          Anli&apos;s own details — used on invoices, emails and the letterhead.
        </p>
      </div>
      {(
        [
          ["name", "Company name"],
          ["address", "Address"],
          ["phone", "Phone"],
          ["email", "Email"],
          ["website", "Website"],
        ] as Array<[keyof CompanyProfile, string]>
      ).map(([key, label]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={`company-${key}`}>{label}</Label>
          <Input
            id={`company-${key}`}
            value={profile?.[key] ?? ""}
            onChange={(e) =>
              setProfile((p) => (p ? { ...p, [key]: e.target.value } : p))
            }
          />
        </div>
      ))}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#007BFF] hover:bg-[#007BFF]/90 text-white"
      >
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

/* --------------------------- Email templates -------------------------- */

function EmailTemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listEmailTemplates();
      setTemplates(list);
      if (list.length > 0) {
        setSelected(list[0]);
        setSubject(list[0].subject);
        setBody(list[0].body);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load email templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pick = (t: EmailTemplate) => {
    setSelected(t);
    setSubject(t.subject);
    setBody(t.body);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateEmailTemplate(selected.slug, {
        subject,
        body,
      });
      setTemplates((ts) =>
        ts.map((t) => (t.slug === updated.slug ? updated : t)),
      );
      setSelected(updated);
      toast.success("Email template saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Spinner size="md" /> <span>Loading email templates…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Email Templates</h3>
        <p className="text-sm text-gray-500">
          Available placeholders: {"{{businessName}}"}, {"{{ownerName}}"},{" "}
          {"{{ticketNumber}}"}, {"{{amount}}"}, {"{{signinUrl}}"}.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.slug}
            onClick={() => pick(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors",
              selected?.slug === t.slug
                ? "bg-[#FDEFE5] border-[#FF6F00] text-[#FF6F00]"
                : "border-gray-200 text-gray-600 hover:border-gray-400",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>
      {selected && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-body">Body</Label>
            <Textarea
              id="email-body"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#007BFF] hover:bg-[#007BFF]/90 text-white"
          >
            {saving ? "Saving…" : "Save template"}
          </Button>
        </>
      )}
    </div>
  );
}

/* ---------------------------- SMS templates --------------------------- */

function SmsTemplatesTab() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [selected, setSelected] = useState<SmsTemplate | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listSmsTemplates();
      setTemplates(list);
      if (list.length > 0) {
        setSelected(list[0]);
        setBody(list[0].body);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load SMS templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pick = (t: SmsTemplate) => {
    setSelected(t);
    setBody(t.body);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateSmsTemplate(selected.slug, { body });
      setTemplates((ts) =>
        ts.map((t) => (t.slug === updated.slug ? updated : t)),
      );
      setSelected(updated);
      toast.success("SMS template saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Spinner size="md" /> <span>Loading SMS templates…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">SMS Templates</h3>
        <p className="text-sm text-gray-500">
          Available placeholders: {"{{businessName}}"}, {"{{guestName}}"},{" "}
          {"{{otp}}"}, {"{{date}}"}.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.slug}
            onClick={() => pick(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors",
              selected?.slug === t.slug
                ? "bg-[#FDEFE5] border-[#FF6F00] text-[#FF6F00]"
                : "border-gray-200 text-gray-600 hover:border-gray-400",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>
      {selected && (
        <>
          <div className="space-y-2">
            <Label htmlFor="sms-body">Message</Label>
            <Textarea
              id="sms-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-gray-400">
              {body.length} characters (~{Math.max(1, Math.ceil(body.length / 160))} SMS segment(s))
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#007BFF] hover:bg-[#007BFF]/90 text-white"
          >
            {saving ? "Saving…" : "Save template"}
          </Button>
        </>
      )}
    </div>
  );
}

/* ---------------------------- Notifications --------------------------- */

function NotificationsTab() {
  const [toggles, setToggles] = useState<NotificationToggles | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setToggles(await getNotificationToggles());
    } catch (e: any) {
      toast.error(e?.message || "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flip = async (key: keyof NotificationToggles, value: boolean) => {
    if (!toggles) return;
    const next = { ...toggles, [key]: value };
    setToggles(next);
    setSaving(true);
    try {
      await updateNotificationToggles({ [key]: value });
      toast.success("Notification setting saved");
    } catch (e: any) {
      toast.error(e?.message || "Failed to save setting");
      setToggles(toggles);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Spinner size="md" /> <span>Loading notification settings…</span>
      </div>
    );
  }

  const rows: Array<[keyof NotificationToggles, string, string]> = [
    ["ticketAlerts", "Ticket alerts", "Notify on new and updated support tickets."],
    ["paymentAlerts", "Payment alerts", "Notify on received subscription payments."],
    ["inactivityAlerts", "Inactivity alerts", "Notify when a business shows no module activity for 14 days."],
  ];

  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-gray-500">
          Control which platform alerts are sent to the super-admin team.
        </p>
      </div>
      {rows.map(([key, label, desc]) => (
        <div
          key={key}
          className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
        >
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
          <Switch
            checked={!!toggles?.[key]}
            disabled={saving}
            onCheckedChange={(v) => flip(key, v)}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- Integrations ---------------------------- */

function IntegrationsTab() {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    provider: "",
    keyName: "",
    secretValue: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listIntegrations());
    } catch (e: any) {
      toast.error(e?.message || "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.provider.trim() || !form.keyName.trim() || !form.secretValue) {
      toast.error("Fill in all integration fields");
      return;
    }
    setAdding(true);
    try {
      const created = await addIntegration(form);
      setItems((prev) => [created, ...prev]);
      setForm({ name: "", provider: "", keyName: "", secretValue: "" });
      toast.success("Integration added");
    } catch (e: any) {
      toast.error(e?.message || "Failed to add integration");
    } finally {
      setAdding(false);
    }
  };

  const handleRevoke = async (id: number) => {
    setRevoking(id);
    try {
      const updated = await revokeIntegration(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast.success("Integration revoked");
    } catch (e: any) {
      toast.error(e?.message || "Failed to revoke integration");
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Spinner size="md" /> <span>Loading integrations…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Add integration</h3>
          <p className="text-sm text-gray-500">
            Store a third-party API key. The secret is only shown once as a
            masked value — full secrets are never displayed again.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="int-name">Name</Label>
            <Input
              id="int-name"
              placeholder="e.g. Termii production"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="int-provider">Provider</Label>
            <Input
              id="int-provider"
              placeholder="e.g. Termii"
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="int-keyname">Key name</Label>
            <Input
              id="int-keyname"
              placeholder="e.g. TERMII_API_KEY"
              value={form.keyName}
              onChange={(e) => setForm({ ...form, keyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="int-secret">Secret value</Label>
            <Input
              id="int-secret"
              type="password"
              placeholder="Paste the secret"
              value={form.secretValue}
              onChange={(e) =>
                setForm({ ...form, secretValue: e.target.value })
              }
              autoComplete="new-password"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={adding}
          className="bg-[#007BFF] hover:bg-[#007BFF]/90 text-white"
        >
          {adding ? "Adding…" : "Add integration"}
        </Button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Saved integrations</h3>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No integrations saved yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-3 border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">
                    {i.name}{" "}
                    <span className="text-xs text-gray-400">({i.provider})</span>
                  </p>
                  <p className="text-sm text-gray-500 font-mono">
                    {i.keyName} · {i.maskedSecret}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      i.isRevoked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700",
                    )}
                  >
                    {i.isRevoked ? "Revoked" : "Active"}
                  </span>
                  {!i.isRevoked && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={revoking === i.id}
                      onClick={() => handleRevoke(i.id)}
                    >
                      {revoking === i.id ? "Revoking…" : "Revoke"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
