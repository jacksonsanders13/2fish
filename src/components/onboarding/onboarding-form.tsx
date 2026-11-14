"use client";

import { useActionState } from "react";
import Link from "next/link";
import { completeOnboarding } from "@/lib/actions/profile";
import { idle } from "@/lib/action-result";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError, fieldValue } from "@/components/forms/form-alert";

export function OnboardingForm({
  defaults,
  needsTerms,
  next,
}: {
  defaults: { displayName: string; area: string; zip: string };
  needsTerms: boolean;
  next?: string;
}) {
  const [state, action] = useActionState(completeOnboarding, idle);
  return (
    <form action={action} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <FormAlert state={state} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="displayName">First name or nickname</FieldLabel>
          <Input id="displayName" name="displayName" maxLength={40} required defaultValue={fieldValue(state, "displayName", defaults.displayName)} />
          <FieldDescription>What neighbors will see on your posts and messages.</FieldDescription>
          <FieldError errors={fieldError(state, "displayName")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="zip">ZIP code</FieldLabel>
          <Input id="zip" name="zip" inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" required defaultValue={fieldValue(state, "zip", defaults.zip)} />
          <FieldDescription>
            We turn this into a rough map point (about a kilometer wide) so needs can be sorted by distance. We never
            ask for, or store, a street address.
          </FieldDescription>
          <FieldError errors={fieldError(state, "zip")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="area">Neighborhood or city (optional)</FieldLabel>
          <Input id="area" name="area" maxLength={60} placeholder="North Raleigh" defaultValue={fieldValue(state, "area", defaults.area)} />
          <FieldDescription>Shown on your posts, e.g. “Midtown” or “Garner”.</FieldDescription>
          <FieldError errors={fieldError(state, "area")} />
        </Field>
        {needsTerms && (
          <>
            <Field orientation="horizontal">
              <Checkbox id="over18" name="over18" />
              <FieldLabel htmlFor="over18" className="font-normal leading-snug text-muted-foreground">
                <span>
                  I'm 18 or older and I agree to the{" "}
                <Link href="/terms" className="text-foreground underline underline-offset-4" target="_blank">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-foreground underline underline-offset-4" target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
              </FieldLabel>
            </Field>
            <FieldError errors={fieldError(state, "over18")} />
          </>
        )}
      </FieldGroup>
      <SubmitButton size="lg" className="w-full" pendingText="Saving…">
        Continue
      </SubmitButton>
    </form>
  );
}
