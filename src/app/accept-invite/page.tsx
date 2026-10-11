"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptStaffInvite } from "@/app/actions/staff";
import { ErrorResponseData } from "@/hooks/types";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!token) {
      toast.error("This invite link is missing its token.");
      return;
    }
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
      await acceptStaffInvite(token, password);
      setDone(true);
    } catch (e) {
      const message =
        e instanceof AxiosError
          ? (e.response?.data as ErrorResponseData)?.message
          : undefined;
      toast.error(
        typeof message === "string" && message
          ? message
          : "Could not accept the invite. The link may have expired.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept your Anli invite</CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              <p className="font-medium">Invite accepted!</p>
              <p className="text-sm text-muted-foreground">
                Your account is active. You can now sign in with your email and
                the password you just set.
              </p>
              <Link href="/signin">
                <Button>Go to sign in</Button>
              </Link>
            </div>
          ) : !token ? (
            <p className="text-sm text-muted-foreground py-4">
              This invite link is invalid. Please ask your administrator to
              re-send the invite.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-password">Choose a password</Label>
                <Input
                  id="invite-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-confirm">Confirm password</Label>
                <Input
                  id="invite-confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat the password"
                  autoComplete="new-password"
                />
              </div>
              <Button onClick={submit} disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accept invite &amp; set password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
