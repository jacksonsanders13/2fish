"use client";

import { useActionState } from "react";
import { forgotPassword, resendConfirmation, resetPassword } from "@/lib/actions/auth";
import { idle } from "@/lib/action-result";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError } from "@/components/forms/form-alert";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPassword, idle);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError errors={fieldError(state, "email")} />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingText="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPassword, idle);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormAlert state={state} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <FieldDescription>At least 8 characters.</FieldDescription>
          <FieldError errors={fieldError(state, "password")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
          <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
          <FieldError errors={fieldError(state, "confirm")} />
        </Field>
      </FieldGroup>
      <SubmitButton size="lg" className="w-full" pendingText="Saving…">
        Save new password
      </SubmitButton>
    </form>
  );
}

export function ResendConfirmationForm({ email }: { email: string }) {
  const [state, action] = useActionState(resendConfirmation, idle);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="email" value={email} />
      <FormAlert state={state} />
      <SubmitButton variant="outline" className="w-full" pendingText="Sending…">
        Resend the email
      </SubmitButton>
    </form>
  );
}
