"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DownloadIcon, Link2Icon, Link2OffIcon, TriangleAlertIcon } from "lucide-react";
import { changeEmail, changePassword, linkGoogle, unlinkGoogle } from "@/lib/actions/account";
import { idle, type ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError } from "@/components/forms/form-alert";

function useToast(state: ActionResult) {
  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
  }, [state]);
}

export function ChangeEmailForm({ current }: { current: string | null }) {
  const [state, action] = useActionState(changeEmail, idle);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={current ?? ""} required />
        <FieldDescription>We'll send a confirmation link to the new address. Nothing changes until you click it.</FieldDescription>
        <FieldError errors={fieldError(state, "email")} />
      </Field>
      <SubmitButton variant="outline" pendingText="Sending…">
        Update email
      </SubmitButton>
    </form>
  );
}

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action] = useActionState(changePassword, idle);
  useToast(state);
  return (
    <form action={action} className="space-y-4" noValidate>
      {!state.ok && state.error && <FormAlert state={state} />}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">{hasPassword ? "New password" : "Set a password"}</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <FieldDescription>At least 8 characters.</FieldDescription>
          <FieldError errors={fieldError(state, "password")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">Confirm</FieldLabel>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
          <FieldError errors={fieldError(state, "confirm")} />
        </Field>
      </FieldGroup>
      <SubmitButton variant="outline" pendingText="Saving…">
        {hasPassword ? "Change password" : "Set password"}
      </SubmitButton>
    </form>
  );
}

export function GoogleLinkForm({ linked, canUnlink }: { linked: boolean; canUnlink: boolean }) {
  const [state, action] = useActionState(unlinkGoogle, idle);
  useToast(state);
  if (linked) {
    return (
      <form action={action} className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success-soft px-3 py-1 text-sm text-success">
          <Link2Icon className="size-3.5" /> Google connected
        </span>
        <SubmitButton variant="ghost" size="sm" disabled={!canUnlink} pendingText="Disconnecting…">
          <Link2OffIcon /> Disconnect
        </SubmitButton>
        {!canUnlink && <span className="text-xs text-muted-foreground">Set a password first so you can still sign in.</span>}
        {!state.ok && state.error && <FormAlert state={state} className="w-full" />}
      </form>
    );
  }
  return (
    <form action={linkGoogle}>
      <SubmitButton variant="outline" pendingText="Redirecting…">
        <Link2Icon /> Connect Google
      </SubmitButton>
    </form>
  );
}

export function ExportButton() {
  return (
    <Button variant="outline" render={<a href="/api/account/export" download />}>
      <DownloadIcon /> Download my data (JSON)
    </Button>
  );
}

export function DeleteAccountForm() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = confirm.trim().toLowerCase() === "delete my account";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setBusy(false);
      return;
    }
    toast.success("Your account is deleted. Take care.");
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p>
          This permanently deletes your account, profile, needs, photos, and your side of every conversation. If you're
          currently helping someone, that need reopens for another neighbor. This can't be undone.
        </p>
      </div>
      <Field>
        <FieldLabel htmlFor="confirm">
          Type <span className="font-mono">delete my account</span> to confirm
        </FieldLabel>
        <Input id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
      </Field>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="destructive" disabled={!ready || busy}>
        {busy ? "Deleting…" : "Delete my account"}
      </Button>
    </form>
  );
}
