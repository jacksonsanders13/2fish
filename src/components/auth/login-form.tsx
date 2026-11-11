"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { sendMagicLink, signInWithPassword } from "@/lib/actions/auth";
import { idle } from "@/lib/action-result";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError, fieldValue } from "@/components/forms/form-alert";
import { OrDivider } from "./auth-card";
import { GoogleButton } from "./google-button";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction] = useActionState(signInWithPassword, initialError ? { ok: false, error: initialError } : idle);
  const [mlState, mlAction] = useActionState(sendMagicLink, idle);

  return (
    <div>
      <GoogleButton next={next} />
      <OrDivider />

      {mode === "password" ? (
        <form action={pwAction} className="space-y-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}
          <FormAlert state={pwState} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={fieldValue(pwState, "email")} />
              <FieldError errors={fieldError(pwState, "email")} />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                  Forgot it?
                </Link>
              </div>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
              <FieldError errors={fieldError(pwState, "password")} />
            </Field>
          </FieldGroup>
          <SubmitButton size="lg" className="w-full" pendingText="Signing in…">
            Sign in
          </SubmitButton>
          <Button type="button" variant="link" className="w-full text-muted-foreground" onClick={() => setMode("magic")}>
            Email me a sign-in link instead
          </Button>
        </form>
      ) : (
        <form action={mlAction} className="space-y-4" noValidate>
          {next && <input type="hidden" name="next" value={next} />}
          <FormAlert state={mlState} />
          <Field>
            <FieldLabel htmlFor="ml-email">Email</FieldLabel>
            <Input id="ml-email" name="email" type="email" autoComplete="email" required />
            <FieldError errors={fieldError(mlState, "email")} />
          </Field>
          <SubmitButton size="lg" className="w-full" pendingText="Sending…">
            Send sign-in link
          </SubmitButton>
          <Button type="button" variant="link" className="w-full text-muted-foreground" onClick={() => setMode("password")}>
            Use a password instead
          </Button>
        </form>
      )}
    </div>
  );
}
