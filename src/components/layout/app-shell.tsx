import { Header } from "./header";
import { SiteFooter } from "./site-footer";
import { Container } from "./container";
import { NotificationBell } from "@/components/notifications/bell";
import { getUser } from "@/lib/auth/server";
import { unreadCounts } from "@/lib/messages/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Page frame for the signed-in parts of the site (and the public feed).
export async function AppShell({
  children,
  size = "lg",
  className,
}: {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const user = await getUser();
  const counts = user && isSupabaseConfigured() ? await unreadCounts(user.id) : null;
  return (
    <>
      <Header right={user ? <NotificationBell userId={user.id} initialCount={counts?.notifications ?? 0} /> : null} />
      <main className="flex-1">
        <Container size={size} className={className ?? "py-8 sm:py-10"}>
          {children}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
