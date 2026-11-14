import { cn } from "@/lib/utils";

export function SettingsSection({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-soft sm:p-6", danger && "border-destructive/40")}>
      <h2 className={cn("text-base font-semibold", danger && "text-destructive")}>{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
