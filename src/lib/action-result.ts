// Shape every form server action returns to useActionState.
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined>; values?: Record<string, string> };

export const idle: ActionResult<never> = { ok: false };

export function fail(error: string, extra: Partial<Extract<ActionResult, { ok: false }>> = {}): ActionResult<never> {
  return { ok: false, error, ...extra };
}

// Keep what the person typed so a failed submit doesn't wipe the form.
export function keepValues(formData: FormData, keys: string[]) {
  const values: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") values[k] = v;
  }
  return values;
}
