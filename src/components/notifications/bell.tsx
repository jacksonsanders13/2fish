"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";

// Unread count from the server, then live updates over Supabase Realtime.
export function NotificationBell({ userId, initialCount }: { userId: string; initialCount: number }) {
  // server count + anything that arrived live since the page rendered
  const [live, setLive] = useState(0);
  const [base, setBase] = useState(initialCount);
  if (base !== initialCount) {
    setBase(initialCount);
    setLive(0);
  }
  const count = initialCount + live;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as NotificationRow;
          setLive((c) => c + 1);
          toast(n.title, {
            description: n.body ?? undefined,
            action: n.href ? { label: "Open", onClick: () => (window.location.href = n.href!) } : undefined,
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <Button variant="ghost" size="icon" className="relative" render={<Link href="/notifications" />} aria-label={count ? `${count} unread notifications` : "Notifications"}>
      <BellIcon />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
