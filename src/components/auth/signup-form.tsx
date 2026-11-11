"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { idle } from "@/lib/action-result";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError, fieldValue } from "@/components/forms/form-alert";
import { OrDivider } from "./auth-card";
import { GoogleButton } from "./google-button";

export function SignupForm() {
  const [state, action] = useActionState(signUp, idle);

  return (
    <div>
      <GoogleButton next="/onboarding" label="Sign up with Google" />
      <OrDivider />
      <form action={action} className="space-y-4" noValidate>
        <FormAlert state={state} />
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="displayName">First name or nickname</FieldLabel>
            <Input id="displayName" name="displayName" autoComplete="given-name" maxLength={40} required defaultValue={fieldValue(state, "displayName")} />
            <FieldDescription>This is what neighbors see. No last name needed.</FieldDescription>
            <FieldError errors={fieldError(state, "displayName")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={fieldValue(state, "email")} />
            <FieldError errors={fieldError(state, "email")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <FieldDescription>At least 8 characters.</FieldDescription>
            <FieldError errors={fieldError(state, "password")} />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="over18" name="over18" />
            <FieldLabel htmlFor="over18" className="font-normal leading-snug text-muted-foreground">
              I'm 18 or older and I agree to the{" "}
              <Link href="/terms" className="text-foreground underline underline-offset-4" target="_blank">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-foreground underline underline-offset-4" target="_blank">
                Privacy Policy
              </Link>
              .
            </FieldLabel>
          </Field>
          <FieldError errors={fieldError(state, "over18")} />
        </FieldGroup>
        <SubmitButton size="lg" className="w-full" pendingText="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </div>
  );
}
