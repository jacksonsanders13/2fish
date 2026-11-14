"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CameraIcon, Trash2Icon } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { removeAvatar, setEmailNotifications, uploadAvatar } from "@/lib/actions/account";
import { idle, type ActionResult } from "@/lib/action-result";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError, fieldValue } from "@/components/forms/form-alert";
import { initials } from "@/lib/format";

function useToast(state: ActionResult) {
  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.error && !state.fieldErrors) toast.error(state.error);
  }, [state]);
}

export function AvatarForm({ profile, avatarUrl }: { profile: ProfileRow; avatarUrl: string | null }) {
  const [upState, upAction] = useActionState(uploadAvatar, idle);
  const [rmState, rmAction] = useActionState(removeAvatar, idle);
  const formRef = useRef<HTMLFormElement>(null);
  useToast(upState);
  useToast(rmState);

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar className="size-20">
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback className="text-2xl">{initials(profile.display_name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-wrap gap-2">
        <form ref={formRef} action={upAction}>
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium hover:bg-muted">
            <CameraIcon className="size-4" />
            {avatarUrl ? "Change photo" : "Add a photo"}
            <input
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={() => formRef.current?.requestSubmit()}
            />
          </label>
        </form>
        {avatarUrl && (
          <form action={rmAction}>
            <SubmitButton variant="ghost" size="default" className="text-muted-foreground" pendingText="Removing…">
              <Trash2Icon /> Remove
            </SubmitButton>
          </form>
        )}
      </div>
      <p className="w-full text-xs text-muted-foreground">JPG, PNG or WebP, up to 2 MB. A face isn't required. A plant or a pet works too.</p>
    </div>
  );
}

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [state, action] = useActionState(updateProfile, idle);
  useToast(state);
  return (
    <form action={action} className="space-y-5" noValidate>
      {!state.ok && state.fieldErrors && <FormAlert state={state} />}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="displayName">Display name</FieldLabel>
          <Input id="displayName" name="displayName" maxLength={40} required defaultValue={fieldValue(state, "displayName", profile.display_name)} />
          <FieldError errors={fieldError(state, "displayName")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="zip">ZIP code</FieldLabel>
            <Input id="zip" name="zip" inputMode="numeric" maxLength={5} required defaultValue={fieldValue(state, "zip", profile.zip ?? "")} />
            <FieldDescription>Only a rounded map point is stored.</FieldDescription>
            <FieldError errors={fieldError(state, "zip")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="area">Neighborhood or city</FieldLabel>
            <Input id="area" name="area" maxLength={60} placeholder="North Raleigh" defaultValue={fieldValue(state, "area", profile.area ?? "")} />
            <FieldError errors={fieldError(state, "area")} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="bio">Short bio (optional)</FieldLabel>
          <Textarea id="bio" name="bio" rows={3} maxLength={280} placeholder="Mom of two, happy to help with baby stuff." defaultValue={fieldValue(state, "bio", profile.bio ?? "")} />
          <FieldDescription>Shown on your public profile. Keep it general.</FieldDescription>
          <FieldError errors={fieldError(state, "bio")} />
        </Field>
      </FieldGroup>
      <SubmitButton pendingText="Saving…">Save profile</SubmitButton>
    </form>
  );
}

export function NotificationsForm({ enabled, emailConfigured }: { enabled: boolean; emailConfigured: boolean }) {
  const [state, action] = useActionState(setEmailNotifications, idle);
  const formRef = useRef<HTMLFormElement>(null);
  useToast(state);
  return (
    <form ref={formRef} action={action} className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">Email me when something happens</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Someone offers to help, or sends a message. In-app notifications are always on.
          {!emailConfigured && " (Email delivery isn't set up on this server yet.)"}
        </p>
      </div>
      <Switch name="emailNotifications" defaultChecked={enabled} onCheckedChange={() => formRef.current?.requestSubmit()} aria-label="Email notifications" />
    </form>
  );
}

export function DangerZoneNote() {
  return (
    <Button variant="outline" render={<a href="/settings/data" />}>
      Download or delete your data
    </Button>
  );
}
