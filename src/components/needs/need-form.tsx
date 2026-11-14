"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ImageIcon, XIcon } from "lucide-react";
import { createNeed, updateNeed } from "@/lib/actions/needs";
import { idle } from "@/lib/action-result";
import { CATEGORIES, CATEGORY_META, FULFILLMENTS, FULFILLMENT_META, URGENCIES, URGENCY_META, type Fulfillment } from "@/lib/needs/constants";
import type { NeedRow } from "@/lib/supabase/database.types";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError, fieldValue } from "@/components/forms/form-alert";
import { cn } from "@/lib/utils";

export function NeedForm({ need, photoUrl }: { need?: NeedRow; photoUrl?: string | null }) {
  const editing = !!need;
  const [state, action] = useActionState(editing ? updateNeed : createNeed, idle);
  const [fulfillment, setFulfillment] = useState<Fulfillment>((fieldValue(state, "fulfillment", need?.fulfillment ?? "in_person") as Fulfillment) || "in_person");
  const [category, setCategory] = useState(fieldValue(state, "category", need?.category ?? ""));
  const [urgency, setUrgency] = useState(fieldValue(state, "urgency", need?.urgency ?? "normal"));
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const wantsWishlist = fulfillment !== "in_person";

  return (
    <form action={action} className="space-y-8" noValidate encType="multipart/form-data">
      {editing && <input type="hidden" name="id" value={need.id} />}
      <FormAlert state={state} />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">What do you need?</FieldLabel>
          <Input id="title" name="title" maxLength={80} placeholder="Size 4 diapers, two boxes" required defaultValue={fieldValue(state, "title", need?.title)} className="h-10 text-base" />
          <FieldDescription>One specific thing. Sizes and quantities help a lot.</FieldDescription>
          <FieldError errors={fieldError(state, "title")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">A little context</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            maxLength={1000}
            placeholder="Any brand is fine. We're between paychecks and this would carry us to the end of the month."
            required
            defaultValue={fieldValue(state, "description", need?.description)}
          />
          <FieldDescription>You don't owe anyone your whole story. Just enough so a neighbor picks the right thing. Never include your address.</FieldDescription>
          <FieldError errors={fieldError(state, "description")} />
        </Field>
      </FieldGroup>

      <fieldset>
        <legend className="text-sm font-medium">Category</legend>
        <input type="hidden" name="category" value={category} />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIES.map((c) => {
            const meta = CATEGORY_META[c];
            const Icon = meta.icon;
            const on = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCategory(c)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                  on && "border-foreground bg-foreground text-background hover:bg-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
        <FieldError className="mt-2" errors={fieldError(state, "category")} />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">How soon?</legend>
        <input type="hidden" name="urgency" value={urgency} />
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {URGENCIES.map((u) => {
            const on = urgency === u;
            return (
              <button
                key={u}
                type="button"
                aria-pressed={on}
                onClick={() => setUrgency(u)}
                className={cn("rounded-xl border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted", on && "border-foreground ring-1 ring-foreground")}
              >
                <span className="block text-sm font-medium">{URGENCY_META[u].label}</span>
                <span className="block text-xs text-muted-foreground">{URGENCY_META[u].hint}</span>
              </button>
            );
          })}
        </div>
        <FieldError className="mt-2" errors={fieldError(state, "urgency")} />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">How would you like to receive it?</legend>
        <input type="hidden" name="fulfillment" value={fulfillment} />
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {FULFILLMENTS.map((f) => {
            const on = fulfillment === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFulfillment(f)}
                className={cn("rounded-xl border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted", on && "border-foreground ring-1 ring-foreground")}
              >
                <span className="block text-sm font-medium">{FULFILLMENT_META[f].label}</span>
                <span className="block text-xs text-muted-foreground">{FULFILLMENT_META[f].hint}</span>
              </button>
            );
          })}
        </div>
        <FieldError className="mt-2" errors={fieldError(state, "fulfillment")} />

        {wantsWishlist && (
          <Field className="mt-4">
            <FieldLabel htmlFor="wishlistUrl">Wishlist link</FieldLabel>
            <Input id="wishlistUrl" name="wishlistUrl" type="url" inputMode="url" placeholder="https://www.amazon.com/hz/wishlist/ls/…" defaultValue={fieldValue(state, "wishlistUrl", need?.wishlist_url ?? "")} />
            <FieldDescription>An Amazon, Target or Walmart list works great. Set the shipping address on the store side, never here.</FieldDescription>
            <FieldError errors={fieldError(state, "wishlistUrl")} />
          </Field>
        )}
        {fulfillment !== "wishlist" && (
          <p className="mt-4 rounded-xl border border-brand/40 bg-brand-soft px-3.5 py-3 text-sm text-brand-text">
            For drop-offs, you'll agree on a public meeting spot in private messages after someone offers. Nothing about
            where you live goes on the post.
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Photo (optional)</legend>
        <p className="mt-1 text-xs text-muted-foreground">A picture of the item, size tag, or empty shelf. Skip anything that shows your home or kids' faces.</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {(preview || (photoUrl && !removePhoto)) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview ?? photoUrl ?? ""} alt="" className="size-24 rounded-xl border object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
            <ImageIcon className="size-4" />
            {preview || (photoUrl && !removePhoto) ? "Change photo" : "Add a photo"}
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
                setRemovePhoto(false);
              }}
            />
          </label>
          {editing && photoUrl && !preview && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox name="removePhoto" checked={removePhoto} onCheckedChange={(v) => setRemovePhoto(!!v)} />
              Remove photo
            </label>
          )}
          {preview && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(null)}>
              <XIcon /> Clear
            </Button>
          )}
        </div>
        <FieldError className="mt-2" errors={fieldError(state, "photo")} />
      </fieldset>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          By posting you agree to the{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Terms
          </Link>
          . No cash requests, no addresses.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" render={<Link href={editing ? `/needs/${need.id}` : "/needs"} />}>
            Cancel
          </Button>
          <SubmitButton size="lg" pendingText={editing ? "Saving…" : "Posting…"}>
            {editing ? "Save changes" : "Post my need"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
